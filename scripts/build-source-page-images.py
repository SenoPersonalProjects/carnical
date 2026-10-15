"""Render only referenced source pages; originals are opened read-only."""
import json,sys
from pathlib import Path
import pymupdf as fitz
from PIL import Image

pdf_root=Path(sys.argv[1]);work=Path(sys.argv[2]);repo=Path(sys.argv[3]);manifest=json.loads((work/'pages/manifest.json').read_text(encoding='utf-8'));candidates=json.loads((work/'catalog/candidates.json').read_text(encoding='utf-8'));references={};reviewed_mapping={}
for entry in candidates:
 references.setdefault(entry['book'],set()).update(page['pdfPage'] for page in entry['pages'])
for entry in json.loads((repo/'app/content/catalog.json').read_text(encoding='utf-8'))['entries']:
 for version in entry['versions']:
  references.setdefault(version['book'],set()).update(page['pdfPage'] for page in version['pages'])
  for page in version['pages']:
   key=(version['book'],page['pdfPage'])
   if key in reviewed_mapping and reviewed_mapping[key]!=page['printedPage']:raise ValueError(f'Conflicting reviewed pagination: {key}')
   reviewed_mapping[key]=page['printedPage']
references.setdefault('cultos-deuses-sangue-v5',set()).add(208)
references.setdefault('let-the-streets-run-red-v5',set()).update([76,77])
books=[];count=0
for source in manifest:
 numbers=sorted(references.get(source['id'],set()))
 if not numbers:continue
 pages=[];doc=fitz.open(pdf_root/source['file']);directory=repo/'public/source-pages'/source['id'];directory.mkdir(parents=True,exist_ok=True)
 for number in numbers:
  if not 1<=number<=len(doc):raise ValueError((source['id'],number))
  target=directory/f'{number:04}.webp';page=doc[number-1];width=1500;height=round(width*page.rect.height/page.rect.width)
  if not target.exists():
   pix=page.get_pixmap(matrix=fitz.Matrix(width/page.rect.width,width/page.rect.width),alpha=False);image=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);image.save(target,'WEBP',quality=88,method=6)
  with Image.open(target) as image:width,height=image.size
  metadata=json.loads((work/'pages'/source['id']/f'{number:04}.json').read_text(encoding='utf-8'));pages.append({'pdfPage':number,'printedPage':reviewed_mapping.get((source['id'],number),metadata['printedPage']),'image':f'/source-pages/{source["id"]}/{number:04}.webp','width':width,'height':height});count+=1
 doc.close();books.append({'id':source['id'],'title':source['file'].removesuffix('.pdf'),'pages':pages});print(f'{source["id"]}: {len(pages)} pages',flush=True)
(repo/'app/content/source-pages.json').write_text(json.dumps({'books':books},ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{count} original page images mapped')
