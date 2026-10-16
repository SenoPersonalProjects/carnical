"""The sixteen unrated Core Thin-blood Merits/Flaws, original PDF184–186."""
import json,sys,copy
from pathlib import Path
repo=Path(__file__).resolve().parent.parent;work=Path(sys.argv[1]);out=repo/'scripts/reviewed-content'
source=next(s for s in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if s['id']=='core-v5')
common_pt='Somente Sangue-Ralo. Na criação, escolha de uma a três Qualidades especiais e a mesma quantidade de Defeitos especiais. Não possuem valor em pontos e não consomem nem fornecem os pontos comuns de Vantagens/Defeitos. Cada Defeito compensa uma Qualidade. Não são adquiridos com XP.'
common_en='Thin-blood only. At creation choose one to three special Merits and the same number of special Flaws. They have no dot value and neither consume nor provide ordinary Advantage/Flaw dots. Each Flaw balances one Merit. They are not purchased with XP.'
def add(slug,pt,en,kind,pages,body,english,excludes=(),extra_pt='',extra_en='',grant=None,variants=None):
 id='thin-blood-'+slug;requirements={'clans':['Sangue-Ralo'],'creationOnly':True,'selectionGroup':'thin-blood-'+kind}
 if excludes:requirements['incompatibleItems']=['thin-blood-'+s for s in excludes]
 base={'id':id+'-core-v5','book':'core-v5','level':0,'sourceTitle':'Livro Básico V5, pp. '+', '.join(str(p-2) for p in sorted(set([153,184]+pages))),'sourceLanguage':'pt-BR','pdfSha256':source['sha256'],'pages':[{'pdfPage':p,'printedPage':p-2} for p in sorted(set([153,184]+pages))],'requirements':requirements,'descriptions':{
  'pt-BR':[{'title':'Sistema','text':body},{'title':'Escolhas e custo','text':common_pt}]+([{'title':'Exceções','text':extra_pt}] if extra_pt else []),
  'en':[{'title':'System','text':english},{'title':'Choices and cost','text':common_en}]+([{'title':'Exceptions','text':extra_en}] if extra_en else [])}}
 if grant:base['grants']={'discipline':grant,'level':1}
 versions=[]
 if variants:
  for suffix,label_pt,label_en,grant_name,required_ids,added_sections,added_pages in variants:
   version=copy.deepcopy(base);version['id']+='-'+suffix;version['names']={'pt-BR':pt+' — '+label_pt,'en':en+' — '+label_en};version['sourceTitle']+=' · '+label_pt
   if grant_name:version['grants']={'discipline':grant_name,'level':1}
   if required_ids:version['requirements']['items']=required_ids
   for locale,sections in added_sections.items():version['descriptions'][locale]+=sections
   for p in added_pages:
    if not any(ref['pdfPage']==p for ref in version['pages']):version['pages'].append({'pdfPage':p,'printedPage':p-2})
   versions.append(version)
 else:versions=[base]
 aliases=list(dict.fromkeys([pt,en]+[name for version in versions for name in version.get('names',{}).values()]))
 entry={'id':id,'kind':kind,'level':0,'names':{'pt-BR':pt,'en':en},'aliases':aliases,'versions':versions}
 (out/('core-'+id+'.json')).write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
add('baby-teeth','Dente de Leite','Baby Teeth','flaw',[184],
'Não desenvolveu presas úteis para se alimentar. Precisa cortar a vítima ou extrair o sangue com seringa.',
'Never developed fangs useful for feeding. Must cut the victim or extract blood with a syringe.')
add('bestial-temper','Temperamento Bestial','Bestial Temper','flaw',[184],
'A Besta o atormenta como a um vampiro pleno. Precisa testar para Frenesi conforme as regras normais dos vampiros; perde a exceção de não entrar naturalmente em Frenesi dos Sangues-Ralos.',
'The Beast torments you like a full vampire. Test for frenzy under normal vampire rules; the Thin-blood exception against natural frenzy no longer applies.')
add('camarilla-branded','Marcado pela Camarilla','Camarilla Branded','flaw',[184,185],
'Carrega uma marca incurável imposta por um Xerife ou outra autoridade da Camarilla para lembrar seu lugar. A seita vigia possíveis transgressões e pode caçá-lo por desprezo ou capricho. A marca não é apenas uma tatuagem comum que desaparece com recuperação.',
'Bears an incurable brand imposed by a Sheriff or another Camarilla authority as a reminder of your place. The sect watches for transgressions and may hunt you out of contempt or whim. This is not an ordinary tattoo that disappears through mending.',
extra_pt='Pode possuir Contato na Camarilla ao mesmo tempo. O livro permite explicitamente essa combinação.',extra_en='May also possess Camarilla Contact. The book explicitly permits this combination.')
clan_variants=[]
for slug,name in [('brujah','Brujah'),('gangrel','Gangrel'),('malkavian','Malkaviano'),('nosferatu','Nosferatu'),('toreador','Toreador'),('tremere','Tremere'),('ventrue','Ventrue')]:
 clan=json.loads((out/('core-clan-'+slug+'.json')).read_text(encoding='utf-8'));version=clan['versions'][0]
 required=['thin-blood-bestial-temper'] if slug in ['brujah','gangrel'] else ['thin-blood-catenating-blood'] if slug=='tremere' else []
 sections={locale:[{'title':'Perdição escolhida' if locale=='pt-BR' else 'Chosen Bane','text':('Aplique a Perdição abaixo com Gravidade fixa 1. Não recebe a Compulsão do clã.\n\n' if locale=='pt-BR' else 'Apply the following Bane at fixed Severity 1. Does not gain the clan Compulsion.\n\n')+version['descriptions'][locale][1]['text']}] for locale in ['pt-BR','en']}
 clan_variants.append((slug,name,clan['names']['en'],None,required,sections,[version['pages'][0]['pdfPage']]))
add('clan-curse','Maldição de Clã','Clan Curse','flaw',[185],
'Vestígios do Sangue de seu Senhor impõem uma Perdição de Clã escolhida, com Gravidade da Perdição 1. Brujah ou Gangrel exigem Temperamento Bestial; Tremere exige Sangue Agregador.',
'Traces of the sire’s Blood impose a chosen clan Bane at Bane Severity 1. Brujah or Gangrel requires Bestial Temper; Tremere requires Catenating Blood.',variants=clan_variants)
add('dead-flesh','Carne Morta','Dead Flesh','flaw',[185],
'Sua carne se decompõe continuamente, com tonalidade esverdeada e leve odor de podridão. Qualquer exame médico o identifica imediatamente como morto. Sofre −1 dado em testes Sociais presenciais contra mortais.',
'Flesh continuously decays, with a greenish tint and faint odor of rot. Any medical examination immediately identifies you as dead. Suffer −1 die on face-to-face Social tests against mortals.',excludes=['lifelike'])
add('mortal-frailty','Fragilidade Mortal','Mortal Frailty','flaw',[128,129,185],
'Não pode realizar Checagens de Sangue para recuperar dano; cura-se como mortal. No início da sessão, remove até Vigor de dano Superficial de Vitalidade. Para converter dano Agravado em Superficial, alguém com Medicina rola Inteligência + Medicina contra Dificuldade igual ao dano Agravado total; tratar a si mesmo acrescenta +1 à Dificuldade. Converte no máximo metade de Medicina, arredondada para cima, ao longo da noite. O Narrador decide se os ferimentos restantes exigem outro dia de tratamento ou hospitalização. Hospitalização dispensa novas rolagens, mas a cura completa leva semanas iguais ao dano Agravado total, com ajustes narrativos a critério do Narrador.',
'Cannot make Rouse Checks to mend damage; heals as a mortal. At the start of a session, remove up to Stamina Superficial Health damage. To convert Aggravated damage to Superficial, someone with Medicine rolls Intelligence + Medicine against Difficulty equal to total Aggravated damage; self-treatment adds +1 Difficulty. Convert at most half Medicine, rounded up, over the night. The Storyteller decides whether remaining injuries require another day of treatment or hospitalization. Hospitalization needs no further rolls, but complete healing takes weeks equal to total Aggravated damage, with narrative adjustments at the Storyteller’s discretion.',excludes=['vampiric-resilience'])
add('shunned-anarchs','Segregado pelos Anarchs','Shunned by the Anarchs','flaw',[185],
'Os Anarchs do domínio o conhecem e evitam, seja por uma lei não escrita violada ou por ter presumido igualdade. Preferem entregá-lo à Camarilla a ouvir seus apelos.',
'The domain’s Anarchs know and avoid you, whether for breaking an unwritten rule or presuming equality. They would rather hand you to the Camarilla than hear your appeals.',excludes=['anarch-comrades'])
add('vitae-dependency','Dependência de Vitae','Vitae Dependency','flaw',[185],
'Precisa beber Sangue vampírico suficiente para saciar pelo menos 1 Fome por semana. Sem isso, perde a capacidade de ganhar e usar quaisquer Disciplinas, incluindo Alquimia do Sangue-Fraco. Recupera os poderes assim que sacia ao menos 1 Fome com Vitae.',
'Must drink enough vampire Blood to slake at least 1 Hunger each week. Otherwise loses the ability to gain or use any Disciplines, including Thin-blood Alchemy. Powers return as soon as at least 1 Hunger is slaked with Vitae.')
add('anarch-comrades','Camaradas Anarchs','Anarch Comrades','merit',[185],
'Uma coterie Anarch tolera sua presença ou o trata como mascote. Seus integrantes atuam em conjunto como um Mawla Anarch de 1 ponto, desde que siga a linha política deles. Inclua-os no Mapa de Relacionamentos.',
'An Anarch coterie tolerates your presence or treats you as a pet. Together its members act as a one-dot Anarch Mawla as long as you follow their political line. Add them to the Relationship Map.',excludes=['shunned-anarchs'])
add('camarilla-contact','Contato na Camarilla','Camarilla Contact','merit',[185],
'Um recrutador promete admissão e a chance de se tornar um vampiro pleno. Em troca, você vigia, relata suas atividades e as da coterie e aceita as tarefas solicitadas. É o equivalente a um Mawla da Camarilla de 1 ponto que o trata mal. Inclua-o no Mapa de Relacionamentos.',
'A recruiter promises admission and a chance to become a full vampire. In exchange, watch, report your own and your coterie’s activities and accept assigned tasks. Equivalent to a one-dot Camarilla Mawla who treats you badly. Add the contact to the Relationship Map.',extra_pt='Pode coexistir com Marcado pela Camarilla.',extra_en='May coexist with Camarilla Branded.')
add('catenating-blood','Sangue Agregador','Catenating Blood','merit',[185],
'Pode criar Laços de Sangue e realizar o Abraço como um vampiro pleno. Todo vampiro que criar desse modo será Sangue-Ralo.',
'Can create Blood Bonds and perform the Embrace like a full vampire. Every vampire created this way is a Thin-blood.')
add('day-drinker','Bebedor Diurno','Day Drinker','merit',[185],
'Sob luz solar, sua trilha de Vitalidade é reduzida à metade, arredondada para cima. Fora isso, o sol remove os dons vampíricos, incluindo Disciplinas e benefícios de Vitalidade, mas não causa outro dano. A Fome continua e ainda precisa dormir. Se a redução de Vitalidade deixar o dano atual acima da capacidade, sofre Debilitação ou Torpor conforme o tipo de dano, até sair da luz solar.',
'In sunlight, halve the Health track, rounding up. Otherwise sunlight removes vampiric gifts, including Disciplines and Health benefits, but causes no other damage. Hunger continues and sleep is still necessary. If reduced Health falls below current damage, suffer impairment or Torpor according to damage type until out of sunlight.')
affinity=[]
for slug,pt,en in [('animalism','Animalismo','Animalism'),('auspex','Auspícios','Auspex'),('celerity','Celeridade','Celerity'),('dominate','Dominação','Dominate'),('fortitude','Fortitude','Fortitude'),('obfuscate','Ofuscação','Obfuscate'),('potence','Potência','Potence'),('presence','Presença','Presence'),('protean','Proteanismo','Protean'),('blood-sorcery','Feitiçaria de Sangue','Blood Sorcery')]:
 affinity.append((slug,pt,en,pt,[],{locale:[{'title':'Disciplina escolhida' if locale=='pt-BR' else 'Chosen Discipline','text':pt if locale=='pt-BR' else en}] for locale in ['pt-BR','en']},[]))
add('discipline-affinity','Afinidade com Disciplina','Discipline Affinity','merit',[186],
'Escolha uma Disciplina na criação. Ganha 1 ponto nela e pode aprender e aumentar seu valor com XP como um vampiro normal, pagando o custo de Disciplina fora do Clã: novo nível × 7 XP no padrão. Beber sangue de Ressonância correspondente não concede pontos extras nessa Disciplina, temporários ou permanentes.',
'Choose one Discipline at creation. Gain 1 dot and may learn and increase it with XP like a normal vampire, paying the out-of-clan Discipline cost: new level × 7 XP under standard rules. Drinking matching Resonance blood grants no extra temporary or permanent dots in that Discipline.',variants=affinity)
add('lifelike','Semblante de Vida','Lifelike','merit',[186],
'Possui batimento cardíaco, pode comer e desfrutar de atividades sexuais como mortal. Exames médicos noturnos, exceto os mais avançados, não revelam nada incomum.',
'Has a heartbeat, can eat and enjoy sexual activity like a mortal. Medical examinations at night reveal nothing unusual except through the most advanced methods.',excludes=['dead-flesh'])
add('alchemist','Alquimista Sangue-Ralo','Thin-blood Alchemist','merit',[186],
'Ganha 1 ponto em Alquimia do Sangue-Fraco e uma fórmula. Pode adquirir pontos e fórmulas adicionais com XP normalmente. Escolha a fórmula na etapa Disciplinas; ela não é uma fórmula genérica capaz de reproduzir qualquer poder.',
'Gain 1 dot of Thin-blood Alchemy and one formula. Additional dots and formulae may be purchased normally with XP. Choose the formula in the Disciplines step; it is not one generic formula capable of reproducing any power.',grant='Alquimia do Sangue-Fraco')
add('vampiric-resilience','Resiliência Vampírica','Vampiric Resilience','merit',[186],
'Recebe dano como um vampiro pleno: ferimentos comuns cortantes e perfurantes são Superficiais. Não concede o bônus de Vitalidade do poder Resiliência de Fortitude e não elimina dano Agravado de fogo ou sol.',
'Takes damage like a full vampire: ordinary cutting and piercing wounds are Superficial. Does not grant the Health bonus from the Fortitude power Resilience and does not remove Aggravated damage from fire or sunlight.',excludes=['mortal-frailty'])
print('Sixteen unrated Thin-blood traits with clan-curse and Core-discipline choices; guided UI required before publication')
