"""Remaining Guide Potence/Presence powers, Mind Masque and One with the Land."""
import json,re,sys
from pathlib import Path
work=Path(sys.argv[1]);repo=Path(__file__).resolve().parent.parent
source=next(x for x in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if x['id']=='players-guide-v5')
data=[
('Mental Maze','Labirinto Mental','Ofuscação',3,[79,80],{'Dominação':1},[],[
('Descrição','Remove a orientação da vítima e a aprisiona no ambiente atual, como casa, boate ou porão. Sua percepção dos cômodos muda, fazendo saídas parecerem conduzir mais fundo ao labirinto e levando ao pânico.'),('Custo','Um Teste de Sangue; três para afetar um único cômodo ou um ambiente externo denso, como floresta ou canteiro de obras.'),('Parada e resistência','Carisma + Ofuscação contra Raciocínio + Determinação.'),('Sistema','Exige contato visual. Vampiros de Geração mais baixa podem gastar um ponto de Força de Vontade para anular a rolagem, conforme as características de Dominação. Numa vitória, a vítima não consegue sair do edifício. Mortais não podem tentar escapar. Criaturas sobrenaturais podem testar Determinação + Percepção a cada cena, com Dificuldade igual aos sucessos iniciais do usuário; falhar causa um dano superficial de Força de Vontade por sucesso faltante. Esse teste não recebe Trabalho em Equipe: orientações externas não correspondem ao que a vítima vê. O efeito acaba se o ambiente se tornar perigoso, como num incêndio, salvo se o usuário possuir Decreto Terminal.'),('Duração','Uma noite.')]),
('Mind Masque','Máscara Mental','Ofuscação',4,[80,81],{'Dominação':2},[],[
('Descrição','Cria uma personalidade ilusória para ocultar pensamentos e sentimentos de leituras sobrenaturais de mente, aura ou estado emocional.'),('Custo','Um Teste de Sangue.'),('Parada','Inteligência + Ofuscação, Dificuldade de 1 a 3 ou mais conforme a elaboração: 1 para mascarar emoções; 3 ou mais para uma personalidade completa com pensamentos e lembranças falsos.'),('Sistema','Acrescente a margem de vitória à Dificuldade de qualquer leitura sobrenatural. Quem não alcançar a Dificuldade aumentada, mas alcançar a normal, vê somente a personalidade falsa, sem perceber a fraude. Quem nem alcançar a Dificuldade normal não obtém informação alguma.'),('Duração','Uma cena.')]),
('Relentless Grasp','Agarre Implacável','Potência',2,[81],{},[],[
('Descrição','A força do aperto torna quase impossível soltar o vampiro à força sem desmembrá-lo.'),('Custo','Um Teste de Sangue.'),('Sistema','Acrescenta seu nível de Potência como sucessos automáticos em tentativas de segurar algo. Inclui manter um agarrão, mas não o teste inicial para agarrar.'),('Duração','Uma cena.')]),
('Wrecker','Demolidor','Potência',3,[81],{},['Poderio','Prowess'],[
('Descrição','Concentra força destrutiva contra objetos estáticos, como portas, carros ou estátuas. A preparação impede o uso em combate.'),('Custo','Gratuito.'),('Sistema','Conte duas vezes o nível de Potência ao usar Poderio para proezas de força que danifiquem ou destruam um objeto inanimado.'),('Duração','A de Poderio.')]),
('Crash Down','Queda Devastadora','Potência',4,[81],{},['Salto Vertiginoso','Soaring Leap'],[
('Descrição','Transforma a aterrissagem de Salto Vertiginoso num impacto que atinge os que estiverem ao redor.'),('Custo','Um Teste de Sangue.'),('Parada e resistência','Força + Potência contra Destreza + Atletismo.'),('Sistema','Ao usar Salto Vertiginoso, pode ativar este poder. Cada pessoa num raio de três metros sofre um ataque pela parada indicada, recebendo dano superficial igual à margem. Quem sofrer três ou mais níveis de dano ou uma falha total na defesa é derrubado, conforme a p. 122 do Livro Básico inglês.'),('Duração','Não se aplica.')]),
('Subtle Hammer','Martelo Sutil','Potência',5,[81,82],{},[],[
('Descrição','Concentra a força do corpo inteiro em movimentos mínimos, como um toque de dedo ou de pé. Não aumenta a força em si, mas permite aplicá-la sem movimentos amplos.'),('Custo','Gratuito.'),('Sistema','Ataques desarmados de corpo a corpo e proezas de força passam a contar como ações menores de dois dados, conforme o Livro Básico inglês, p. 298. Só pode realizar uma ação menor deste poder por turno e não pode fazer outros ataques nesse turno. Proezas de força com movimento limitado, como escapar de amarras, recebem quatro dados extras ou mais, a critério do Narrador.'),('Duração','Passivo.')]),
('Eyes of the Serpent','Olhos da Serpente','Presença',1,[82],{'Proteanismo':1},[],[
('Descrição','Olhos de pupilas reptilianas paralisam um mortal que encontre seu olhar. Também pode paralisar vampiros por pouco tempo.'),('Custo','Gratuito.'),('Parada e resistência','Carisma + Presença contra Raciocínio + Autocontrole, apenas para alvos vampiros.'),('Sistema','Ao captar o olhar de um mortal, mantém-no imóvel enquanto sustentar o contato visual. Só afeta um alvo por vez; dano ou remoção à força encerram o efeito. A vítima ainda pode falar, mas não gritar. Contra vampiros, exige vitória na disputa; depois do primeiro turno, a vítima vampira pode gastar um ponto de Força de Vontade para libertar-se em qualquer turno.'),('Duração','Até romper o contato visual ou o fim da cena.')]),
('Melpominee','Melpominee','Presença',2,[82],{},[],[
('Descrição','A voz encanta ou aterroriza por si só quem puder ouvi-la, mesmo sem ver o vampiro. Gravações e transmissões eletrônicas não conservam o efeito.'),('Custo','Gratuito.'),('Sistema','Pode usar Fascínio, Amedrontar, Olhar Aterrorizante, Transe e Majestade somente pela voz. Usuário e alvo não precisam enxergar um ao outro; o alvo precisa estar perto o bastante para ouvi-lo.'),('Duração','Não se aplica; use a duração do poder transmitido.')]),
('Thrown Voice','Voz Projetada','Presença',3,[82],{'Auspícios':1},[],[
('Descrição','Faz a voz surgir de qualquer ponto à vista, como sussurro ou grito. Pode deixá-la num local, atraindo ou aterrorizando quem se aproxime conforme o poder associado.'),('Custo','Um Teste de Sangue.'),('Sistema','Nenhum teste além do Teste de Sangue. Com Voz Irresistível, Melpominee ou poderes semelhantes, faça os testes desses poderes normalmente. A voz soa como se o vampiro estivesse no ponto escolhido, e seu alcance depende do volume.'),('Duração','Uma cena.')]),
('Suffuse the Edifice','Impregnar o Edifício','Presença',4,[82,83],{},[],[
('Descrição','Enquanto estiver num edifício ou local semelhante, transmite Fascínio, Amedrontar ou Majestade pela estrutura. Quem estiver dentro ou olhando para ela reage como se fosse o vampiro.'),('Custo','Não se aplica; siga o poder transmitido.'),('Parada','A do poder transmitido.'),('Sistema','Pessoas dentro ou que vejam o edifício de fora resistem como se o vampiro estivesse presente. Se puderem ver o próprio vampiro, ele se torna o foco. Como edifícios normalmente não fazem testes de Habilidade, aplique os bônus às reações do alvo ao local. Fascínio pode atrair filas para uma casa noturna, e Amedrontar pode afastar investigadores de um refúgio. Majestade exige cuidado extremo: os efeitos podem ser espetaculares e voláteis.'),('Duração','A do poder transmitido.')]),
('One with the Land','Uno com a Terra','Proteanismo',5,[85,86],{'Animalismo':2},['Fusão com a Terra','Earth Meld'],[
('Descrição','Estende o próprio corpo ao domínio, fundindo-se a ele e percebendo acontecimentos pelos sentidos dos animais locais.'),('Custo','Dois Testes de Sangue.'),('Sistema','Como Fusão com a Terra, mas sem limitação pela composição da superfície: pode integrar-se a paredes, esconder-se sob tábuas ou sob água parada. Num raio aproximado de um quilômetro, pode escolher vivenciar estímulos sensoriais por meio dos animais presentes, por menores que sejam, como conversas, sensações físicas e cheiros. Eventos discretos ou intencionalmente ocultos exigem Raciocínio + Animalismo contra a parada oposta pertinente.'),('Despertar antes da noite seguinte','Emergir antes do anoitecer do dia posterior à entrada exige Determinação + Proteanismo, Dificuldade 4. Mesmo com sucesso, pode levar até uma hora para emergir completamente; uma vitória crítica permite sair imediatamente.'),('Duração','Um dia ou mais, ou até sofrer perturbação física.')]),
]
boundaries=[x[0].upper() for x in data]+['VICISSITUDE']
for name,pt,discipline,level,numbers,amalgam,alternatives,rows in data:
 text='\n\n'.join(json.loads((work/'pages/players-guide-v5'/f'{n:04}.json').read_text(encoding='utf-8'))['content'] for n in numbers)
 text=text.split('## '+name.upper()+'\n',1)[1]
 text=re.split(r'\n## (?:'+'|'.join(re.escape(t) for t in boundaries)+r'|Level \d|Potence|Presence|Protean|Oblivion)\n',text,1)[0]
 text=re.sub(r'^##\s+', '',text,flags=re.M)
 text=text.replace('Vampire:\n\nThe Masquerade','Vampire: The Masquerade').replace('Vampire: The\n\nMasquerade','Vampire: The Masquerade')
 text=re.sub(r'(?<=[a-z,])\n\n(?=[a-z])',' ',text)
 text=re.sub(r'(?<!\n)( Dice Pools?:)',r'\n\n\1',text)
 parts=re.split(r'(?:^|\n\n)(Cost|Dice Pools?|System|Duration):\s*',text)
 english=[{'title':'Description','text':parts[0].strip()}]
 for i in range(1,len(parts),2):english.append({'title':parts[i],'text':parts[i+1].strip()})
 required={discipline:level}|amalgam
 en_names={'Potência':'Potence','Presença':'Presence','Ofuscação':'Obfuscate','Dominação':'Dominate','Auspícios':'Auspex','Proteanismo':'Protean','Animalismo':'Animalism'}
 english.insert(1,{'title':'Requirements','text':'; '.join(f'{en_names.get(d,d)} {n}' for d,n in required.items())+'.'})
 portuguese=[{'title':t,'text':v} for t,v in rows]
 portuguese.insert(1,{'title':'Requisitos','text':'; '.join(f'{d} {n}' for d,n in required.items())+('. Poder: '+alternatives[0] if alternatives else '')+'.'})
 requirements={'disciplines':required}
 if alternatives:requirements['prerequisiteAlternatives']=[alternatives]
 id='mental-maze' if name=='Mental Maze' else re.sub('[^a-z0-9]+','-',f'players-guide-v5-power-{discipline}-{name}'.lower())
 version={'id':id+'-players-guide-v5','book':'players-guide-v5','level':level,'sourceTitle':'Guia do Jogador V5, PDF pp. '+', '.join(map(str,numbers)),'sourceLanguage':'en','pdfSha256':source['sha256'],'pages':[{'pdfPage':n,'printedPage':n-2} for n in numbers],'requirements':requirements,'descriptions':{'pt-BR':portuguese,'en':english}}
 entry={'id':id,'kind':'power','names':{'pt-BR':pt,'en':name},'aliases':[pt,name],'discipline':discipline,'level':level,'versions':[version]}
 destination=repo/'scripts/reviewed-content'/f'{id}.json'
 if destination.exists():
  previous=json.loads(destination.read_text(encoding='utf-8'))
  entry['aliases']=list(dict.fromkeys(previous['aliases']+entry['aliases']))
  entry['names']=previous['names']
  entry['versions'] += [v for v in previous['versions'] if v['book']!='players-guide-v5']
 for v in entry['versions']:
  for section in v['descriptions']['en']:
   section['text']=section['text'].replace('Vampire: The\n\n## Masquerade','Vampire: The Masquerade')
   section['text']=re.sub(r'(?<=[a-z,])\n\n(?=[a-z])',' ',section['text'])
 destination.write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print('11 Guide Potence/Presence/Obfuscate/Protean powers prepared')
