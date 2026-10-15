"""Extract and render every fixture page, checking glyphs and pagination."""
from pathlib import Path
import json,re,sys
import pymupdf as fitz
from PIL import Image,ImageDraw

root=Path(sys.argv[1]);expect=json.loads((root/'expectations.json').read_text(encoding='utf-8'));report=[]
for file in sorted(root.glob('*-small.pdf'))+sorted(root.glob('*-large.pdf'))+sorted(root.glob('browser-*.pdf')):
 doc=fitz.open(file);text='\n'.join(page.get_text() for page in doc)
 expected={'name':'João - alteração não salva','notes':'Amanhã, às 22h: anotações não salvas.'} if file.name.startswith('browser-') else expect
 for field in ['name','notes']:assert expected[field] in text,(file.name,field)
 assert expect['excluded'] not in text,file.name
 if 'large' in file.name:
  assert expect['largeLast'] in text,file.name
  body=re.sub(r'^Carniçal .*$', '',text,flags=re.M)
  body=re.sub(r'-\n(?=\w)','',body)
  body=re.sub(r'\s+',' ',body)
  assert 'FIM DO CONCEITO EXTENSO' in body,file.name
  assert body.count('Investigador dedicado aos mistérios de Fortaleza.')==200,(file.name,'concept duplicated or lost during pagination')
 assert not re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f\ufffd]',text),(file.name,'invalid glyph')
 assert not re.search(r'\|\s*---\s*\|',text),(file.name,'unrendered Markdown table')
 thumbs=[]
 for index,page in enumerate(doc):
  for block in page.get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    for span in line['spans']:
     left,top,right,bottom=span['bbox'];assert left>=24 and right<=page.rect.width-24 and top>=20 and bottom<=page.rect.height-14,(file.name,index+1,'text outside page margins',span['text'])
  assert re.search(rf'\b{index+1}\s*/\s*{len(doc)}\b',page.get_text()),(file.name,index+1,'missing page number')
  pix=page.get_pixmap(matrix=fitz.Matrix(1.3,1.3));image=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);image.save(root/f'{file.stem}-{index+1:02}.png')
  image.thumbnail((300,430));canvas=Image.new('RGB',(320,455),'#ddd');canvas.paste(image,((320-image.width)//2,10));ImageDraw.Draw(canvas).text((10,435),f'{file.stem} {index+1}',fill='black');thumbs.append(canvas)
 contact=Image.new('RGB',(960,((len(thumbs)+2)//3)*455),'white')
 for index,thumb in enumerate(thumbs):contact.paste(thumb,((index%3)*320,(index//3)*455))
 contact.save(root/f'{file.stem}-contact.png');report.append({'file':file.name,'pages':len(doc),'textCharacters':len(text)})
(root/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
