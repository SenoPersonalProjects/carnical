"""Compile the persisted editorial records, never raw OCR/translation caches."""
import json
from pathlib import Path
repo=Path(__file__).resolve().parent.parent
records=json.loads((repo/'scripts/loresheet-transcriptions.json').read_text(encoding='utf-8'))
book_names={'core-v5':'Livro Básico V5','chicago-by-night-v5':'Chicago by Night V5','camarilla-v5':'Camarilla V5','anarch-v5':'Anarch V5','cultos-deuses-sangue-v5':'Cultos dos Deuses de Sangue V5','gehenna-war-v5':'Gehenna War V5','sigilos-de-sangue-v5':'Sigilos de Sangue V5','let-the-streets-run-red-v5':'Let the Streets Run Red V5'}
general={
 'pt-BR':'Cada benefício é comprado separadamente pelo seu valor completo: não exige nem concede os níveis inferiores. Na criação, gaste os pontos de Vantagens correspondentes; durante o jogo, custa 3 XP por ponto, com aprovação do Narrador. Escolha uma única Ficha de Conhecimento comum; uma Linhagem de Sangue pode ser adquirida separadamente. Benefícios temporários, favorecimentos, aliados e concessões narrativas devem ser resolvidos com o Narrador conforme o texto deste benefício.',
 'en':'Purchase each benefit separately at its full rating: it neither requires nor grants lower ranks. At creation, spend the corresponding Advantage dots; during play it costs 3 XP per dot, with Storyteller approval. Choose one ordinary Loresheet; one Bloodline may be acquired separately. Resolve temporary benefits, favors, supporting characters and narrative grants with the Storyteller as described in this benefit.'}
for record in records:
 versions=[]
 for row in record['ranks']:
  rank=row['rank'];req={**record['requirements'],'loresheetGroup':'lore','independentChoice':str(rank),'repeatableDifferentChoices':True,'storytellerApproval':True,**row.get('requirements',{})}
  descriptions={locale:[{'title':row['title'][locale],'text':row['text'][locale]},{'title':'Compra e uso' if locale=='pt-BR' else 'Purchase and use','text':general[locale]}] for locale in ['pt-BR','en']}
  uncertain_ranks={'loresheet-eternal-arena':[1],'loresheet-fires-floods-devils-night':[4],'loresheet-lupine-expert':[3],'loresheet-maxwell':[3],'loresheet-agata-starek':[5]}
  if record.get('review',{}).get('sourceUncertainties') and rank in uncertain_ranks.get(record['id'],[1,2,3,4,5]):
   for locale in descriptions:descriptions[locale].append({'title':'Nota sobre a fonte' if locale=='pt-BR' else 'Source note','text':'Esta fonte contém redação ambígua, mantida sem criar uma regra alternativa. Consulte a página original e confirme a aplicação com o Narrador.' if locale=='pt-BR' else 'This source contains ambiguous wording, preserved without inventing an alternative rule. Consult the original page and confirm its application with the Storyteller.'})
  versions.append({'id':f'{record["id"]}-{record["book"]}-{rank}','book':record['book'],'level':rank,'names':{locale:record['names'][locale]+' — '+row['title'][locale] for locale in ['pt-BR','en']},'sourceLanguage':record['language'],'sourceTitle':book_names[record['book']]+', p. '+', '.join(str(p['printedPage']) for p in record['pages'])+f' · {rank}','pages':record['pages'],'requirements':req,'descriptions':descriptions})
 dest=repo/'scripts/reviewed-content'/f'{record["id"]}.json'
 existing=json.loads(dest.read_text(encoding='utf-8')) if dest.exists() else {'id':record['id'],'kind':'loresheet','names':record['names'],'aliases':[],'versions':[]}
 existing['versions']=[v for v in existing['versions'] if v['book']!=record['book']]+versions
 existing['aliases']=list(dict.fromkeys(existing['aliases']+list(record['names'].values())+[name for version in versions for name in version['names'].values()]))
 dest.write_text(json.dumps(existing,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(records)} source loresheets compiled from persisted bilingual transcriptions')
