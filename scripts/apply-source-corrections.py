"""Apply transcriptions checked against original page images to the cache."""
import hashlib,json,sys
from pathlib import Path
root=Path(sys.argv[1]);corrections=Path(__file__).parent/'source-corrections';count=0
for file in sorted(corrections.glob('*/*.md')):
 target=root/file.parent.name/(file.stem+'.json');page=json.loads(target.read_text(encoding='utf-8'));page['content']=file.read_text(encoding='utf-8').strip();page['printedPage']=int(file.stem);page['editorialReview']={'status':'source-transcription-checked','correctionFile':str(file.relative_to(Path(__file__).parent)).replace('\\','/'),'sha256':hashlib.sha256(file.read_bytes()).hexdigest()};page['method']='manual-transcription-checked-against-original-page';page['empty']=False;target.write_text(json.dumps(page,ensure_ascii=False),encoding='utf-8');count+=1
print(f'{count} source transcriptions applied; original PDFs unchanged')
