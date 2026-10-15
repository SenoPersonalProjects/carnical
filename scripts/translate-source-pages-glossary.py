"""Persist EN/PT reference text through the application's translation service.

Terms and numbers are protected during translation and restored afterwards.
This is an import-time tool: the library never calls it when a reader opens it.
"""
import concurrent.futures,hashlib,json,re,sys,time,urllib.request
from pathlib import Path

LANG={'core-v5':'pt','chicago-by-night-v5':'en','camarilla-v5':'pt','anarch-v5':'pt','cultos-deuses-sangue-v5':'pt','companion-v5':'pt','sabbat-black-hand-v5':'en','players-guide-v5':'en','gehenna-war-v5':'en','sigilos-de-sangue-v5':'pt','let-the-streets-run-red-v5':'en'}
TERMS={'Blood Potency':'Potência de Sangue','Blood Surge':'Impulso de Sangue','Blood Sorcery':'Feitiçaria de Sangue','Thin-Blood Alchemy':'Alquimia do Sangue-Fraco','Thin-blood':'Sangue-Ralo','Rouse Check':'Teste de Sangue','Rouse Checks':'Testes de Sangue','Predator Type':'Tipo de Predador','Roadside Killer':'Assassino de Estrada','Prey Exclusion':'Exclusão de Presas','Touchstones':'Pilares','Touchstone':'Pilar','Convictions':'Convicções','Conviction':'Convicção','Storyteller':'Narrador','Kindred':'Membros','Kine':'mortais','Willpower':'Força de Vontade','Health':'Vitalidade','Humanity':'Humanidade','Stains':'Máculas','Stain':'Mácula','Hunger':'Fome','Herd':'Rebanho','Haven':'Refúgio','Flaw':'Defeito','Flaws':'Defeitos','Merit':'Qualidade','Merits':'Qualidades','Background':'Antecedente','Backgrounds':'Antecedentes','Resonance':'Ressonância','Dyscrasia':'Discrasia','Auspex':'Auspícios','Dominate':'Dominação','Celerity':'Celeridade','Fortitude':'Fortitude','Potence':'Potência','Presence':'Presença','Animalism':'Animalismo','Obfuscate':'Ofuscação','Oblivion':'Oblívio','Protean':'Proteanismo','Composure':'Autocontrole','Resolve':'Determinação','Wits':'Raciocínio','Intelligence':'Inteligência','Strength':'Força','Stamina':'Vigor','Dexterity':'Destreza','Charisma':'Carisma','Manipulation':'Manipulação','Animal Ken':'Empatia com Animais','Survival':'Sobrevivência','Investigation':'Investigação','Subterfuge':'Subterfúgio','Awareness':'Percepção','Academics':'Erudição','Occult':'Ocultismo','Craft':'Ofícios','Brawl':'Briga','Firearms':'Armas de Fogo','Melee':'Armas Brancas','Streetwise':'Manha','Stealth':'Furtividade','Larceny':'Ladroagem','Performance':'Performance','Science':'Ciência','Medicine':'Medicina','Finance':'Finanças','Politics':'Política','Technology':'Tecnologia','Persuasion':'Persuasão','Intimidation':'Intimidação','Leadership':'Liderança','Etiquette':'Etiqueta','Insight':'Sagacidade','Drive':'Condução'}

def protected(text,source):
 glossary=TERMS if source=='en' else {value:key for key,value in TERMS.items()};mapping={}
 pattern=re.compile(r'\b(?:'+ '|'.join(re.escape(key) for key in sorted(glossary,key=len,reverse=True))+r')\b|\b\d+(?:[.,]\d+)*\b',re.I)
 lookup={key.lower():value for key,value in glossary.items()}
 def replace(match):
  token=f'__VTM_{len(mapping)}__';mapping[token]=lookup.get(match[0].lower(),match[0]);return token
 return pattern.sub(replace,text),mapping

def page(job):
 file,source,out,service=job;data=json.loads(file.read_text(encoding='utf-8'))
 if data.get('extractionVersion',0)<2:return data['book'],data['pdfPage'],'awaiting extraction'
 digest=hashlib.sha256(data['content'].encode()).hexdigest();dest=out/data['book']/file.name
 if dest.exists() and json.loads(dest.read_text(encoding='utf-8')).get('sourceHash')==digest:return data['book'],data['pdfPage'],'cached'
 text,mapping=protected(data['content'],source);pieces=[];current=''
 for paragraph in text.split('\n\n'):
  if len(current)+len(paragraph)>4000:
   if current:pieces.append(current);current=''
   while len(paragraph)>4000:
    cut=paragraph.rfind(' ',0,4000);cut=cut if cut>0 else 4000;pieces.append(paragraph[:cut]);paragraph=paragraph[cut:].lstrip()
  current+=('\n\n' if current else '')+paragraph
 if current:pieces.append(current)
 translated=[]
 for at in range(0,len(pieces),20):
  payload=json.dumps({'texts':pieces[at:at+20],'source':source,'target':'pt' if source=='en' else 'en'}).encode()
  for attempt in range(5):
   try:
    request=urllib.request.Request(service,data=payload,headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(request,timeout=120) as response:result=json.load(response)
    translated.extend(result['translations']);break
   except Exception:
    if attempt==4:raise
    time.sleep(3*2**attempt)
 output='\n\n'.join(translated)
 # Service responses occasionally add spaces inside tokens. Resolve exactly once.
 output=re.sub(r'__\s*VTM\s*_\s*(\d+)\s*__',lambda m:f'__VTM_{m[1]}__',output)
 for token,value in mapping.items():
  if output.count(token)!=1:raise ValueError(f'{data["book"]} p{data["pdfPage"]}: token lost or repeated: {token}')
  output=output.replace(token,value)
 original_numbers=re.findall(r'\b\d+(?:[.,]\d+)*\b',data['content']);translated_numbers=re.findall(r'\b\d+(?:[.,]\d+)*\b',output)
 result={'book':data['book'],'pdfPage':data['pdfPage'],'sourceHash':digest,'sourceLanguage':source,'targetLanguage':'pt' if source=='en' else 'en','content':output,'numberReviewRequired':original_numbers!=translated_numbers,'method':'google-translate-persisted-protected-vtm-glossary-v1','editorialReviewRequired':True}
 dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8');return data['book'],data['pdfPage'],'translated'

if __name__=='__main__':
 root=Path(sys.argv[1]);out=Path(sys.argv[2]);service=sys.argv[3];selected=sys.argv[4:];jobs=[]
 for book,language in LANG.items():
  if selected and book not in selected:continue
  jobs.extend((file,language,out,service) for file in sorted((root/book).glob('*.json')))
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
  for count,result in enumerate(pool.map(page,jobs),1):
   if count%10==0 or count==len(jobs):print(f'{count}/{len(jobs)} {result}',flush=True)
