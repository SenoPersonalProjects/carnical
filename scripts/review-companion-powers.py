"""Compile paired source texts after comparing the Companion and Player's Guide.

Edition differences are explicit substitutions, never inferred by translation.
The original PDFs and cached pages remain read-only.
"""
import copy,json,re,sys
from pathlib import Path
work=Path(sys.argv[1]);repo=Path(__file__).resolve().parent.parent
manifest=json.loads((work/'pages/manifest.json').read_text(encoding='utf-8'))
def pages(book,start,end):
 return '\n\n'.join(json.loads((work/'pages'/book/f'{n:04}.json').read_text(encoding='utf-8'))['content'] for n in range(start,end+1))
def span(text,title,next_title):
 start=re.search(r'^## '+re.escape(title)+r'\s*$',text,re.M|re.I)
 assert start,title
 tail=text[start.end():]
 if next_title:
  end=re.search(r'^## '+re.escape(next_title)+r'\s*$',tail,re.M|re.I);assert end,next_title;tail=tail[:end.start()]
 return tail.strip()
def replace_exact(text,before,after):
 assert before in text,before
 return text.replace(before,after,1)
def clean(text):
 text=re.sub(r'^##\s+[\x80-\x9f]\s*\n+', '',text,flags=re.M)
 text=re.sub(r'^## (?:Nível|Level) \d+\s*$', '',text,flags=re.M|re.I)
 text=re.sub(r'^## (?:Auspícios|Auspex|Ofuscação|Obfuscate|Proteanismo|Protean)\s*$', '',text,flags=re.M|re.I)
 text=re.sub(r'Vampire:\s*(?:##\s*)?The Masquerade', 'Vampire: The Masquerade',text)
 text=re.sub(r'^## (Masquerade, p\. 304\))',r'\1',text,flags=re.M)
 names=r'Redistribution|Redistribuição|Weapons \(Once per subject only\)|Armas \(Apenas uma vez por alvo\)|Armor|Armadura|Appearance|Aparência|Other changes|Outras alterações'
 text=re.sub(r'^## ('+names+r'):\s*([^\n]+)\n\n',r'- **\1:** \2 ',text,flags=re.M)
 text=re.sub(r'\n{3,}','\n\n',text)
 return text.strip()
def sections(text,english,amalgam,prerequisite):
 text=clean(text)
 text=re.sub(r'^Am(?:á|a)lgam(?:a)?:\s*'+re.escape(amalgam)+r'\s*','',text,flags=re.I)
 if prerequisite:text=re.sub(r'^Pr(?:é|e)-?requisit(?:o|e):\s*'+re.escape(prerequisite)+r'\s*','',text,flags=re.I)
 # English spells Prerequisite without a hyphen; Portuguese uses Pré-requisito.
 if prerequisite:text=re.sub(r'^Prerequisite:\s*'+re.escape(prerequisite)+r'\s*','',text,flags=re.I)
 labels={'Cost':'Cost','Custo':'Custo','Dice Pool':'Dice Pool','Dice Pools':'Dice Pool','Parada de Dados':'Parada','Paradas de Dados':'Parada','System':'System','Sistema':'Sistema','Duration':'Duration','Duração':'Duração'}
 output=[];last=0;label='Description' if english else 'Descrição'
 pattern=re.compile(r'\b(Cost|Custo|Dice Pools?|Paradas? de Dados|System|Sistema|Duration|Duração):\s*')
 for match in pattern.finditer(text):
  body=text[last:match.start()].strip()
  if body:output.append({'title':label,'text':body})
  label=labels[match[1]];last=match.end()
 if text[last:].strip():output.append({'title':label,'text':text[last:].strip()})
 return output

# id, PT name, EN name, discipline, level, amalgam PT/EN, prerequisites PT/EN,
# Companion pages, next heading, Guide pages, next heading
records=[
 ('unburdening-bestial-soul','Aliviando a Alma Bestial','Unburdening the Bestial Soul','Auspícios',5,'Dominação 3','Dominate 3','Obeah','Panacea',(24,25),'Dominação',(73,74),'Celerity'),
 ('chimerstry','Quimerismo','Chimerstry','Ofuscação',2,'Presença 1','Presence 1',None,None,(25,26),'fata morgana',(78,79),'FATA MORGANA'),
 ('fata-morgana','Fata Morgana','Fata Morgana','Ofuscação',3,'Presença 2','Presence 2',None,None,(26,26),'Proteanismo',(79,79),'MENTAL MAZE'),
 ('players-guide-v5-power-proteanismo-vicissitude','Vicissitude','Vicissitude','Proteanismo',2,'Dominação 2','Dominate 2',None,None,(26,27),'modelagem de carne',(83,84),'FLESHCRAFTING'),
 ('players-guide-v5-power-proteanismo-fleshcrafting','Modelagem de Carne','Fleshcrafting','Proteanismo',3,'Dominação 2','Dominate 2','Vicissitude','Vicissitude',(27,28),'forma hedionda',(84,85),'HORRID FORM'),
 ('players-guide-v5-power-proteanismo-horrid-form','Forma Hedionda','Horrid Form','Proteanismo',4,'Dominação 2','Dominate 2','Vicissitude','Vicissitude',(28,28),'um com a terra',(85,85),'ONE WITH THE LAND'),
 ('players-guide-v5-power-proteanismo-one-with-the-land','Um com a Terra','One with the Land','Proteanismo',5,'Animalismo 2','Animalism 2','Fusão com a Terra','Earth Meld',(28,28),None,(85,86),'Oblivion'),
]
for id,pt,en,discipline,level,amalgam_pt,amalgam_en,prereq_pt,prereq_en,comp_pages,comp_next,guide_pages,guide_next in records:
 portuguese=span(pages('companion-v5',*comp_pages),pt,comp_next)
 english=span(pages('players-guide-v5',*guide_pages),en,guide_next)
 companion_en=english;guide_pt=portuguese
 if id=='unburdening-bestial-soul':
  companion_en=replace_exact(companion_en,'Prerequisite: Panacea','Prerequisite: Obeah')
  companion_en=replace_exact(companion_en,'and automatically fails if the subject has a higher Humanity than the user.','and only on subjects whose Humanity is lower than the user’s.')
  guide_pt=replace_exact(guide_pt,'Pré-requisito: Obeah','Pré-requisito: Panacea')
  guide_pt=replace_exact(guide_pt,'e apenas em alvos cuja Humanidade esteja menor do que a do usuário.','e falha automaticamente se a Humanidade do alvo for maior que a do usuário.')
 if id=='chimerstry':
  companion_en=replace_exact(companion_en,'Unlike most Presence powers Chimerstry can be used during a stressful physical conflict such as combat, but targets can only be affected once per conflict. ','')
  guide_pt=replace_exact(guide_pt,'Outros efeitos resultantes','Diferentemente da maioria dos poderes de Presença, Quimerismo pode ser usado durante um conflito físico estressante, como combate, mas cada alvo só pode ser afetado uma vez por conflito. Outros efeitos resultantes')
 if id=='fata-morgana':
  companion_en=replace_exact(companion_en,' If the hallucination could cause Frenzy or similar reactions in its targets, apply the same test at a Difficulty of one lower than the real thing.','')
  guide_pt=replace_exact(guide_pt,'Duração:','Se a alucinação puder provocar Frenesi ou reações semelhantes, aplique o mesmo teste com Dificuldade um ponto menor do que a situação real.\n\nDuração:')
 if id.endswith('-vicissitude'):
  companion_en=replace_exact(companion_en,' Note that player characters need to keep track of their original values as these are still used to calculate experience cost for Attributes.','')
  companion_en=replace_exact(companion_en,' While vampires gain little benefit from this, apart from a disturbing appearance, it serves a purpose on mortal and ghoul retainers. (See Fleshcrafting, below.)','')
  guide_pt=replace_exact(guide_pt,'Estas alterações são visíveis, porém não ameaçam a Máscara.','Estas alterações são visíveis, porém não ameaçam a Máscara. Personagens jogadores precisam registrar os valores originais, pois eles continuam sendo usados para calcular o custo de XP dos Atributos.')
  guide_pt=replace_exact(guide_pt,'## Aparência:','Vampiros obtêm pouco benefício dessa armadura além da aparência perturbadora, mas ela é útil para servos mortais e carniçais; consulte Modelagem de Carne.\n\n## Aparência:')
 if id.endswith('-one-with-the-land'):
  companion_en=replace_exact(companion_en,'roughly one kilometer','1.6 kilometers')
  guide_pt=replace_exact(guide_pt,'1,6 quilômetro','aproximadamente um quilômetro')
 versions=[]
 for book,range_,pt_body,en_body,pt_prerequisite,en_prerequisite in [('players-guide-v5',guide_pages,guide_pt,english,prereq_en,prereq_en),('companion-v5',comp_pages,portuguese,companion_en,prereq_pt,prereq_pt)]:
  offset=2 if book=='players-guide-v5' else 0
  requirements={'disciplines':{discipline:level,amalgam_pt.rsplit(' ',1)[0]:int(amalgam_pt.rsplit(' ',1)[1])}}
  canonical=pt_prerequisite
  if canonical=='Earth Meld':canonical='Fusão com a Terra'
  if canonical:requirements['prerequisites']=[canonical]
  # The translated prerequisite title remains localized in presentation.
  if book=='players-guide-v5' and prereq_pt=='Fusão com a Terra':pt_prerequisite=prereq_pt
  descriptions={'pt-BR':sections(pt_body,False,amalgam_pt,pt_prerequisite),'en':sections(en_body,True,amalgam_en,'Obeah' if book=='companion-v5' and id=='unburdening-bestial-soul' else prereq_en)}
  for language,content in descriptions.items():
   requirement=('Amalgam: '+amalgam_en if language=='en' else 'Amálgama: '+amalgam_pt)
   required_name=('Obeah' if book=='companion-v5' and id=='unburdening-bestial-soul' else prereq_en) if language=='en' else pt_prerequisite
   if required_name:requirement+=('. Prerequisite: ' if language=='en' else '. Pré-requisito: ')+required_name+'.'
   content.insert(1,{'title':'Requirements' if language=='en' else 'Requisitos','text':requirement})
  source=next(item for item in manifest if item['id']==book)
  versions.append({'id':id+'-'+book,'book':book,'sourceTitle':('Player’s Guide V5' if book=='players-guide-v5' else 'Companion V5')+', pp. '+str(range_[0]-offset)+('–'+str(range_[1]-offset) if range_[1]!=range_[0] else ''),'sourceLanguage':'en' if book=='players-guide-v5' else 'pt-BR','pdfSha256':source['sha256'],'level':level,'pages':[{'pdfPage':n,'printedPage':n-offset} for n in range(range_[0],range_[1]+1)],'requirements':requirements,'descriptions':descriptions})
 entry={'id':id,'kind':'power','names':{'pt-BR':pt,'en':en},'aliases':[pt,en],'discipline':discipline,'level':level,'versions':versions}
 (repo/'scripts/reviewed-content'/f'{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(records)} paired powers, {len(records)*2} source versions compiled')
