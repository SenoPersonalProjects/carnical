"""Measure cache completeness and translation freshness without certifying drafts."""
import hashlib,json,sys
from pathlib import Path
root=Path(sys.argv[1]);translations=Path(sys.argv[2]);manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'));report=[]
for book in manifest:
 missing=[];outdated=[];translated=0;numeric=[];reviewed=[]
 for number in range(1,book['pages']+1):
  file=root/book['id']/f'{number:04}.json'
  if not file.exists():missing.append(number);continue
  page=json.loads(file.read_text(encoding='utf-8'));target=translations/book['id']/file.name
  if page.get('editorialReview',{}).get('status')=='source-transcription-checked':reviewed.append(number)
  if not target.exists():continue
  value=json.loads(target.read_text(encoding='utf-8'))
  if value['sourceHash']!=hashlib.sha256(page['content'].encode()).hexdigest():outdated.append(number);continue
  translated+=1
  if value.get('numberReviewRequired'):numeric.append(number)
 report.append({'book':book['id'],'sourcePages':book['pages'],'missingPages':missing,'currentDraftTranslations':translated,'outdatedTranslations':outdated,'numericReviewPages':numeric,'transcribedSourcePagesChecked':reviewed})
output=translations.parent/'cache-audit.json';output.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
for row in report:print(f'{row["book"]}: {row["sourcePages"]-len(row["missingPages"])}/{row["sourcePages"]} extracted; {row["currentDraftTranslations"]} current drafts, {len(row["numericReviewPages"])} numeric flags; {len(row["transcribedSourcePagesChecked"])} checked source transcriptions')
