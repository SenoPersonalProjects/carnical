"""Build auditable description candidates with exact source spans.

Candidates require editorial review before publication. This script does not
invent costs or publish unverified extracted material into the application.
"""
from pathlib import Path
import difflib,json,re,sys,unicodedata

def fold(text):return re.sub(r'\s+',' ',re.sub(r'[^a-z0-9 ]','',unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower())).strip()
CONFIRMED_END_PAGES={'sabbat-black-hand-v5-formula-alquimia-do-sangue-fraco-on-demand-sunburn':54,'cultos-deuses-sangue-v5-ceremony-obl-vio-po-o-da-contempla-o':94}
ALIASES={'bond-famulus':['Famulus Enlaçado'],'unliving-hive':['Colmeia Não Viva'],'subsume-spirit':['Comunhão de Espíritos'],'quell-the-beast':['Acalmar a Besta'],'blink':['Piscadela'],'lingering-kiss':['Beijo Indelével'],'draught-might':['Força Direto da Fonte'],'sigilos-de-sangue-v5-ritual-feiti-aria-de-sangue-tiamat-glistens':['Tiamat Brilha']}

if __name__=='__main__':
 pages_root=Path(sys.argv[1]);seed=json.loads(Path(sys.argv[2]).read_text(encoding='utf-8'));out=Path(sys.argv[3]);out.mkdir(parents=True,exist_ok=True);books={};results=[];missing=[]
 for directory in pages_root.iterdir():
  if not directory.is_dir():continue
  text='';spans=[]
  for file in sorted(directory.glob('*.json')):
   page=json.loads(file.read_text(encoding='utf-8'))
   if page.get('extractionVersion',0)<2:continue
   start=len(text);text+=page['content']+'\n\n';spans.append((start,len(text),page['pdfPage'],page['printedPage']))
  headings=[]
  for match in re.finditer(r'^##\s+(.+)$',text,re.M):
   title=match[1]
   if len(title)>3 and not re.match(r'^(?:Level|Nível|Nivel)\s+\d',title,re.I):headings.append((match.start(),match.end(),title))
  # Visually verified split title on core PDF page 278 / printed page 276.
  # Join its adjacent heading lines for matching; do not change source text.
  if directory.name=='core-v5':
   joined=[];index=0
   while index<len(headings):
    current=headings[index]
    if index+1<len(headings):
     following=headings[index+1]
     if fold(current[2])=='despertar com o frescor' and fold(following[2])=='do anoitecer' and not text[current[1]:following[0]].strip():
      joined.append((current[0],following[1],current[2]+' '+following[2]));index+=2;continue
    joined.append(current);index+=1
   headings=joined
  books[directory.name]=(text,spans,headings)
 hits=[]
 for item in seed['POWER_CATALOG']:
  text,spans,headings=books.get(item['source']['book'],('',[],[]));names=[item['name']]+ALIASES.get(item['id'],[])
  scores=[(max(difflib.SequenceMatcher(None,fold(name),fold(h[2])).ratio() for name in names),h) for h in headings]
  source_range=re.search(r'pp\.\s*(\d+)\s*[–−-]\s*(\d+)',item['source']['label'])
  if source_range:
   lo,hi=map(int,source_range.groups());use_pdf='PDF' in item['source']['label']
   scores=[(score,h) for score,h in scores if any(a<=h[0]<b and (pdf if use_pdf else printed) is not None and lo<=(pdf if use_pdf else printed)<=hi for a,b,pdf,printed in spans)]
  scores.sort(key=lambda x:x[0],reverse=True)
  if not scores or scores[0][0]<0.82:missing.append({'id':item['id'],'name':item['name'],'book':item['source']['book'],'nearest':scores[:2]});continue
  score,heading=scores[0];hits.append((item,score,heading))
 for item,score,(start,body_start,title) in hits:
  text,spans,headings=books[item['source']['book']]
  boundaries=[h[0] for other,_,h in hits if other['source']['book']==item['source']['book'] and h[0]>body_start]
  if item['id'] in CONFIRMED_END_PAGES:
   boundaries.extend(a for a,b,pdf,printed in spans if pdf>CONFIRMED_END_PAGES[item['id']])
  # A new discipline or level heading belongs to the next rule, even when
  # the catalog does not yet contain the options following that heading.
  structural=re.compile(r'^##\s+(?:(?:Level|Nível|Nivel)\s+\d+(?:\s+Formulae)?|Animalism|Animalismo|Auspex|Auspícios|Celerity|Celeridade|Dominate|Dominação|Fortitude|Obfuscate|Ofuscação|Oblivion|Oblívio|Potence|Potência|Presence|Presença|Protean|Metamorfose|Blood Sorcery|Feitiçaria de Sangue|Thin-Blood Alchemy|Blood Sorcery Rituals|Oblivion Ceremonies)\s*$',re.M|re.I)
  boundaries.extend(match.start() for match in structural.finditer(text) if match.start()>body_start)
  source_range=re.search(r'pp\.\s*(\d+)\s*[–−-]\s*(\d+)',item['source']['label'])
  if source_range:
   # Legacy chapter ranges can omit a continuation page. Include one extra
   # page while using the next matched or structural heading as the main limit.
   hi=int(source_range[2])+1;use_pdf='PDF' in item['source']['label'];boundaries.extend(a for a,b,pdf,printed in spans if (pdf if use_pdf else printed) is not None and (pdf if use_pdf else printed)>hi)
  end=min(boundaries) if boundaries else min(len(text),body_start+14000);content=text[body_start:end].strip()
  content=re.sub(r'^##\s+(?:Level|Nível|Nivel)\s+\d.*$', '',content,flags=re.M|re.I).strip()
  page_refs=[{'pdfPage':pdf,'printedPage':printed} for a,b,pdf,printed in spans if b>start and a<end]
  # Preserve the complete span; section splitting is only presentation.
  sections=[];last=0;label='Descrição' if item['source']['book'] not in ['chicago-by-night-v5','players-guide-v5','sabbat-black-hand-v5','gehenna-war-v5'] else 'Description'
  pattern=re.compile(r'(?m)(?:^|\n)(?:[■▪•E]\s*)?(Cost|Custo|System|Sistema|Duration|Duração|Dice Pools?|Paradas? de Dados|Amalgam|Amálgama|Prerequisite|Pré-requisito|Ingredients|Ingredientes|Process|Processo)\s*:\s*',re.I)
  for match in pattern.finditer(content):
   if content[last:match.start()].strip():sections.append({'title':label,'text':content[last:match.start()].strip()})
   label=match[1];last=match.end()
  if content[last:].strip():sections.append({'title':label,'text':content[last:].strip()})
  results.append({'id':item['id'],'kind':item.get('kind','power'),'name':item['name'],'sourceName':title,'discipline':item['discipline'],'level':item['level'],'book':item['source']['book'],'pages':page_refs,'sections':sections,'source':item['source'],'matchScore':score,'reviewed':False,'hasSystem':bool(re.search(r'System|Sistema',content,re.I))})
 (out/'candidates.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8');(out/'missing.json').write_text(json.dumps(missing,ensure_ascii=False,indent=2),encoding='utf-8');print(f'{len(results)} candidates, {len(missing)} unmatched')
