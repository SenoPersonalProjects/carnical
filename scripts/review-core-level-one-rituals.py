"""Compile bilingual rules visually checked on core PDF pages 274 and 276.

Editorial text is explicit; no machine translations or OCR drafts are published.
"""
import json
from pathlib import Path
root=Path(__file__).resolve().parent
rules=[
 ('clinging-of-the-insect','Aderência do Inseto','Clinging of the Insect',
  'Permite aderir a paredes e tetos como um inseto ou aranha.','Lets the vampire cling to walls and ceilings like an insect or spider.',
  'Uma aranha viva.','A living spider.',
  'Encha um frasco com o próprio Sangue, esmague a aranha dentro, misture e ingira. Beber a mistura não recupera Fome.','Fill a vial with the user’s Blood, crush the spider into it, mix and drink. Drinking the mixture does not reduce Hunger.',
  'Um sucesso permite se pendurar em paredes e tetos por uma cena; uma vitória crítica estende o efeito por toda a noite. É preciso usar ambas as mãos e os pés, movendo-se a aproximadamente metade da velocidade normal. Só o conjurador pode se beneficiar: outra pessoa que beba a mistura não recebe o efeito.',
  'A success allows clinging to walls and ceilings for one scene; a critical win extends this to the whole night. Both hands and feet must grip the surface, and movement is approximately half normal speed. Only the caster benefits; giving someone else the mixture has no effect.',
  'Uma cena; uma noite em uma vitória crítica.','One scene; one night on a critical win.'),
 ('blood-walk','Caminho do Sangue','Blood Walk',
  'Amplia as informações obtidas sobre o Sangue de um vampiro.','Reveals additional information about a vampire’s Blood.',
  'Um copo de prata cheio de Sangue do alvo, equivalente a um Teste de Sangue.','A silver cup containing the subject’s Blood, equivalent to one Rouse Check.',
  'Misture o próprio Sangue com o do alvo e repita um encanto sobre o copo por aproximadamente uma hora.','Mix the user’s Blood with the subject’s and chant over the cup for approximately one hour.',
  'Um sucesso revela o nome e a geração do alvo e seu Senhor. Uma vitória crítica também revela todos os Laços de Sangue ativos no alvo, tanto como domitor quanto como servo. O alvo estudado deve ser um vampiro.',
  'A success reveals the subject’s name, generation and sire. A critical win also reveals every active Blood Bond involving the subject, both as domitor and as thrall. The subject studied must be a vampire.',
  'A informação é obtida ao resolver o ritual.','The information is obtained when the ritual resolves.'),
 ('craft-bloodstone','Criar Pedra de Sangue','Craft Bloodstone',
  'Cria um rastreador mágico cuja direção e distância o conjurador pode sentir.','Creates a magical tracker whose direction and distance the caster can sense.',
  'Um seixo de mineral de ferro ou um ímã pequeno, um litro de sangue de qualquer fonte e uma tigela de prata.','An iron-bearing pebble or small magnet, one liter of blood from any source and a silver bowl.',
  'Adicione o próprio Sangue ao sangue na tigela e entoe um cântico por uma hora. Repita o cântico nas duas noites seguintes. A pedra absorve o sangue durante as três noites, deixando o líquido translúcido. Faça a rolagem ao final da terceira noite.','Add the user’s Blood to the blood in the bowl and chant for one hour. Repeat the chant on the following two nights. Over the three nights, the stone absorbs the blood and leaves the liquid translucent. Make the ritual test at the end of the third night.',
  'Um sucesso sintoniza a mente do conjurador com a pedra: ele passa a sentir infalivelmente sua direção e distância. Pode manter e seguir simultaneamente tantas pedras quanto seu valor de Determinação. O efeito termina quando a pedra é destruída ou depois de uma semana.',
  'A success attunes the caster to the stone, letting them sense its direction and distance without error. The caster can maintain and track a number of stones equal to their Resolve rating. The effect ends if the stone is destroyed or after one week.',
  'Uma semana, ou até a pedra ser destruída.','One week, or until the stone is destroyed.'),
 ('wake-with-evenings-freshness','Despertar com o Frescor do Anoitecer','Wake with Evening’s Freshness',
  'Realizado antes do amanhecer, permite despertar alerta quando surgir perigo durante o dia.','Performed before dawn, this lets the vampire wake fully alert if danger arises during the day.',
  'Ossos e penas calcinados de um galo.','Burned bones and feathers of a rooster.',
  'Misture as cinzas com o próprio Sangue e desenhe um círculo ao redor do local onde dormirá.','Mix the ashes with the user’s Blood and draw a circle around their sleeping place.',
  'Não faça a rolagem até surgir um perigo real. Se o conjurador for ameaçado durante o dia, faça a rolagem do ritual; um sucesso o desperta. Ele ignora as penalidades por ficar acordado durante o dia pelo restante da cena. Em uma vitória crítica, os efeitos duram até o próximo amanhecer.',
  'Do not make the ritual test until a real danger occurs. If threatened during the day, the caster makes the test and wakes on a success. They ignore daytime wakefulness penalties for the rest of the scene. A critical win extends the effects until the following dawn.',
  'Uma cena após despertar; até o próximo amanhecer em uma vitória crítica.','One scene after waking; until the following dawn on a critical win.')
]
for slug,pt,en,description_pt,description_en,ingredients_pt,ingredients_en,process_pt,process_en,system_pt,system_en,duration_pt,duration_en in rules:
 descriptions={}
 for locale,description,ingredients,process,system,duration in [('pt-BR',description_pt,ingredients_pt,process_pt,system_pt,duration_pt),('en',description_en,ingredients_en,process_en,system_en,duration_en)]:
  english=locale=='en'
  titles=['Description','Requirements','Cost','Ingredients','Process','Dice Pool','System','Duration','General ritual rules'] if english else ['Descrição','Requisitos','Custo','Ingredientes','Processo','Parada','Sistema','Duração','Regras gerais de rituais']
  texts=[description,'Blood Sorcery 1.' if english else 'Feitiçaria de Sangue 1.','One Rouse Check.' if english else 'Um Teste de Sangue.',ingredients,process,'Intelligence + Blood Sorcery, Difficulty 2.' if english else 'Inteligência + Feitiçaria de Sangue, Dificuldade 2.',system,duration,
   'Unless a ritual states otherwise, casting requires five minutes per ritual level, one Rouse Check and an Intelligence + Blood Sorcery test at Difficulty equal to level + 1. The specific processes and timing above take precedence. Beneficial rituals affect only the caster unless expressly stated otherwise. At creation, a character with Blood Sorcery can choose one level 1 ritual. Learning another costs ritual level × 3 XP and requires at least level squared weeks; see core pp. 272 and 274.' if english else 'Salvo indicação contrária, conjurar exige cinco minutos por nível do ritual, um Teste de Sangue e Inteligência + Feitiçaria de Sangue, Dificuldade igual a nível + 1. Os processos e prazos específicos acima prevalecem. Rituais benéficos só afetam o conjurador, salvo indicação expressa em contrário. Na criação, quem possui Feitiçaria de Sangue pode escolher um ritual de nível 1. Aprender outro custa nível do ritual × 3 XP e exige pelo menos o quadrado do nível em semanas; consulte o livro básico, pp. 272 e 274.']
  descriptions[locale]=[{'title':title,'text':text} for title,text in zip(titles,texts)]
 id='core-v5-ritual-'+slug
 entry={'id':id,'kind':'ritual','names':{'pt-BR':pt,'en':en},'aliases':[pt,en],'discipline':'Feitiçaria de Sangue','level':1,'versions':[{'id':id+'-core','book':'core-v5','sourceTitle':'Livro Básico V5, pp. 272, 274 e 276','sourceLanguage':'pt-BR','pages':[{'pdfPage':n,'printedPage':n-2} for n in [274,276,278]],'requirements':{'disciplines':{'Feitiçaria de Sangue':1}},'descriptions':descriptions}]}
 (root/'reviewed-content'/f'{slug}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(rules)} reviewed core rituals written')
