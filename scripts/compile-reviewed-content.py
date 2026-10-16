"""Publish only explicit source transcriptions and reviewed bilingual entries."""
import json,re,sys
from pathlib import Path
repo=Path(__file__).resolve().parent.parent;work=Path(sys.argv[1]);candidates=json.loads((work/'catalog/candidates.json').read_text(encoding='utf-8'));manifest=json.loads((work/'pages/manifest.json').read_text(encoding='utf-8'));book='cultos-deuses-sangue-v5';source=next(row for row in manifest if row['id']==book)
items=[('o-chamado-do-viajante','O Chamado do Viajante','The Traveler’s Call','travelers-call',1,'Oblivion’s Sight'),('nome-do-pai','Nome do Pai','The Father’s Name','fathers-name',3,'Shadow Perspective'),('po-o-da-contempla-o','Poço da Contemplação','Pit of Contemplation','pit-of-contemplation',5,'Tenebrous Avatar')]
raw=json.loads((repo/'app/content/catalog.json').read_text(encoding='utf-8'));entries={entry['id']:entry for entry in raw['entries']}
for suffix,name,en_name,file,level,prerequisite in items:
 candidate=next(row for row in candidates if row['book']==book and row['name']==name);id=candidate['id']
 transcribed='\n\n'.join((repo/'scripts/source-corrections'/book/f'{page:04}.md').read_text(encoding='utf-8') for page in [93,94])
 text=transcribed.split(f'## {name}\n',1)[1].split('\n## ',1)[0].strip()
 sections=[];label='Descrição';last=0
 for match in re.finditer(r'(?:^|\n\n)(Poder pré-requisito|Ingredientes|Processo|Sistema):\s*',text):
  if text[last:match.start()].strip():sections.append({'title':label,'text':text[last:match.start()].strip()})
  label={'Poder pré-requisito':'Requisitos','Ingredientes':'Ingredientes','Processo':'Processo','Sistema':'Sistema'}[match[1]];last=match.end()
 if text[last:].strip():sections.append({'title':label,'text':text[last:].strip()})
 english=(repo/'scripts/reviewed-content'/f'{file}.en.md').read_text(encoding='utf-8');en_sections=[{'title':title.strip(),'text':body.strip()} for title,body in re.findall(r'^## (.+)\n+([\s\S]*?)(?=^## |\Z)',english,re.M)]
 for locale,values in [('pt-BR',sections),('en',en_sections)]:
  en=locale=='en';values.append({'title':'Cost' if en else 'Custo','text':'One Rouse Check. '+str(level*5)+' minutes to perform, under the general Ceremony rules (p. 208).' if en else f'Um Teste de Sangue. {level*5} minutos para realizar, conforme as regras gerais de Cerimônias (p. 208).'})
  pool=f'Resolve + Oblivion; '+('Difficulty 3 (specific exception).' if level==1 else 'opposed by the victim’s Resolve + Composure.' if level==3 else 'Difficulty 6. The target resists with Dexterity + Athletics, Difficulty 4.') if en else 'Determinação + Oblívio; '+('Dificuldade 3 (exceção específica).' if level==1 else 'contra Determinação + Autocontrole da vítima.' if level==3 else 'Dificuldade 6. O alvo resiste com Destreza + Atletismo, Dificuldade 4.')
  values.append({'title':'Dice Pool' if en else 'Parada','text':pool})
  values.append({'title':'Learning and exceptions' if en else 'Aprendizado e exceções','text':('Shalimite Ceremonies are rarely taught to outsiders, though a suitable Mawla can teach them. The Storyteller may suggest alternative prerequisite powers when the referenced books are unavailable. Under the general rules on p. 208, each new Ceremony costs its level × 3 XP and requires its prerequisite power. Learning during play requires a teacher who knows it and at least level squared weeks. At creation, one level 1 Ceremony may be chosen when its prerequisite power is known. Unless specifically stated otherwise, beneficial Ceremonies affect only the user. Ghouls, necromancers, or thin-bloods gaining temporary Oblivion powers from empty temperaments do not gain Ceremonies.' if en else 'As Cerimônias Shalimitas raramente são ensinadas a estranhos, embora possam ser aprendidas com um Mawla adequado. O Narrador pode sugerir poderes pré-requisitos alternativos se os livros citados não estiverem disponíveis. Conforme a regra geral da p. 208, cada nova Cerimônia custa nível × 3 XP e exige o poder pré-requisito. Durante o jogo, o aprendizado exige um professor que conheça a Cerimônia e pelo menos o quadrado de seu nível em semanas. Na criação, pode-se escolher uma Cerimônia de nível 1 se o poder pré-requisito for conhecido. Salvo indicação contrária, Cerimônias benéficas só afetam o próprio usuário. Carniçais, necromantes ou sangues-ralos que obtenham poderes temporários de Oblívio por temperamentos vazios não recebem Cerimônias.')})
 pages=[{'pdfPage':page,'printedPage':page} for page in ([93,94,208] if level==1 else [94,208])]
 entries[id]={'id':id,'kind':'ceremony','names':{'pt-BR':name,'en':en_name},'aliases':[name,en_name],'discipline':'Oblívio','level':level,'versions':[{'id':id+'-cultos-pt','book':book,'sourceTitle':'Cultos dos Deuses de Sangue V5, pp. '+('93–94' if level==1 else '94')+' e 208','pages':pages,'pdfSha256':source['sha256'],'sourceLanguage':'pt-BR','descriptions':{'pt-BR':sections,'en':en_sections},'requirements':{'disciplines':{'Oblívio':level},'prerequisites':[prerequisite]}}]}
for file in (repo/'scripts/reviewed-content').glob('*.json'):
 entry=json.loads(file.read_text(encoding='utf-8'))
 for version in entry['versions']:version['pdfSha256']=next(row for row in manifest if row['id']==version['book'])['sha256']
 entries[entry['id']]=entry
(repo/'app/content/catalog.json').write_text(json.dumps({'entries':list(entries.values())},ensure_ascii=False,indent=2),encoding='utf-8');index=[{key:entry[key] for key in ['id','kind','names','aliases','discipline','level'] if key in entry}|{'books':list(dict.fromkeys(version['book'] for version in entry['versions']))} for entry in entries.values()]
for row in index:
 if entries[row['id']].get('legacyIds'):row['legacyIds']=entries[row['id']]['legacyIds']
 row['versions']=[{key:version[key] for key in ['id','book','sourceTitle','level','requirements','names','grants'] if key in version} for version in entries[row['id']]['versions']]
(repo/'app/content/catalog-index.json').write_text(json.dumps({'entries':index},ensure_ascii=False,indent=2),encoding='utf-8');print(f'{len(entries)} reviewed entries compiled')
