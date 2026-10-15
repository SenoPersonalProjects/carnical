"""Report extraction risks without treating automatic matches as reviewed rules."""
import json,re,sys
from pathlib import Path

root=Path(sys.argv[1]);entries=json.loads((root/'candidates.json').read_text(encoding='utf-8'));report=[]
for entry in entries:
 text='\n\n'.join(section['text'] for section in entry['sections']);issues=[]
 if not entry['hasSystem']:issues.append('system-section-not-detected')
 if not entry['pages']:issues.append('no-source-page')
 if len(entry['pages'])>3:issues.append('span-longer-than-three-pages')
 if '\ufffd' in text:issues.append('replacement-character')
 if len(text)<120:issues.append('very-short-description')
 if re.search(r'^##\s+(?:Level|Nível|Nivel|Animalism|Auspex|Celerity|Dominate|Fortitude|Obfuscate|Oblivion|Potence|Presence|Protean)\b',text,re.M|re.I):issues.append('possible-next-rule-in-span')
 if issues:report.append({'id':entry['id'],'name':entry['name'],'book':entry['book'],'pages':entry['pages'],'issues':issues})
(root/'review-risks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'candidates':len(entries),'flagged':len(report),'unreviewed':sum(not entry['reviewed'] for entry in entries),'issues':{issue:sum(issue in row['issues'] for row in report) for issue in sorted({issue for row in report for issue in row['issues']})}}))
