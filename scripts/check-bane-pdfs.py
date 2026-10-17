"""Verify every actual browser PDF page for the Bane/Decay scenarios."""
import json,re,sys
from pathlib import Path
import pymupdf
from PIL import Image,ImageDraw
root=Path(sys.argv[1]);report=[]
files=sorted(root.glob('banes-browser-*.pdf'))+sorted(root.glob('decay-browser-*.pdf'))
assert len(files)==8
for file in files:
 doc=pymupdf.open(file);text='\n'.join(page.get_text() for page in doc);en=file.stem.endswith('-en');decay=file.name.startswith('decay-')
 for term in ['Perdições alternativas','Anotação pessoal preservada.']:assert term in text,(file,term)
 assert ('Decay' if decay and en else 'Decadência' if decay else 'Callousness' if en else 'Insensibilidade') in text,file
 assert ('Replaces the standard Bane' if en else 'Substitui a padrão') in text,file
 assert '\ufffd' not in text and 'per_dot' not in text,file
 if decay:assert ('Background dots spent: 4' if en else 'pontos de Antecedentes pagos: 4') in text,file
 thumbnails=[]
 for index,page in enumerate(doc):
  assert re.search(rf'\b{index+1}\s*/\s*{len(doc)}\b',page.get_text()),(file,index)
  for word in page.get_text('words'):
   x0,y0,x1,y1=word[:4];assert x0>=24 and y0>=18 and x1<=page.rect.width-24 and y1<=page.rect.height-12,(file,index,word)
  pix=page.get_pixmap(matrix=pymupdf.Matrix(1.2,1.2),alpha=False);img=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);img.save(root/f'{file.stem}-{index+1}.png');img.thumbnail((298,421));thumbnails.append(img)
 sheet=Image.new('RGB',(298*min(4,len(thumbnails)),445*((len(thumbnails)+3)//4)),'#ddd');draw=ImageDraw.Draw(sheet)
 for i,img in enumerate(thumbnails):x=i%4*298;y=i//4*445;sheet.paste(img,(x,y));draw.text((x+8,y+423),f'Page {i+1}',fill='black')
 sheet.save(root/f'{file.stem}-contact.png');report.append({'file':file.name,'pages':len(doc),'characters':len(text),'textAndMargins':True})
(root/'banes-pdf-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
