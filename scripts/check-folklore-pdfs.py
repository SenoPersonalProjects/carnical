from pathlib import Path
import json,re,sys
import pymupdf as fitz
root=Path(sys.argv[1]);report=[];files=sorted(root.glob('folklore-browser-*.pdf'));assert len(files)==4
for file in files:
 doc=fitz.open(file);text=re.sub(r'\s+',' ','\n'.join(page.get_text() for page in doc));en=file.stem.endswith('-en')
 for term in (['Archaic','Folkloric Block — Running water','Folkloric Bane — Silver','1 Aggravated damage'] if en else ['Arcaico','Tabu Folclórico — Água corrente','Perdição Folclórica — Prata','1 dano Agravado']):assert term in text,(file.name,term)
 assert ('Folkloric Block — Garlic' if en else 'Tabu Folclórico — Alho') not in text,(file.name,'removed choice')
 assert not re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f\ufffd]',text),file.name
 links={link.get('uri') for page in doc for link in page.get_links()}
 for n in [182,184]:assert f'https://carnical.vercel.app/rules/source?book=core-v5&page={n}' in links
 for index,page in enumerate(doc):
  assert re.search(rf'\b{index+1}\s*/\s*{len(doc)}\b',page.get_text())
  for block in page.get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    for span in line['spans']:
     left,top,right,bottom=span['bbox'];assert left>=24 and right<=page.rect.width-24 and top>=20 and bottom<=page.rect.height-14,(file.name,index,span['text'])
  page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(root/f'{file.stem}-{index+1:02}.png')
 report.append({'file':file.name,'pages':len(doc),'textCharacters':len(text)})
(root/'folklore-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
