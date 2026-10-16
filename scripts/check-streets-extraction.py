"""Validate the page cache without equating extraction with editorial review."""
import collections,json,re,sys
from pathlib import Path

root=Path(sys.argv[1]);book='let-the-streets-run-red-v5'
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
assert len(manifest)==11,'A selected extraction must preserve all source manifests'
source=next(row for row in manifest if row['id']==book)
files=sorted((root/book).glob('*.json'))
assert len(files)==source['pages']==252
columns=collections.Counter();empty=[]
for number,file in enumerate(files,1):
    page=json.loads(file.read_text(encoding='utf-8'))
    assert page['pdfPage']==number and page['book']==book
    assert page['extractionVersion']>=5
    assert page['method']=='native-text-with-layout'
    assert '\ufffd' not in page['content']
    assert page['empty']==(not page['lines'])
    columns[page['detectedColumns']]+=1
    if page['empty']:empty.append(number)
page=json.loads((root/book/'0028.json').read_text(encoding='utf-8'))
assert page['detectedColumns']==3
assert 'controversial' in page['content']
assert 'contro-\n\nversial' not in page['content']
assert page['content'].index('Who is')<page['content'].index('Chapter Three:')
assert page['content'].index('Chapter Three:')<page['content'].index('The Physical Route')
report={'pages':252,'columns':dict(columns),'pagesWithoutExtractableText':empty,'editorialStatus':'pending-review','regressionPage':28}
print(json.dumps(report))
