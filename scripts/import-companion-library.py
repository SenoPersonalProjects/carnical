"""Replace the old Companion extraction, preserving all six existing chapter IDs."""
import hashlib,json,re,sys
from pathlib import Path
repo=Path(__file__).resolve().parent.parent;work=Path(sys.argv[1]);file=repo/'app/rules/rules-data.json';library=json.loads(file.read_text(encoding='utf-8'));book=next(book for book in library['books']if book['id']=='companion-v5')
source=next(book for book in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8'))if book['id']=='companion-v5')
ranges=[(1,3),(4,4),(5,28),(29,40),(41,60),(61,68)];covered=[]
for chapter,(first,last) in zip(book['chapters'],ranges,strict=True):
 blocks=[];references=[]
 for n in range(first,last+1):
  page=json.loads((work/'pages/companion-v5'/f'{n:04}.json').read_text(encoding='utf-8'));assert page['extractionVersion']>=6
  text=page['content'];text=re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]','',text)
  text=text.replace('\uf0a1','○').replace('\uf0a8','□')
  blocks.append(f'## Página do arquivo {n}'+(f' · p. {page["printedPage"]}'if page['printedPage']is not None else '')+'\n\n'+(text or '[Página sem texto extraível.]'))
  references.append({'pdfPage':n,'printedPage':page['printedPage'],'method':page['method']});covered.append(n)
 chapter['content']='# '+chapter['title']+'\n\n'+'\n\n'.join(blocks)
 chapter['sourcePages']=references;chapter['sourceSha256']=source['sha256'];chapter['revision']=hashlib.sha256(chapter['content'].encode()).hexdigest()
assert covered==list(range(1,69))
book['extractionRevision']='companion-layout-v6-with-checked-blood-potency-table'
file.write_text(json.dumps(library,ensure_ascii=False,indent=2),encoding='utf-8');print('Companion: 68 source pages, six stable chapters, no duplicated/missing page')
