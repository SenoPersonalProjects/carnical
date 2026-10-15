"""Generate persisted EN/PT reference translations with local OPUS-MT weights.

Models are supplied outside the repository. Numeric discrepancies are reported
for editorial review, not silently accepted as a faithful rules translation.
"""
import hashlib,json,re,sys
from pathlib import Path
import ctranslate2,sentencepiece
import runpy
TERMS=runpy.run_path(str(Path(__file__).with_name('translate-source-pages-glossary.py')))['TERMS']
STAT_FIELDS={'Standard Dice Pools':'Paradas Padrão','Secondary Attributes':'Atributos Secundários','Exceptional Dice Pools':'Paradas Excepcionais','General Difficulties':'Dificuldades Gerais'}
STAT_TERMS={**TERMS,'Physical':'Físicos','Social':'Sociais','Mental':'Mentais','Health':'Vitalidade','Willpower':'Força de Vontade','or':'ou','and':'e'}

BOOK_LANG={'core-v5':'pt','chicago-by-night-v5':'en','camarilla-v5':'pt','anarch-v5':'pt','cultos-deuses-sangue-v5':'pt','companion-v5':'pt','sabbat-black-hand-v5':'en','players-guide-v5':'en','gehenna-war-v5':'en','sigilos-de-sangue-v5':'pt','let-the-streets-run-red-v5':'en'}

class Translator:
 def __init__(self,root,source):
  pair='tc-big-en-pt' if source=='en' else 'ROMANCE-en'
  self.source=source
  self.engine=ctranslate2.Translator(str(root/f'{pair}-ct2'),device='cpu',compute_type='int8',inter_threads=1,intra_threads=6)
  self.encoder=sentencepiece.SentencePieceProcessor(model_file=str(root/pair/'source.spm'))
  self.decoder=sentencepiece.SentencePieceProcessor(model_file=str(root/pair/'target.spm'))
 def translate(self,text):
  chunks=[];positions=[]
  for paragraph in text.split('\n\n'):
   fields=STAT_FIELDS if self.source=='en' else {value:key for key,value in STAT_FIELDS.items()}
   stat=next(((original,target) for original,target in fields.items() if paragraph.startswith(original+':')),None)
   if stat:
    body=paragraph[len(stat[0])+1:].strip();terms=STAT_TERMS if self.source=='en' else {value:key for key,value in STAT_TERMS.items()}
    for original,target in sorted(terms.items(),key=lambda item:len(item[0]),reverse=True):body=re.sub(r'\b'+re.escape(original)+r'\b',lambda _:target,body,flags=re.I)
    positions.append(('',[],stat[1]+': '+body));continue
   prefix=re.match(r'^(#{1,6}\s+|-\s+)',paragraph);prefix=prefix[0] if prefix else '';body=paragraph[len(prefix):]
   glossary=TERMS if self.source=='en' else {value:key for key,value in TERMS.items()}
   if self.source=='en':body=re.sub(r'\b(a|one|each|every|any) Kindred\b',lambda match:match[1]+' Membro',body)
   # Proper game terms enter the model in the target glossary vocabulary.
   # Case-sensitive matching keeps ordinary uses of words such as craft intact.
   for original,target in sorted(glossary.items(),key=lambda item:len(item[0]),reverse=True):body=re.sub(r'\b'+re.escape(original)+r'\b',lambda _:target,body)
   sentences=re.split(r'(?<=[.!?])\s+(?=[A-ZÀ-Ÿ])',body)
   tokens=[]
   for sentence in sentences:
    encoded=self.encoder.encode(sentence,out_type=str)
    for start in range(0,len(encoded),220):
     part=encoded[start:start+220];chunks.append((['>>pob<<'] if self.source=='en' else [])+part);tokens.append(len(chunks)-1)
   positions.append((prefix,tokens,None))
  results=self.engine.translate_batch(chunks,max_batch_size=24,beam_size=2,max_decoding_length=400) if chunks else []
  translated=[self.decoder.decode(result.hypotheses[0]) for result in results]
  output='\n\n'.join(fixed if fixed is not None else prefix+' '.join(translated[i] for i in tokens) for prefix,tokens,fixed in positions)
  glossary=TERMS if self.source=='en' else {value:key for key,value in TERMS.items()}
  for original,target in sorted(glossary.items(),key=lambda item:len(item[0]),reverse=True):
   output=re.sub(r'\b'+re.escape(original)+r'\b',lambda _:target,output,flags=re.I)
  if self.source=='en' and re.search(r'\bFortitude\b',text):output=re.sub(r'\bFortaleza\b','Fortitude',output)
  return output

if __name__=='__main__':
 root=Path(sys.argv[1]);out=Path(sys.argv[2]);models=Path(sys.argv[3]);selected=sys.argv[4:];engines={};count=0
 for book,language in BOOK_LANG.items():
  if selected and book not in selected:continue
  files=sorted((root/book).glob('*.json'))
  for file in files:
   data=json.loads(file.read_text(encoding='utf-8'))
   if data.get('extractionVersion',0)<2:continue
   dest=out/book/file.name;digest=hashlib.sha256(data['content'].encode()).hexdigest()
   if dest.exists() and json.loads(dest.read_text(encoding='utf-8')).get('sourceHash')==digest:continue
   if language not in engines:engines[language]=Translator(models,language)
   text=engines[language].translate(data['content']);numbers=re.findall(r'\b\d+\b',data['content']);translated_numbers=re.findall(r'\b\d+\b',text)
   pair='tc-big-en-pt' if language=='en' else 'ROMANCE-en'
   result={'book':book,'pdfPage':data['pdfPage'],'sourceHash':digest,'sourceLanguage':language,'targetLanguage':'pt-BR' if language=='en' else 'en','content':text,'numberReviewRequired':numbers!=translated_numbers,'method':f'local-opus-mt-{pair}-int8-glossary-editorial-review-required'}
   dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8');count+=1
   if count%10==0:print(f'{book} {data["pdfPage"]}/{len(files)} ({count} translated)',flush=True)
