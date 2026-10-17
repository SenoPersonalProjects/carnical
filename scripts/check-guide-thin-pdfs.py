"""Check the real bilingual browser exports for the Guide Thin-blood choices."""
import json,sys
from pathlib import Path
import pymupdf
from PIL import Image
root=Path(sys.argv[1]);report=[];files=sorted(root.glob('guide-thin-*.pdf'));assert len(files)==4
for file in files:
 doc=pymupdf.open(file);text='\n'.join(page.get_text() for page in doc);en=file.stem.endswith('-en')
 for term in ['Abhorrent Blood' if en else 'Sangue Repulsivo','Low Appetite' if en else 'Pouco Apetite','Heliophobia' if en else 'Heliofobia','sunlight can provoke terror frenzy' if en else 'a luz solar pode provocar Frenesi de Terror','two points of Willpower each turn' if en else 'dois pontos de Vontade a cada turno']:assert term in text,(file,term)
 assert '\ufffd' not in text;thumbs=[]
 for i,page in enumerate(doc):
  for word in page.get_text('words'):
   x0,y0,x1,y1=word[:4];assert x0>=24 and y0>=18 and x1<=page.rect.width-24 and y1<=page.rect.height-12,(file,i,word)
  pix=page.get_pixmap(matrix=pymupdf.Matrix(1.2,1.2),alpha=False);img=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);img.save(root/f'{file.stem}-{i+1}.png');img.thumbnail((298,421));thumbs.append(img)
 sheet=Image.new('RGB',(298*min(4,len(thumbs)),421*((len(thumbs)+3)//4)),'#ddd')
 for i,img in enumerate(thumbs):sheet.paste(img,(i%4*298,i//4*421))
 sheet.save(root/f'{file.stem}-contact.png');report.append({'file':file.name,'pages':len(doc),'textAndMargins':True})
(root/'guide-thin-pdf-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
