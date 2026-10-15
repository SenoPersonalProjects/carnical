"""Five Animalism and two Auspex powers from Player's Guide PDF 71–73."""
import json,re,sys
from pathlib import Path
work=Path(sys.argv[1]);repo=Path(__file__).resolve().parent.parent
source=next(x for x in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if x['id']=='players-guide-v5')
data=[
('animal-messenger','Animal Messenger','Mensageiro Animal','Animalismo',2,[71],{'Auspícios':1},[
('Descrição','O Famulus leva uma mensagem curta a uma pessoa designada pelo mestre, se conseguir alcançá-la. Quem estiver perto ouve a mensagem como se o animal falasse com a voz do mestre.'),('Custo','Um Teste de Sangue por noite.'),('Parada','Sem teste de ativação. Se não souber onde está o destinatário, o Famulus testa Determinação + Manha ou Sobrevivência, ou equivalente, Dificuldade 2. Um alvo que esteja se escondendo, do Famulus ou de outras ameaças, resiste com Inteligência + Manha ou Sobrevivência.'),('Sistema','Sussurre uma única frase ao Famulus e indique o destinatário. Pode tentar localizá-lo uma vez por noite. A mensagem é transmitida assim que o animal faz contato visual com o alvo, e depois ele retorna ao mestre.'),('Duração','Uma ou mais noites, dependendo do tempo da busca.')]),
('messengers-command','Messenger’s Command','Comando do Mensageiro','Animalismo',3,[71],{'Dominação':1},[
('Descrição','A mensagem levada pelo Famulus pode transmitir Compelir ou Mesmerismo, impondo a vontade do vampiro ao destinatário.'),('Custo','Nenhum custo adicional ao Mensageiro Animal.'),('Parada','A de Compelir ou Mesmerismo, mas o nível de Dominação usado não pode superar o de Animalismo.'),('Sistema','Use Mensageiro Animal e faça o teste de Compelir ou Mesmerismo assim que o Famulus estabelecer contato visual com o destinatário.'),('Requisitos adicionais','Mensageiro Animal e pelo menos um dos poderes Compelir ou Mesmerismo.'),('Duração','A de Mensageiro Animal.')]),
('plague-of-beasts','Plague of Beasts','Praga de Feras','Animalismo',3,[71],{},[
('Descrição','Marca um indivíduo para atrair a atenção hostil de animais e vermes locais. Eles latem, bicam e arranham, mas preservam o instinto de sobrevivência.'),('Custo','Um Teste de Sangue.'),('Parada e resistência','Manipulação + Animalismo contra Autocontrole + Empatia com Animais.'),('Sistema','Escolha um alvo à vista. Numa vitória, animais próximos o perseguem pelo restante da noite. Sofre uma penalidade igual à margem nas paradas de Habilidades, salvo se conseguir isolar-se fisicamente da fauna local. Perseguidores recebem um bônus de rastreamento igual à margem. A penalidade não se aplica a conflitos físicos: os animais fogem da violência e retornam quando ela termina.'),('Duração','Uma noite.')]),
('sway-the-flock','Sway the Flock','Influenciar o Bando','Animalismo',4,[71,72],{},[
('Descrição','Influencia o humor geral dos animais numa área ampla, da indiferença sonolenta à agressividade indiscriminada, sem controlar suas ações específicas.'),('Custo','Um ou mais Testes de Sangue.'),('Parada','Autocontrole + Animalismo.'),('Sistema','Escolha o comportamento desejado. Com um sucesso, o efeito é quase imperceptível; com cinco, o impulso domina os animais, fazendo os acalmados dormir ou os agitados atacar sem provocação. Tentativas mundanas de controlá-los aumentam de Dificuldade em um por sucesso obtido. A área inicial equivale aproximadamente a um campo de futebol; Testes de Sangue adicionais a ampliam, até cinco para uma cidade pequena.'),('Duração','Uma noite.')]),
('coax-bestial-temper','Coax the Bestial Temper','Instigar o Temperamento Bestial','Animalismo',5,[72],{},[
('Descrição','Cantarola, canta ou rosna baixinho para agitar ou acalmar a Besta dos demais vampiros ao alcance da voz.'),('Custo','Um Teste de Sangue.'),('Parada','Manipulação + Animalismo, Dificuldade 3.'),('Sistema','Escolha agitar ou acalmar. Cada sucesso de margem aumenta ou reduz em um a Dificuldade de resistir ao Frenesi para todos os outros vampiros que o ouçam. Ao reduzir a Dificuldade, vampiros já em Frenesi podem testar novamente e encerrá-lo se vencerem.'),('Duração','Enquanto continuar cantarolando.')]),
('reveal-temperament','Reveal Temperament','Revelar Temperamento','Auspícios',2,[72,73],{},[
('Descrição','Fareja a Ressonância e eventuais Discrasias no sangue de um mortal. Num vampiro, percebe a Ressonância da última vítima da qual se alimentou.'),('Custo','Um Teste de Sangue.'),('Parada e resistência','Inteligência + Auspícios contra Autocontrole + Subterfúgio.'),('Sistema','Com o poder ativo, uma vitória revela a Ressonância e particularidades como Discrasias de um mortal observado. Uma vitória crítica concede dois dados extras em interações com ele durante a cena, por adaptar a abordagem ao seu estado emocional. Contra vampiros, uma vitória revela a Ressonância do último mortal de que se alimentaram; um crítico também revela o método de alimentação e o Tipo de Predador do vampiro.'),('Duração','Uma cena.')]),
('fatal-flaw','Fatal Flaw','Falha Fatal','Auspícios',3,[73],{'Oblívio':1},[
('Descrição','Observa os sinais sutis de entropia para descobrir uma vulnerabilidade mental ou física, desde uma fissura na fachada emocional até uma falha na armadura.'),('Custo','Um Teste de Sangue.'),('Parada e resistência','Inteligência + Auspícios contra Autocontrole + Subterfúgio para fraquezas mentais, ou Vigor + Subterfúgio para fraquezas físicas.'),('Sistema','Passe um turno observando atentamente o alvo. Uma vitória revela a menor parada defensiva na categoria escolhida e concede dois dados extras a ataques contra ela. Quem receber do usuário a informação sobre essa vulnerabilidade recebe um dado extra.'),('Duração','Uma cena.')]),
]
boundaries=[x[1].upper() for x in data]+['PANACEA','UNBURDENING THE BESTIAL SOUL']
for id,name,pt,discipline,level,numbers,amalgam,rows in data:
 text='\n\n'.join(json.loads((work/'pages/players-guide-v5'/f'{n:04}.json').read_text(encoding='utf-8'))['content'] for n in numbers)
 text=text.split('## '+name.upper()+'\n',1)[1]
 text=re.split(r'\n## (?:'+'|'.join(re.escape(t) for t in boundaries)+r'|Level \d|Auspex)\n',text,1)[0]
 text=re.sub(r'(?<=[a-z,])\n\n(?=[a-z])',' ',text)
 text=re.sub(r'(?<!\n)( Dice Pools?:)',r'\n\n\1',text)
 parts=re.split(r'(?:^|\n\n)(Cost|Dice Pools?|System|Duration):\s*',text)
 english=[{'title':'Description','text':parts[0].strip()}]
 for i in range(1,len(parts),2):english.append({'title':parts[i],'text':parts[i+1].strip()})
 required={discipline:level}|amalgam
 en_names={'Animalismo':'Animalism','Auspícios':'Auspex','Dominação':'Dominate','Oblívio':'Oblivion'}
 english.insert(1,{'title':'Requirements','text':'; '.join(f'{en_names.get(d,d)} {n}' for d,n in required.items())+'.'})
 portuguese=[{'title':t,'text':v} for t,v in rows]
 portuguese.insert(1,{'title':'Requisitos','text':'; '.join(f'{d} {n}' for d,n in required.items())+'.'})
 requirements={'disciplines':required}
 if id=='messengers-command':requirements|={'prerequisites':['Animal Messenger'],'prerequisiteAlternatives':[['Compelir','Compel','Mesmerismo','Mesmerize']]}
 version={'id':id+'-players-guide-v5','book':'players-guide-v5','level':level,'sourceTitle':'Guia do Jogador V5, PDF pp. '+', '.join(map(str,numbers)),'sourceLanguage':'en','pdfSha256':source['sha256'],'pages':[{'pdfPage':n,'printedPage':n-2} for n in numbers],'requirements':requirements,'descriptions':{'pt-BR':portuguese,'en':english}}
 entry={'id':id,'kind':'power','names':{'pt-BR':pt,'en':name},'aliases':[pt,name],'discipline':discipline,'level':level,'versions':[version]}
 (repo/'scripts/reviewed-content'/f'{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print('Five Animalism and two Auspex powers prepared')
