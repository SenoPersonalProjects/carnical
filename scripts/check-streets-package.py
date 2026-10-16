"""Check bilingual page coverage, original artwork, local links and ZIP integrity."""
import hashlib,json,re,sys,zipfile
from pathlib import Path
from PIL import Image

root=Path(sys.argv[1]);manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
assert manifest['pages']==252
assert [row['pdfPage'] for row in manifest['pageMapping']]==list(range(1,253))
assert len(manifest['originalPageImages'])==252
assert hashlib.sha256((root/manifest['originalPdfCopy']['file']).read_bytes()).hexdigest()==manifest['sha256']
for row in manifest['originalPageImages']:
    file=root/row['file']
    assert hashlib.sha256(file.read_bytes()).hexdigest()==row['sha256']
    with Image.open(file) as image:
        assert image.size==(row['width'],row['height'])
        image.verify()
links=0
for locale in ['en','pt-BR']:
    directory=root/locale
    assert len(list((directory/'01_paginas').glob('*.md')))==252
    assert len(list((directory/'02_categorias').glob('*.md')))==len(manifest['chapters'])
    integral=(directory/'00_fonte_integral.md').read_text(encoding='utf-8')
    assert len(re.findall(r'^# (?:PDF page|Página do arquivo) \d+$',integral,re.M))==252
    for file in directory.rglob('*.md'):
        text=file.read_text(encoding='utf-8')
        assert '\ufffd' not in text,file
        for target in re.findall(r'!\[[^\]]*\]\(([^)]+)\)',text):
            assert (file.parent/target).is_file(),(file,target)
            links+=1
with zipfile.ZipFile(root.with_suffix('.zip')) as archive:
    assert archive.testzip() is None
    expected={str(file.relative_to(root.parent)).replace('\\','/') for file in root.rglob('*') if file.is_file()}
    assert set(archive.namelist())==expected
print(json.dumps({'pagesPerLanguage':252,'languages':manifest['languages'],'originalImages':252,'validImageLinks':links,'originalPdfHashMatches':True,'zipIntegrity':True,'editorialStatus':manifest['editorialStatus']}))
