"""Package the supplied 252-page source as an auditable bilingual Markdown base."""
import hashlib,json,re,shutil,sys,unicodedata,zipfile
from pathlib import Path
import pymupdf

TITLES={'Front matter':'Abertura','Table of Contents':'Sumário','Debts Repaid':'Dívidas Pagas','Introduction':'Introdução','Power Prey':'Presa do Poder','The Dying Fields':'Os Campos Agonizantes','Innocence in Blood':'Inocência em Sangue','Rusted Jungle':'Selva Enferrujada','Kindred Biographies':'Biografias dos Membros','Loresheets and Backgrounds':'Loresheets e Antecedentes','Ready-Made Characters':'Personagens Prontos'}
def slug(text):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower()).strip('-')

def format_markdown(text):
 # Translation services sometimes remove Markdown's required heading space.
 text=re.sub(r'(?m)^(#{1,6})(?=[^\s#])',r'\1 ',text)
 text=re.sub(r'(?m)^#{1,6}\s+([•■*])\s*$',r'\1',text)
 return text.replace('\u200b','').replace('\ufeff','')

if __name__=='__main__':
 root=Path(sys.argv[1]);translations=Path(sys.argv[2]);out=Path(sys.argv[3]);pdf_path=Path(sys.argv[4]);book='let-the-streets-run-red-v5';manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'));source=next(x for x in manifest if x['id']==book);pages=[];reviews=[]
 if hashlib.sha256(pdf_path.read_bytes()).hexdigest()!=source['sha256']:raise ValueError('Original PDF does not match the extraction manifest')
 # Validate every translation before writing the package.
 for number in range(1,source['pages']+1):
  page=json.loads((root/book/f'{number:04}.json').read_text(encoding='utf-8'));translated=json.loads((translations/book/f'{number:04}.json').read_text(encoding='utf-8'))
  digest=hashlib.sha256(page['content'].encode()).hexdigest()
  if translated['sourceHash']!=digest:raise ValueError(f'Outdated translation on PDF page {number}')
  if translated['numberReviewRequired']:reviews.append(number)
  pages.append((page,translated))
 out.mkdir(parents=True,exist_ok=True)
 shutil.copyfile(pdf_path,out/'04_fonte_original.pdf')
 # Full-page images preserve illustrations, maps and layout alongside the text.
 # The supplied PDF is opened read-only and never saved or modified.
 images=out/'03_paginas_originais';images.mkdir(parents=True,exist_ok=True)
 image_manifest=[]
 with pymupdf.open(pdf_path) as original:
  if len(original)!=252:raise ValueError('Expected the supplied 252-page PDF')
  for index,page in enumerate(original):
   target=images/f'{index+1:04}.webp'
   pixmap=page.get_pixmap(matrix=pymupdf.Matrix(1.5,1.5),alpha=False)
   pixmap.pil_save(str(target),format='WEBP',quality=88)
   image_manifest.append({'pdfPage':index+1,'file':str(target.relative_to(out)).replace('\\','/'),'width':pixmap.width,'height':pixmap.height,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
 chapters=[('Front matter',1)]+[(title.strip(),number) for level,title,number in source['toc'] if level==2];chapters.sort(key=lambda c:c[1]);coverage=[];chapter_manifest=[]
 for locale in ['en','pt-BR']:
  directory=out/locale;(directory/'01_paginas').mkdir(parents=True,exist_ok=True);(directory/'02_categorias').mkdir(parents=True,exist_ok=True);integral=[]
  for page,translated in pages:
   content=format_markdown(page['content'] if locale=='en' else translated['content']);printed=page['printedPage'];header=f'---\nsource_id: {source["sha256"]}\nlanguage: {locale}\npdf_page: {page["pdfPage"]}\nprinted_page: {printed if printed is not None else "null"}\nextraction_method: {page["method"]}\n---\n\n'
   body=f'# {"PDF page" if locale=="en" else "Página do arquivo"} {page["pdfPage"]}\n\n'+(content or ('[No extractable text on this page.]' if locale=='en' else '[Página sem texto extraível.]'))+'\n'
   image_label='Original page, including illustrations and maps' if locale=='en' else 'Página original, incluindo ilustrações e mapas'
   image_name=f'{page["pdfPage"]:04}.webp'
   (directory/'01_paginas'/f'{page["pdfPage"]:04}.md').write_text(header+body+f'\n![{image_label}](../../03_paginas_originais/{image_name})\n',encoding='utf-8')
   integral.append(body+f'\n![{image_label}](../03_paginas_originais/{image_name})\n')
  (directory/'00_fonte_integral.md').write_text('# Let the Streets Run Red\n\n'+'\n\n'.join(integral),encoding='utf-8')
  for index,(title,start) in enumerate(chapters):
   end=chapters[index+1][1]-1 if index+1<len(chapters) else source['pages'];filename=f'{index:02}_{slug(title)}.md';localized=title if locale=='en' else TITLES.get(title,title);content=f'# {localized}\n\n'+ ('\n\n'.join(integral[start-1:end])).replace('](../03_paginas_originais/','](../../03_paginas_originais/')
   (directory/'02_categorias'/filename).write_text(content,encoding='utf-8')
   if locale=='en':coverage.extend(range(start,end+1));chapter_manifest.append({'id':f'{book}-{slug(title)}','title':title,'titlePt':TITLES.get(title,title),'file':filename,'pdfStart':start,'pdfEnd':end})
 if coverage!=list(range(1,253)):raise ValueError('Chapter coverage must contain all 252 pages exactly once')
 data={'book':book,'title':'Let the Streets Run Red','pdf':source['file'],'sha256':source['sha256'],'pages':252,'sourceLanguage':'en','languages':['en','pt-BR'],'chapters':chapter_manifest,'pageMapping':[{'pdfPage':p['pdfPage'],'printedPage':p['printedPage'],'method':p['method']} for p,_ in pages],'translationMethods':sorted(set(t['method'] for _,t in pages)),'numericReviewPages':reviews,'editorialStatus':'pending-review'}
 data['originalPageImages']=image_manifest
 data['originalPdfCopy']={'file':'04_fonte_original.pdf','sha256':source['sha256'],'modified':False}
 data['imageMethod']='Full original pages rendered at 108 dpi; WebP quality 88; text remains separately selectable in Markdown'
 (out/'manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
 (out/'README.md').write_text('# Let the Streets Run Red — base Markdown bilíngue\n\n252 páginas do arquivo original, com correspondência para a numeração impressa quando identificada. PDFs originais permanecem somente de leitura.\n\n- `en/`: texto original em inglês.\n- `pt-BR/`: tradução persistida em português.\n- `01_paginas/`: um arquivo por página.\n- `02_categorias/`: capítulos conforme o sumário do PDF.\n- `00_fonte_integral.md`: texto completo em ordem.\n- `manifest.json`: identidade SHA-256, métodos, páginas e cobertura.\n\nA revisão editorial e das diferenças numéricas está registrada no manifesto. Um número impresso nulo indica página sem identificação confirmada; não representa uma página faltante.\n',encoding='utf-8')
 with (out/'README.md').open('a',encoding='utf-8') as readme:
  readme.write('\n## Ilustrações, mapas e diagramação\n\n`03_paginas_originais/` contém as 252 páginas renderizadas, inclusive páginas sem texto extraível. Os arquivos Markdown de páginas e capítulos apontam para essas imagens. `04_fonte_original.pdf` é uma cópia byte a byte do PDF recebido, preservando a resolução e todos os elementos originais; seu SHA-256 está no manifesto.\n\nA tradução automática persistida exige revisão editorial. A presença de todas as páginas não comprova a correção de todas as traduções.\n')
 archive=out.with_suffix('.zip')
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as zip:
  for file in sorted(out.rglob('*')):
   if file.is_file():zip.write(file,file.relative_to(out.parent))
 print(f'{archive}: 252 pages × 2 languages, {len(chapters)} chapters; {len(reviews)} numeric pages awaiting review')
