"""Text, pagination, source links and rendering for the four actual browser exports."""
import json,re,sys
from pathlib import Path
import pymupdf as fitz
root=Path(sys.argv[1]);files=sorted(root.glob('thin-traits-browser-*.pdf'));assert len(files)==4,len(files);report=[]
for file in files:
 doc=fitz.open(file);text=re.sub(r'\s+',' ','\n'.join(page.get_text() for page in doc));en=file.name.endswith('-en.pdf')
 for phrase in ['Escolhas especiais em teste','Anotação pessoal preservada: amanhã às 22h.','Digitação rápida preservada.']:assert phrase in text,(file.name,phrase)
 names=['Discipline Affinity','Thin-blood Alchemist','Catenating Blood','Mortal Frailty','Bestial Temper','Clan Curse'] if en else ['Afinidade com Disciplina','Alquimista Sangue-Ralo','Sangue Agregador','Fragilidade Mortal','Temperamento Bestial','Maldição de Clã']
 for name in names:
  assert name in text,(file.name,name)
  assert not re.search(re.escape(name)+r'\s*\(0\)',text),(file.name,'unrated trait shown as dots')
 assert re.search(r'(Health|Vitalidade)\s+7',text),(file.name,'Resilience health bonus')
 assert ('fixed Severity 1' if en else 'Gravidade fixa 1') in text,(file.name,'Clan Curse severity')
 assert ('self-treatment adds +1 Difficulty' if en else 'tratar a si mesmo acrescenta +1') in text,(file.name,'mortal healing rules')
 assert ('special choice' if en else 'escolha especial') in text,(file.name,'unrated indicator')
 assert not re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f\ufffd]',text),file.name
 links=[link.get('uri') for page in doc for link in page.get_links()]
 for number in [129,185,186]:assert f'https://carnical.vercel.app/rules/source?book=core-v5&page={number}' in links,(file.name,number)
 for index,page in enumerate(doc):
  assert re.search(rf'\b{index+1}\s*/\s*{len(doc)}\b',page.get_text()),(file.name,index+1,'pagination')
  for block in page.get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    for span in line['spans']:
     left,top,right,bottom=span['bbox'];assert left>=24 and right<=page.rect.width-24 and top>=20 and bottom<=page.rect.height-14,(file.name,index+1,span['text'])
  page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(root/f'{file.stem}-{index+1:02}.png')
 report.append({'file':file.name,'pages':len(doc)})
(root/'thin-traits-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
