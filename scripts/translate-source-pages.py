"""Persist page translations in a resumable cache; never translate personal sheet data."""
import concurrent.futures,hashlib,json,re,sys,time,urllib.parse,urllib.request
from pathlib import Path

def translate(text,source,target):
 url='https://translate.googleapis.com/translate_a/single?'+urllib.parse.urlencode({'client':'gtx','sl':source,'tl':target,'dt':'t','q':text})
 for attempt in range(6):
  try:
   with urllib.request.urlopen(url,timeout=45) as response:data=json.load(response)
   result=''.join(part[0] or '' for part in data[0])
   if not result.strip():raise ValueError('Empty translation')
   return result
  except Exception:
   if attempt==5:raise
   time.sleep(2**attempt)

def page(job):
 file,lang,output=job;data=json.loads(file.read_text(encoding='utf-8'));target='pt' if lang=='en' else 'en';dest=output/data['book']/file.name
 digest=hashlib.sha256(data['content'].encode()).hexdigest()
 if dest.exists() and json.loads(dest.read_text(encoding='utf-8')).get('sourceHash')==digest:return data['book'],data['pdfPage'],'cached'
 pieces=[];current=''
 for paragraph in data['content'].split('\n\n'):
  if len(current)+len(paragraph)>3200:
   if current:pieces.append(current);current=''
   while len(paragraph)>3200:
    cut=paragraph.rfind(' ',0,3200);cut=cut if cut>0 else 3200;pieces.append(paragraph[:cut]);paragraph=paragraph[cut:].lstrip()
  current+=('\n\n' if current else '')+paragraph
 if current:pieces.append(current)
 translated='\n\n'.join(translate(piece,lang,target) for piece in pieces)
 # Flag numeric differences for editorial checking. Never silently discard exceptions.
 original_numbers=re.findall(r'\b\d+\b',data['content']);translated_numbers=re.findall(r'\b\d+\b',translated)
 result={'book':data['book'],'pdfPage':data['pdfPage'],'sourceHash':digest,'sourceLanguage':lang,'targetLanguage':target,'content':translated,'numberReviewRequired':original_numbers!=translated_numbers,'method':'google-translate-cached-editorial-review-required'}
 dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8');return data['book'],data['pdfPage'],'translated'

if __name__=='__main__':
 root=Path(sys.argv[1]);out=Path(sys.argv[2]);books=sys.argv[3:];jobs=[]
 files={'core-v5':'pt','chicago-by-night-v5':'en','camarilla-v5':'pt','anarch-v5':'pt','cultos-deuses-sangue-v5':'pt','companion-v5':'pt','sabbat-black-hand-v5':'en','players-guide-v5':'en','gehenna-war-v5':'en','sigilos-de-sangue-v5':'pt','let-the-streets-run-red-v5':'en'}
 for book,lang in files.items():
  if books and book not in books:continue
  jobs.extend((file,lang,out) for file in sorted((root/book).glob('*.json')))
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  for i,result in enumerate(pool.map(page,jobs),1):
   if i%10==0 or i==len(jobs):print(f'{i}/{len(jobs)} {result}',flush=True)
