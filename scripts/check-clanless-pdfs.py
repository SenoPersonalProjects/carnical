"""Verify every newly exported Caitiff/Thin-blood PDF page."""
import json,re,sys
from pathlib import Path
import pymupdf as fitz
root=Path(sys.argv[1]);files=sorted(root.glob('clanless-browser-*.pdf'));assert len(files)==8,len(files);report=[]
for file in files:
 doc=fitz.open(file);text=re.sub(r'\s+',' ','\n'.join(page.get_text() for page in doc));en=file.name.endswith('-en.pdf');thin='thin-blood' in file.name
 for phrase in ['Sem-Clã em teste','Texto pessoal: manter.','Anotação pessoal preservada: amanhã às 22h.']:assert phrase in text,(file.name,phrase)
 assert not re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f\ufffd]',text),file.name
 if thin:
  for phrase in (['Blood Potency is always 0','does not naturally frenzy','next feeding'] if en else ['Potência de Sangue é sempre 0','não entra em Frenesi naturalmente','próxima alimentação']):assert phrase in text,(file.name,phrase)
 else:
  for phrase in (['new level × 6 XP','Suspect 1','cannot purchase Status'] if en else ['novo nível × 6 XP','Suspeito 1','não pode adquirir Status']):assert phrase in text,(file.name,phrase)
 page_number=113 if thin else 109
 assert any(link.get('uri')==f'https://carnical.vercel.app/rules/source?book=core-v5&page={page_number}' for page in doc for link in page.get_links()),(file.name,'source link')
 for index,page in enumerate(doc):
  assert re.search(rf'\b{index+1}\s*/\s*{len(doc)}\b',page.get_text()),(file.name,index+1,'pagination')
  for block in page.get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    for span in line['spans']:
     left,top,right,bottom=span['bbox'];assert left>=24 and right<=page.rect.width-24 and top>=20 and bottom<=page.rect.height-14,(file.name,index+1,span['text'])
  page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(root/f'{file.stem}-{index+1:02}.png')
 report.append({'file':file.name,'pages':len(doc)})
(root/'clanless-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
