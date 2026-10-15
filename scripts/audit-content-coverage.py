"""Report reviewed coverage without treating extraction/translation as verification."""
import collections,json,sys
from pathlib import Path
repo=Path(__file__).resolve().parent.parent
work=Path(sys.argv[1])
sources=json.loads((work/'pages/manifest.json').read_text(encoding='utf-8'))
catalog=json.loads((repo/'app/content/catalog.json').read_text(encoding='utf-8'))['entries']
candidates=json.loads((work/'catalog/candidates.json').read_text(encoding='utf-8'))
rows=[]
for source in sources:
 pages=list((work/'pages'/source['id']).glob('*.json'))
 numbers=[json.loads(page.read_text(encoding='utf-8'))['pdfPage'] for page in pages]
 assert sorted(numbers)==list(range(1,source['pages']+1)),f"Missing or duplicate source pages: {source['id']}"
 reviewed=[entry for entry in catalog if any(version['book']==source['id'] for version in entry['versions'])]
 indexed=[entry for entry in candidates if entry['book']==source['id']]
 pending=[entry['id'] for entry in indexed if not any((item['id']==entry['id'] or entry['id'] in item.get('legacyIds',[])) and any(version['book']==source['id'] for version in item['versions']) for item in reviewed)]
 rows.append({'book':source['id'],'pdfSha256':source['sha256'],'pdfPages':source['pages'],'extractedPages':len(numbers),'reviewedEntries':len(reviewed),'reviewedKinds':dict(collections.Counter(entry['kind'] for entry in reviewed)),'seededDescriptionCandidates':len(indexed),'seededCandidatesAwaitingReview':len(pending),'pendingSeededIds':pending,'inventoryStatus':'incomplete','libraryTranslationStatus':'awaiting-editorial-review'})
report={'status':'incomplete','sources':rows,'uniqueReviewedEntries':len(catalog),'notes':['Seeded candidates cover the existing power catalog only; they are not a complete inventory of character options.','Extracted pages are not editorially verified pages.','Unreviewed translations and descriptions are excluded from the published shared catalog.','No source has been declared fully covered. Narrative exclusions still require inventory and justification.']}
(work/'coverage-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'sources':len(rows),'extractedPages':sum(row['extractedPages'] for row in rows),'uniqueReviewedEntries':len(catalog),'status':report['status']},ensure_ascii=False))
