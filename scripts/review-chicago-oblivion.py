"""Paired Oblivion rules: Chicago PDF 294-296 and Player's Guide PDF 86-93.

English preserves source wording except extraction repairs and unresolved page
cross-references, which receive an explicit source note rather than a guessed page.
Portuguese is reviewed against the same rules; edition changes remain separate.
"""
import json,re,sys
from pathlib import Path
work=Path(sys.argv[1]);repo=Path(__file__).resolve().parent.parent
manifest=json.loads((work/'pages/manifest.json').read_text(encoding='utf-8'))
def page(book,n):return json.loads((work/'pages'/book/f'{n:04}.json').read_text(encoding='utf-8'))['content']
def clean(text):
 text=re.sub(r'\n+## (?![A-Z][A-Z’ \-]+(?:\n|$)|Level \d)', '\n\n',text)
 text=text.replace('social conflictincreases','social conflict increases').replace('threedice','three-dice').replace('twodimensional','two-dimensional')
 text=text.replace('Vampire:\n\nThe Masquerade','Vampire: The Masquerade').replace('Vampire: The\n\nMasquerade','Vampire: The Masquerade')
 text=re.sub(r'\s*\(see p\.\s*(?:## )?XX\)','',text)
 text=text.replace('(p. XX)','(the source’s cross-reference has no page number)')
 return text.strip()
def extract(book,numbers,title):
 text='\n\n'.join(page(book,n) for n in numbers)
 body=text.split('## '+title+'\n',1)[1]
 body=re.split(r'\n## (?:[A-Z][A-Z’ \-]+|Level \d|Oblivion Ceremonies)\n',body,1)[0]
 return clean(body)
def sections(text):
 text=re.sub(r'^Amalgam: Potence 2\s*','',text)
 text=re.sub(r' (?=Dice Pools:)','\n\n',text)
 parts=re.split(r'(?:\n\n|(?<=Check) )((?:Amalgam|Cost|Dice Pools|System|Duration):)\s*',text)
 result=[]
 if parts[0].strip():result.append({'title':'Description','text':parts[0].strip()})
 for i in range(1,len(parts),2):
  title=parts[i][:-1];body=parts[i+1].strip()
  if title=='Amalgam':
   match=re.match(r'Potence 2\s*(.*)',body,re.S)
   result.append({'title':'Requirements','text':'Oblivion 2. Amalgam: Potence 2.'})
   if match and match[1]:result.append({'title':'Description','text':match[1]})
  else:result.append({'title':title,'text':body})
 return result
general_pt='As manifestações de Oblívio são sombras bidimensionais que se deslocam por superfícies; ataques físicos normalmente atingem apenas a superfície, não a manifestação. Projeções e espíritos sofrem dano por fogo e luz solar como vampiros de Potência de Sangue 1, além de um ponto de dano agravado por turno sob luz forte e direta. Armas e artefatos abençoados também podem causar dano superficial ou agravado, conforme a bênção e a Fé Verdadeira. Poderes específicos podem estabelecer exceções.\n\nLuz diurna e ambientes sem sombras impedem o funcionamento da Disciplina; ultravioleta e infravermelho, por si, não a restringem. {lighting}\n\nAo fazer um Teste de Sangue para um poder de Oblívio, obter 1 ou 10 causa uma Mácula, além da Fome que eventualmente aumente. Se a Potência de Sangue permitir rerrolar esse teste, o usuário pode escolher um dos dois resultados. Tipo: Mental. Ameaça à Máscara: média a alta; as sombras aparecem mal em câmeras, mas são evidentemente sobrenaturais ao vivo. Ressonância: psicopatas, pessoas emocionalmente distantes e sangue vazio de Ressonância.'
general_en='Oblivion manifestations are two-dimensional shadows moving across surfaces; physical attacks ordinarily hit the surface rather than the manifestation. Projections and spirits take fire and sunlight damage as Blood Potency 1 vampires, and one Aggravated damage per round from bright, direct light. Blessed weapons and artifacts may also cause Superficial or Aggravated damage depending on the blessing and True Faith. Individual powers may state exceptions.\n\nDaylight and rooms without shadows prevent the Discipline from functioning. Ultraviolet and infrared light alone do not restrict it. {lighting}\n\nA Rouse Check for an Oblivion power causes a Stain on a result of 1 or 10, in addition to any Hunger gained. When Blood Potency permits a Rouse reroll, the user may choose either result. Type: Mental. Masquerade threat: Medium-High; the shadows rarely appear well on cameras but are clearly unnatural in person. Blood Resonance: psychopaths, the emotionally detached, and Blood empty of Resonance.'
# Every paragraph below is a full translation of the power mechanics and description.
data=[
 ('shadow-cloak','Manto de Sombras','Shadow Cloak',1,[294],[87,88],[
 ('Descrição','Aplicando sutilmente a influência de Oblívio às sombras ao redor, o usuário disfarça a aparência ou parece mais sinistro e ameaçador.'),('Custo','Gratuito.'),('Sistema','O vampiro recebe dois dados de bônus em testes de Furtividade e em Intimidação contra mortais.'),('Duração','Passivo.')]),
 ('oblivions-sight','Visão de Oblívio','Oblivion’s Sight',1,[294],[87],[
 ('Descrição','O vampiro fecha os olhos e os reabre com íris negras contra o branco da esclera. Enxerga em escuridão total e percebe fantasmas que não estejam ocultando ativamente a presença.'),('Custo','Gratuito.'),('Sistema','Ignora todas as penalidades por pouca luz, inclusive de origem sobrenatural. Ainda precisa dos olhos: vendas e obstruções semelhantes funcionam normalmente. Fantasmas que não estejam usando Furtividade ou um poder de ocultação ficam visíveis. Eles aparecem como desejam: humanos com ferimentos da morte, monstruosidades espectrais ou cadáveres impecáveis. Não percebem automaticamente que foram vistos; se perceberem, podem reagir com medo ou raiva. O poder não permite tocar fisicamente em fantasmas.'),('Duração','Uma cena.')]),
 ('shadow-cast','Projetar Sombra','Shadow Cast',2,[294,295],[89],[
 ('Descrição','A ausência de sombras pode frustrar Oblívio. Este poder projeta a escuridão interior do vampiro como uma sombra sobrenatural, da qual outros poderes podem se manifestar, independentemente da iluminação ambiente. Ela normalmente acompanha a forma e os movimentos do usuário, mas pode ficar distorcida ou monstruosa conforme seu temperamento.'),('Custo','Um Teste de Sangue.'),('Sistema','A sombra surge do corpo do vampiro e só pode ser removida por luz solar direta enquanto o poder durar. Uma testemunha percebe que ela não corresponde a uma fonte de luz visível com Raciocínio + Percepção, Dificuldade 3. O usuário pode alongá-la e distorcê-la, mas não separá-la de si; a critério do Narrador, às vezes ela age por conta própria. Para outros poderes, como Perspectiva Sombria, pode atingir até duas vezes o nível de Oblívio do usuário em metros. Quem estiver ao alcance dessa sombra sofre mais um ponto de dano à Força de Vontade proveniente de conflito social.'),('Duração','Uma cena.')]),
 ('arms-of-ahriman','Braços de Ahriman','Arms of Ahriman',2,[295],[88,89],[
 ('Descrição','O vampiro invoca apêndices abissais de pontos sem iluminação que estejam à vista. Sombras locais se distorcem em tentáculos e convergem sobre uma ou mais vítimas, deslizando por seus corpos ou agarrando suas sombras para imobilizá-las ou sufocá-las.'),('Requisitos','Oblívio 2. Amálgama: Potência 2.'),('Custo','Um Teste de Sangue.'),('Parada','Raciocínio + Oblívio.'),('Sistema','O usuário gasta um turno e paga o custo para invocar os apêndices. Nos turnos seguintes, pode realizar ataques contundentes ou agarrões à distância. Pode dividir a parada para criar braços adicionais e enfrentar vários oponentes, conforme a regra de múltiplos adversários do Livro Básico, p. 125 na edição inglesa. Usa Raciocínio + Oblívio para atacar, causar dano superficial ou agarrar; adiciona metade da Potência, arredondada para cima, como bônus de dano. Enquanto controla os braços, não pode fazer mais nada. Eles podem abrir portas e puxar alavancas, mas não digitar nem dirigir veículos. O alcance é duas vezes o nível de Oblívio em metros, medido ao longo de superfícies, nunca pelo ar.'),('Resistência e dano aos braços','Os braços possuem três níveis de Vitalidade e usam Raciocínio + Oblívio do dono para evitar ou suportar ataques. Como sombras bidimensionais, só podem ser feridos por luz forte, como uma lanterna potente ou luz diurna. O teste de Raciocínio + Oblívio permite buscar cantos escuros ou sobrepujar a luz por um turno, sofrendo um nível de dano e continuando o ataque. Uma vítima constrita deve obter mais sucessos em Determinação + Autocontrole do que o atacante para atravessar os tentáculos sem sofrer dano. Isso não dissipa os braços: eles podem atacar novamente num turno seguinte se o usuário desejar e a vítima continuar ao alcance.'),('Duração','Uma cena ou até o poder ser encerrado ou destruído.')]),
 ('shadow-perspective','Perspectiva Sombria','Shadow Perspective',3,[295],[91],[
 ('Descrição','O vampiro projeta seus sentidos em qualquer sombra à vista, vendo e ouvindo como se estivesse escondido em qualquer parte dela. Isso inclui a própria sombra manipulada por Projetar Sombra.'),('Custo','Um Teste de Sangue.'),('Sistema','A presença dos sentidos do vampiro na sombra só pode ser detectada por meios sobrenaturais, como Sentir o Invisível. O usuário continua percebendo seus arredores e também o que chega da sombra, como se olhasse por uma tela ou abertura.'),('Duração','Até uma cena.')]),
 ('touch-of-oblivion','Toque de Oblívio','Touch of Oblivion',3,[295,296],[91],[
 ('Descrição','O usuário canaliza Oblívio através da vitae. Ao tocar a vítima, a força aniquiladora atravessa seu corpo e faz a área tocada definhar: músculos encolhem, tendões se rompem e ossos ficam frágeis, como se aquela região envelhecesse catastroficamente. Pode inutilizar membros, a garganta ou os olhos.'),('Custo','Um Teste de Sangue.'),('Parada','Força + Briga para agarrar uma vítima que tente evitar o contato; o texto não estabelece um teste separado de Oblívio.'),('Sistema','Após pagar o custo, o vampiro segura a vítima. Ela sofre dois pontos de dano agravado e um ferimento incapacitante. Um braço ou perna atingido fica inutilizado; mortais precisam de reabilitação prolongada, enquanto vampiros podem reparar o dano como dano agravado normal. O poder também pode tornar a vítima muda, surda ou cega.'),('Referência do ferimento','A edição de Chicago apresenta uma remissão sem número de página para as regras de ferimentos incapacitantes do Livro Básico. Consulte a tabela no seu exemplar; nenhum número foi presumido.'),('Duração','Um turno.')]),
 ('stygian-shroud','Mortalha Estígia','Stygian Shroud',4,[296],[92],[
 ('Descrição','A escuridão se derrama de uma sombra próxima e cobre a área com um breu de noite sem lua; os sons ficam abafados e indistintos. De fora, vê-se a sombra se expandir por superfícies e pelos corpos presentes. Além do invocador, os afetados têm dificuldade para ver e ouvir, e mortais perdem vitalidade pelo efeito sufocante.'),('Custo','Um Teste de Sangue.'),('Sistema','O usuário paga o custo e concentra-se por um turno para espalhar a sombra. A área circular tem raio igual a duas vezes seu nível de Oblívio em metros, centrada nele ou num ponto à vista. Quem estiver na Mortalha sofre uma penalidade de três dados em todos os testes, a menos que enxergue através de escuridão sobrenatural. Mortais sofrem um ponto de dano superficial por turno dentro da área devido ao sufocamento.'),('Duração','Uma cena.')]),
 ('shadow-step','Passo das Sombras','Shadow Step',5,[296],[92,93],[
 ('Descrição','Entrando numa sombra próxima, o usuário desaparece e ressurge da mesma sombra ou de outra mais distante. Lasombra e Hecata discutem se ele entra no Labirinto ou apenas passa por sua superfície; o dano espiritual possível sugere contato com algo impuro.'),('Custo','Um Teste de Sangue.'),('Sistema','O vampiro entra numa sombra grande o suficiente para cobri-lo e sai de outra um turno depois. A sombra de destino deve estar à vista, inclusive por meios místicos como Perspectiva Sombria. Pode levar outra pessoa; se ela não concordar, precisa estar presa por um agarrão bem-sucedido. Se o uso causar uma Mácula, o passageiro também recebe uma.'),('Duração','Um turno.')]),
 ('tenebrous-avatar','Avatar Tenebroso','Tenebrous Avatar',5,[296],[93],[
 ('Descrição','O vampiro transforma sua substância na de uma sombra bidimensional, deslizando por superfícies e por frestas minúsculas. Nessa forma, só fogo e luz solar o ferem.'),('Custo','Dois Testes de Sangue.'),('Sistema','A transformação exige um turno, durante o qual o vampiro não pode fazer mais nada. Depois, desloca-se em velocidade de caminhada pelo chão ou pelas paredes; apenas barreiras hermeticamente vedadas o impedem. Pode envolver vítimas, impondo uma penalidade de três dados a todas as suas paradas e sufocando mortais como Mortalha Estígia. Ao envolver um mortal, pode alimentar-se sem perfurar sua pele com as presas. Não sofre dano de fontes físicas, mas fogo e luz solar o afetam normalmente. Pode usar Disciplinas mentais a critério do Narrador.'),('Duração','Uma cena ou até ser encerrado.')]),
]
for id,pt,en,level,chicago,guide,pt_sections in data:
 versions=[]
 for book,numbers in [('chicago-by-night-v5',chicago),('players-guide-v5',guide)]:
  translated=[{'title':title,'text':body} for title,body in pt_sections]
  english=sections(extract(book,numbers,en.upper()))
  if book=='players-guide-v5':
   if id=='oblivions-sight':next(s for s in translated if s['title']=='Sistema')['text']+=' Os olhos totalmente negros impõem uma penalidade de dois dados em interações sociais com mortais enquanto o poder estiver ativo.'
   if id=='shadow-cast':next(s for s in translated if s['title']=='Sistema')['text']+=' Nesta edição, acrescente esse ponto depois de reduzir pela metade o dano superficial.'
   if id=='arms-of-ahriman':
    translated[0]['text']='O vampiro invoca extensões sombrias de pontos sem iluminação que estejam à vista. Elas fluem pelas paredes e pelo chão e convergem sobre uma ou mais vítimas, imobilizando-as ou sufocando-as, seja envolvendo seus corpos, seja agarrando misticamente suas sombras.'
    next(s for s in translated if s['title']=='Resistência e dano aos braços')['text']='Somente luz forte, como uma lanterna potente ou luz diurna, pode banir os braços. Um teste bem-sucedido de Raciocínio + Oblívio, Dificuldade 3, permite que as sombras evitem a luz por um turno. Esta versão não atribui três níveis de Vitalidade aos braços nem estabelece o teste especial de Determinação + Autocontrole para escapar presente em Chicago; não acrescente essas regras à versão do Guia.'
   if id=='touch-of-oblivion':
    next(s for s in translated if s['title']=='Referência do ferimento')['text']='O Guia remete à tabela de ferimentos incapacitantes do Livro Básico, p. 303 da edição inglesa. O Narrador pode decidir que causar essa mutilação merece Máculas.'
  lighting_pt='Ambientes moderadamente iluminados aumentam em um a Dificuldade do teste de Disciplina envolvido.' if book=='chicago-by-night-v5' else 'Ambientes moderadamente iluminados impõem uma penalidade de um dado ao teste de Disciplina envolvido.'
  lighting_en='Moderately lit rooms add one to the Difficulty of the Discipline roll involved.' if book=='chicago-by-night-v5' else 'Moderately lit rooms apply a one-die penalty to the Discipline roll involved.'
  translated.append({'title':'Regras gerais de Oblívio nesta fonte','text':general_pt.format(lighting=lighting_pt)})
  english.append({'title':'General Oblivion rules in this source','text':general_en.format(lighting=lighting_en)})
  if not any(s['title']=='Requirements' for s in english):english.insert(1,{'title':'Requirements','text':f'Oblivion {level}.'+(' Amalgam: Potence 2.' if id=='arms-of-ahriman' else '')})
  if not any(s['title']=='Requisitos' for s in translated):translated.insert(1,{'title':'Requisitos','text':f'Oblívio {level}.'})
  refs=sorted(set(numbers+([294] if book=='chicago-by-night-v5' else [86,87])))
  source=next(row for row in manifest if row['id']==book)
  versions.append({'id':id+'-'+book,'book':book,'level':level,'sourceTitle':('Chicago by Night' if book=='chicago-by-night-v5' else 'Guia do Jogador V5')+', PDF pp. '+', '.join(map(str,refs)),'pages':[{'pdfPage':n,'printedPage':n-(1 if book=='chicago-by-night-v5' else 2)} for n in refs],'pdfSha256':source['sha256'],'sourceLanguage':'en','requirements':{'disciplines':{'Oblívio':level}|({'Potência':2} if id=='arms-of-ahriman' else {})},'descriptions':{'pt-BR':translated,'en':english}})
 entry={'id':id,'kind':'power','names':{'pt-BR':pt,'en':en},'aliases':[pt,en],'discipline':'Oblívio','level':level,'versions':versions}
 (repo/'scripts/reviewed-content'/f'{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print('9 paired Oblivion powers prepared from Chicago and Player’s Guide')
