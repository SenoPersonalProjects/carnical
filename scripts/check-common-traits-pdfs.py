"""Inspect actual browser downloads, both locales and viewport sizes."""
from pathlib import Path
import json,re,sys
import pymupdf as fitz
root=Path(sys.argv[1]);report=[]
files=sorted(root.glob('common-traits-browser-*.pdf'));assert len(files)==4
for file in files:
 doc=fitz.open(file);text=re.sub(r'\s+',' ','\n'.join(page.get_text() for page in doc));en=file.stem.endswith('-en')
 for term in (['Eat Food','Iron Gullet','Linguistics','3 XP per acquired dot'] if en else ['Ingerir Comida','Esôfago de Ferro','Linguística','3 XP por ponto adquirido']):assert term in text,(file.name,term)
 if en:assert 'Linguistics — 1 dot(s)' in text and 'Linguistics — 3 dot(s)' in text,(file.name,'XP purchase names must follow the active locale')
 assert 'Vantagens revisadas' in text
 assert not re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f\ufffd]',text),file.name
 links={link.get('uri') for page in doc for link in page.get_links()}
 for number in [181,184]:assert f'https://carnical.vercel.app/rules/source?book=core-v5&page={number}' in links,(file.name,number)
 for index,page in enumerate(doc):
  assert re.search(rf'\b{index+1}\s*/\s*{len(doc)}\b',page.get_text()),(file.name,index)
  for block in page.get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    for span in line['spans']:
     left,top,right,bottom=span['bbox'];assert left>=24 and right<=page.rect.width-24 and top>=20 and bottom<=page.rect.height-14,(file.name,index,span['text'])
  page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(root/f'{file.stem}-{index+1:02}.png')
 report.append({'file':file.name,'pages':len(doc),'sourceLinks':len(links),'textCharacters':len(text)})
(root/'common-traits-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
