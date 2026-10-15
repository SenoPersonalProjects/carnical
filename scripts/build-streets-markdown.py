"""Package the supplied 252-page source as an auditable bilingual Markdown base."""
import hashlib,json,re,sys,unicodedata,zipfile
from pathlib import Path

TITLES={'Front matter':'Abertura','Table of Contents':'Sumário','Debts Repaid':'Dívidas Pagas','Introduction':'Introdução','Power Prey':'Presa do Poder','The Dying Fields':'Os Campos Agonizantes','Innocence in Blood':'Inocência em Sangue','Rusted Jungle':'Selva Enferrujada','Kindred Biographies':'Biografias dos Membros','Loresheets and Backgrounds':'Loresheets e Antecedentes','Ready-Made Characters':'Personagens Prontos'}
def slug(text):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower()).strip('-')

if __name__=='__main__':
 root=Path(sys.argv[1]);translations=Path(sys.argv[2]);out=Path(sys.argv[3]);book='let-the-streets-run-red-v5';manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'));source=next(x for x in manifest if x['id']==book);pages=[];reviews=[]
 for number in range(1,source['pages']+1):
  page=json.loads((root/book/f'{number:04}.json').read_text(encoding='utf-8'));translated=json.loads((translations/book/f'{number:04}.json').read_text(encoding='utf-8'))
  digest=hashlib.sha256(page['content'].encode()).hexdigest()
  if translated['sourceHash']!=digest:raise ValueError(f'Outdated translation on PDF page {number}')
  if translated['numberReviewRequired']:reviews.append(number)
  pages.append((page,translated))
 chapters=[('Front matter',1)]+[(title.strip(),number) for level,title,number in source['toc'] if level==2];chapters.sort(key=lambda c:c[1]);coverage=[];chapter_manifest=[]
 for locale in ['en','pt-BR']:
  directory=out/locale;(directory/'01_paginas').mkdir(parents=True,exist_ok=True);(directory/'02_categorias').mkdir(parents=True,exist_ok=True);integral=[]
  for page,translated in pages:
   content=page['content'] if locale=='en' else translated['content'];printed=page['printedPage'];header=f'---\nsource_id: {source["sha256"]}\nlanguage: {locale}\npdf_page: {page["pdfPage"]}\nprinted_page: {printed if printed is not None else "null"}\nextraction_method: {page["method"]}\n---\n\n'
   body=f'# {"PDF page" if locale=="en" else "Página do arquivo"} {page["pdfPage"]}\n\n'+(content or ('[No extractable text on this page.]' if locale=='en' else '[Página sem texto extraível.]'))+'\n';(directory/'01_paginas'/f'{page["pdfPage"]:04}.md').write_text(header+body,encoding='utf-8');integral.append(body)
  (directory/'00_fonte_integral.md').write_text('# Let the Streets Run Red\n\n'+'\n\n'.join(integral),encoding='utf-8')
  for index,(title,start) in enumerate(chapters):
   end=chapters[index+1][1]-1 if index+1<len(chapters) else source['pages'];filename=f'{index:02}_{slug(title)}.md';localized=title if locale=='en' else TITLES.get(title,title);content=f'# {localized}\n\n'+ ('\n\n'.join(integral[start-1:end]))
   (directory/'02_categorias'/filename).write_text(content,encoding='utf-8')
   if locale=='en':coverage.extend(range(start,end+1));chapter_manifest.append({'id':f'{book}-{slug(title)}','title':title,'titlePt':TITLES.get(title,title),'file':filename,'pdfStart':start,'pdfEnd':end})
 if coverage!=list(range(1,253)):raise ValueError('Chapter coverage must contain all 252 pages exactly once')
 data={'book':book,'title':'Let the Streets Run Red','pdf':source['file'],'sha256':source['sha256'],'pages':252,'sourceLanguage':'en','languages':['en','pt-BR'],'chapters':chapter_manifest,'pageMapping':[{'pdfPage':p['pdfPage'],'printedPage':p['printedPage'],'method':p['method']} for p,_ in pages],'translationMethods':sorted(set(t['method'] for _,t in pages)),'numericReviewPages':reviews,'editorialStatus':'pending-review'}
 (out/'manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
 (out/'README.md').write_text('# Let the Streets Run Red — base Markdown bilíngue\n\n252 páginas do arquivo original, com correspondência para a numeração impressa quando identificada. PDFs originais permanecem somente de leitura.\n\n- `en/`: texto original em inglês.\n- `pt-BR/`: tradução persistida em português.\n- `01_paginas/`: um arquivo por página.\n- `02_categorias/`: capítulos conforme o sumário do PDF.\n- `00_fonte_integral.md`: texto completo em ordem.\n- `manifest.json`: identidade SHA-256, métodos, páginas e cobertura.\n\nA revisão editorial e das diferenças numéricas está registrada no manifesto. Um número impresso nulo indica página sem identificação confirmada; não representa uma página faltante.\n',encoding='utf-8')
 archive=out.with_suffix('.zip')
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as zip:
  for file in sorted(out.rglob('*')):
   if file.is_file():zip.write(file,file.relative_to(out.parent))
 print(f'{archive}: 252 pages × 2 languages, {len(chapters)} chapters; {len(reviews)} numeric pages awaiting review')
