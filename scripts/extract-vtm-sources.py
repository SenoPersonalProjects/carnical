"""Extract supplied PDFs into a reproducible page cache. Original PDFs stay read-only."""
from pathlib import Path
import concurrent.futures, hashlib, json, re, statistics, sys, unicodedata
import pymupdf as fitz

FILES={
 'core-v5':('Vampiro a Mascara Corebook 5ED PORTUGUES.pdf','pt',True),
 'chicago-by-night-v5':('vampiro-a-mascara---chicago-by-night-v5.pdf','en',False),
 'camarilla-v5':('597014098-Vampiro-a-Mascara-V5-Camarilla.pdf','pt',False),
 'anarch-v5':('anarch.pdf','pt',True),
 'cultos-deuses-sangue-v5':('706383045-v5-Cultos-Dos-Deuses-de-Sangue-Em-Portugues-min.pdf','pt',True),
 'companion-v5':('companion-v5-ptbr.pdf','pt',False),
 'sabbat-black-hand-v5':('Sabbat, the Black Hand.pdf','en',False),
 'players-guide-v5':("VTM 5e - Player's Guide.pdf",'en',False),
 'gehenna-war-v5':('V5 - Gehenna War (Digital).pdf','en',False),
 'sigilos-de-sangue-v5':('V5-Sigilos-de-Sangue-PT-BR.pdf','pt',False),
 'let-the-streets-run-red-v5':('vampiro-a-mascara---let-the-streets-run-red-v5.pdf','en',False),
}

def clean(text):
 text=unicodedata.normalize('NFKC',text).replace('\u00ad','')
 text=re.sub(r'(?<=\w)\ufffd(?=\w)',"'",text)
 text=re.sub(r'^\ufffd\s*','• ',text)
 return text.replace('\ufffd','—').strip()

def lines_from(page,textpage=None):
 result=[]
 for block in page.get_text('dict',textpage=textpage)['blocks']:
  for line in block.get('lines',[]):
   spans=line['spans'];text=clean(''.join(s['text'] for s in spans))
   if text:result.append({'text':text,'bbox':list(line['bbox']),'size':max(s['size'] for s in spans),'font':spans[0]['font']})
 return result

def read_page(job):
 book,file,lang,ocr,index,output,tessdata=job
 target=Path(output)/book/f'{index+1:04}.json'
 version=5 if book=='let-the-streets-run-red-v5' else 6 if book=='companion-v5' else 4 if book=='cultos-deuses-sangue-v5' else 2 if ocr else 4
 if target.exists() and json.loads(target.read_text(encoding='utf-8')).get('extractionVersion')==version:return book,index+1,'cached'
 doc=fitz.open(file);page=doc[index];method='native-text-with-layout';detected_columns=1
 lines=lines_from(page)
 folios=[l for l in lines if l['bbox'][1]>page.rect.height-65 and re.fullmatch(r'\d(?:\s*\d){0,3}',l['text'])]
 folio=max(folios,key=lambda l:l['bbox'][1]) if folios else None
 printed=int(re.sub(r'\s+','',folio['text'])) if folio else index-1 if book in ['core-v5','players-guide-v5'] and index>3 else index if book in ['chicago-by-night-v5','let-the-streets-run-red-v5'] and index>3 else None
 if ocr:
  # Read columns independently: full-page OCR can join lines from adjacent columns.
  native=lines
  starts=[round(l['bbox'][0]/5)*5 for l in native if len(l['text'])>25 and l['bbox'][1]>45 and l['bbox'][3]<page.rect.height-45]
  if book=='core-v5' and starts:
   buckets={v:starts.count(v) for v in set(starts)}
   peaks=[]
   for x in sorted(buckets,key=buckets.get,reverse=True):
    if all(abs(x-y)>65 for y in peaks):peaks.append(x)
    if len(peaks)==3:break
   peaks.sort()
   if len(peaks)==3 and peaks[-1]-peaks[0]>230:
    starts_min=[min(x for x in starts if abs(x-peak)<40) for peak in peaks]
    bounds=[max(0,starts_min[0]-8),starts_min[1]-6,starts_min[2]-6,min(page.rect.width,peaks[-1]+160)]
   else:bounds=[24,page.rect.width/2,page.rect.width-24]
  else:bounds=[24,page.rect.width/2-(20 if book=='cultos-deuses-sangue-v5' else 0),page.rect.width-24]
  lines=[]
  for left,right in zip(bounds,bounds[1:]):
   pix=page.get_pixmap(matrix=fitz.Matrix(3.2,3.2),clip=fitz.Rect(left,38,right,page.rect.height-30),alpha=False)
   with fitz.open('pdf',pix.pdfocr_tobytes(language='por+eng' if lang=='pt' else 'eng',tessdata=tessdata)) as temp:
    scale_x=(right-left)/temp[0].rect.width;scale_y=(page.rect.height-68)/temp[0].rect.height
    for l in lines_from(temp[0]):
     l['bbox']=[l['bbox'][0]*scale_x+left,l['bbox'][1]*scale_y+38,l['bbox'][2]*scale_x+left,l['bbox'][3]*scale_y+38];l['size']*=scale_y;lines.append(l)
  method='column-ocr-tesseract-best-230dpi'
 else:
  # Multi-column body first; full-width headings retain their position before the columns.
  body=[l for l in lines if len(l['text'])>30 and 35<l['bbox'][1]<page.rect.height-30]
  if body and book in ['companion-v5','let-the-streets-run-red-v5']:
   # The Companion switches between two and three columns, including pages
   # with artwork spanning the latter two. A fixed center split interleaves
   # the Bane and Compulsion on p. 15 and corrupts their meaning.
   starts=[round(l['bbox'][0]/5)*5 for l in lines if len(l['text'])>18 and 35<l['bbox'][1]<page.rect.height-30]
   buckets={x:starts.count(x) for x in set(starts)};peaks=[]
   for x in sorted(buckets,key=buckets.get,reverse=True):
    if buckets[x]>=4 and all(abs(x-other)>65 for other in peaks):peaks.append(x)
    if len(peaks)==3:break
   peaks.sort()
   detected_columns=max(1,len(peaks))
   if len(peaks)>=2:
    groups=[[] for _ in peaks]
    for line in lines:
     column=min(range(len(peaks)),key=lambda i:abs(line['bbox'][0]-peaks[i]));groups[column].append(line)
    lines=[line for group in groups for line in sorted(group,key=lambda l:(l['bbox'][1],l['bbox'][0]))]
   else:lines.sort(key=lambda l:(l['bbox'][1],l['bbox'][0]))
  elif body:
   split=page.rect.width/2
   groups=[[],[]]
   for l in lines:
    groups[int(l['bbox'][0]>=split-10)].append(l)
   lines=sorted(groups[0],key=lambda l:(l['bbox'][1],l['bbox'][0]))+sorted(groups[1],key=lambda l:(l['bbox'][1],l['bbox'][0]))
  else:lines.sort(key=lambda l:(l['bbox'][1],l['bbox'][0]))
 # Drop repeating running headers and page numbers, preserving actual rule content.
 lines=[l for l in lines if 30<l['bbox'][1]<page.rect.height-28 and not (l['bbox'][1]>page.rect.height-65 and re.fullmatch(r'\d(?:\s*\d){0,3}',l['text'])) and not (l['bbox'][0]>page.rect.width-65 and l['bbox'][1]<110)]
 if book=='let-the-streets-run-red-v5':
  running={'letthestreetsrunred','powerprey','thedyingfields','innocenceinblood','rustedjungle','kindredbiographies','loresheetsandbackgrounds','readymadecharacters','introduction','debtsrepaid'}
  lines=[line for line in lines if not (line['bbox'][1]<50 and re.sub(r'[^a-z]','',line['text'].lower()) in running)]
 body_sizes=[l['size'] for l in lines if len(l['text'])>20];body_size=statistics.median(body_sizes) if body_sizes else 10
 chunks=[];paragraph=[]
 def flush():
  if paragraph:
   text=' '.join(paragraph);text=re.sub(r'([A-Za-zÀ-ÿ])-\s+([a-zà-ÿ])',r'\1\2',text);chunks.append(re.sub(r'\s+',' ',text));paragraph.clear()
 for n,l in enumerate(lines):
  text=l['text'];property_label=re.match(r'^(?:Cost|Custo|System|Sistema|Duration|Duração|Dice Pools?|Paradas? de Dados|Amalgam|Amálgama|Prerequisite|Pré-requisito|Ingredients|Ingredientes|Process|Processo)\s*:',text,re.I)
  heading=not property_label and len(text)<115 and (l['size']>=body_size*1.22 or (len(text)<75 and 'Bold' in l['font']) or (text.isupper() and len(text)>3))
  if heading:flush();chunks.append('## '+text)
  elif re.match(r'^(?:•|■|\*)\s',text):flush();chunks.append('- '+re.sub(r'^[•■*]\s*','',text))
  else:
   if n and (l['bbox'][1]-lines[n-1]['bbox'][3]>7 or abs(l['bbox'][0]-lines[n-1]['bbox'][0])>100):flush()
   if re.match(r'^(Cost|Custo|System|Sistema|Duration|Duração|Dice Pool|Parada|Amalgam|Amálgama|Prerequisite|Pré-requisito|Ingredients|Ingredientes|Process|Processo)\s*:',text,re.I):flush()
   paragraph.append(text)
 flush()
 content='\n\n'.join(chunks);format_changes=[]
 if not ocr:
  unique=[]
  for chunk in chunks:
   if unique and chunk.startswith('## ') and unique[-1]==chunk:
    if 'deduplicated-overprinted-headings' not in format_changes:format_changes.append('deduplicated-overprinted-headings')
    continue
   unique.append(chunk)
  content='\n\n'.join(unique)
  separated=re.sub(r'(?<!•)•\s+(?=(?:Add|Gain|Choose|Take|Adicione|Ganhe|Escolha)\b)','\n\n- ',content)
  if separated!=content:format_changes.append('separated-predator-benefit-bullets');content=separated
  fields={'standard dice pools':'Standard Dice Pools','secondary attributes':'Secondary Attributes','exceptional dice pools':'Exceptional Dice Pools','general difficulties':'General Difficulties'}
  for field,title in fields.items():
   separated=re.sub(r'(?:^|\s+)'+re.escape(field)+r':\s*',lambda match:'\n\n'+title+': ',content,flags=re.I)
   if separated!=content and 'separated-stat-fields' not in format_changes:format_changes.append('separated-stat-fields')
   content=separated
  content=content.strip()
  if book=='let-the-streets-run-red-v5':
   repaired=re.sub(r'(?<=\w)-\n\n(?=[a-z])','',content)
   if repaired!=content:format_changes.append('joined-column-continuations');content=repaired
 data={'extractionVersion':version,'book':book,'pdfPage':index+1,'printedPage':printed,'method':method,'detectedColumns':detected_columns,'formatChanges':format_changes,'lines':lines,'content':content,'empty':not bool(lines)}
 target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
 doc.close();return book,index+1,method

if __name__=='__main__':
 pdf_root=Path(sys.argv[1]);output=Path(sys.argv[2]);tessdata=sys.argv[3];selected=[arg for arg in sys.argv[4:] if arg!='--manifest-only']
 manifest=[];jobs=[]
 for book,(name,lang,ocr) in FILES.items():
  if selected and book not in selected:continue
  file=pdf_root/name;doc=fitz.open(file)
  manifest.append({'id':book,'file':name,'language':lang,'pages':len(doc),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'toc':doc.get_toc()})
  jobs.extend((book,str(file),lang,ocr,i,str(output),tessdata) for i in range(len(doc)));doc.close()
 output.mkdir(parents=True,exist_ok=True)
 manifest_file=output/'manifest.json'
 if selected and manifest_file.exists():
  previous={row['id']:row for row in json.loads(manifest_file.read_text(encoding='utf-8'))};previous.update({row['id']:row for row in manifest});manifest=[previous[book] for book in FILES if book in previous]
 manifest_file.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 if '--manifest-only' in sys.argv:sys.exit(0)
 with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:
  for count,(book,page,method) in enumerate(pool.map(read_page,jobs,chunksize=1),1):
   if count%25==0 or count==len(jobs):print(f'{count}/{len(jobs)} {book} p{page} {method}',flush=True)
