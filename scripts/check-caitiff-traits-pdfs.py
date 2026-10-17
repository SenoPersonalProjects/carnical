"""Verify the full browser exports for guided Caitiff choices in both languages."""
import json,sys
from pathlib import Path
import pymupdf
from PIL import Image
root=Path(sys.argv[1]);report=[];files=sorted(root.glob('caitiff-traits-*.pdf'));assert len(files)==4
for file in files:
 doc=pymupdf.open(file);text='\n'.join(page.get_text() for page in doc);en=file.stem.endswith('-en')
 for term in ['Tremere','Favored Blood' if en else 'Sangue Favorecido','Clan Curse' if en else 'Maldição de Clã','minimum of 1' if en else 'mínimo de 1']:assert term in text,(file,term)
 assert '\ufffd' not in text;thumbs=[]
 for i,page in enumerate(doc):
  for word in page.get_text('words'):
   x0,y0,x1,y1=word[:4];assert x0>=24 and y0>=18 and x1<=page.rect.width-24 and y1<=page.rect.height-12,(file,i,word)
  pix=page.get_pixmap(matrix=pymupdf.Matrix(1.2,1.2),alpha=False);img=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);img.save(root/f'{file.stem}-{i+1}.png');img.thumbnail((298,421));thumbs.append(img)
 sheet=Image.new('RGB',(298*min(4,len(thumbs)),421*((len(thumbs)+3)//4)),'#ddd')
 for i,img in enumerate(thumbs):sheet.paste(img,(i%4*298,i//4*421))
 sheet.save(root/f'{file.stem}-contact.png');report.append({'file':file.name,'pages':len(doc),'textAndMargins':True})
(root/'caitiff-traits-pdf-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
