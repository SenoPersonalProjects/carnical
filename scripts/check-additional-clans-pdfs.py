from pathlib import Path
import json,re,sys
import pymupdf as fitz
root=Path(sys.argv[1]);files=sorted(root.glob('additional-clan-*.pdf'));assert len(files)==24,(len(files),'expected all three clans in two sources, sizes and languages');report=[]
for file in files:
 doc=fitz.open(file);text=re.sub(r'\s+',' ','\n'.join(page.get_text() for page in doc));en=file.stem.endswith('-en');guide='players_guide_v5' in file.name
 for term in ['Texto pessoal: manter.','Observação pessoal: manter.','Anotação pessoal preservada.']:assert term in text,(file.name,term)
 if 'hecata' in file.name:
  term=('ending or resurrecting' if guide else 'predicting a death without supernatural') if en else ('encerrar ou ressuscitar' if guide else 'prever uma morte sem ajuda sobrenatural');assert term in text,(file.name,term)
  book,page=('players-guide-v5',26) if guide else ('cultos-deuses-sangue-v5',203)
 elif 'banu-haqim' in file.name:
  assert ('Judgment' if en else 'Julgamento') in text;book,page=('players-guide-v5',20) if guide else ('camarilla-v5',168)
 else:
  assert ('Transgression' if en else 'Transgressão') in text;book,page=('players-guide-v5',38) if guide else ('anarch-v5',189)
 assert not re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f\ufffd]',text),file.name
 assert any(link.get('uri')==f'https://carnical.vercel.app/rules/source?book={book}&page={page}' for p in doc for link in p.get_links()),file.name
 for index,p in enumerate(doc):
  assert re.search(rf'\b{index+1}\s*/\s*{len(doc)}\b',p.get_text())
  for block in p.get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    for span in line['spans']:
     left,top,right,bottom=span['bbox'];assert left>=24 and right<=p.rect.width-24 and top>=20 and bottom<=p.rect.height-14,(file.name,index,span['text'])
  p.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(root/f'{file.stem}-{index+1:02}.png')
 report.append({'file':file.name,'pages':len(doc),'textCharacters':len(text)})
(root/'additional-clans-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
