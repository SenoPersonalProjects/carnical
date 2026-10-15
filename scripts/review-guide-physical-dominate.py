"""Guide Celerity, Fortitude and Dominate additions; exact source references."""
import json,re,sys
from pathlib import Path
work=Path(sys.argv[1]);repo=Path(__file__).resolve().parent.parent
source=next(x for x in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if x['id']=='players-guide-v5')
data=[
('rush-job','Rush Job','Trabalho Acelerado','Celeridade',2,[74],{},[
('Descrição','Executa tarefas demoradas com mãos e dedos rápidos demais para acompanhar. A concentração permite fins não violentos mesmo sob pressão ou ataque.'),('Custo','Um Teste de Sangue.'),('Sistema','Tarefas de Habilidade que exigiriam turnos inteiros podem ser realizadas em segundos. Pode tratar uma ação completa como ação menor, conforme o Livro Básico inglês, p. 298. Não acelera ataques, defesas nem outras tarefas ativamente resistidas. Por exemplo, pode abrir uma fechadura e disparar uma arma, aplicando ao disparo a penalidade de dois dados da ação menor.'),('Duração','Uma cena.')]),
('weaving','Weaving','Esquiva Veloz','Celeridade',3,[74],{},[
('Descrição','Percebe facas arremessadas e balas como projéteis lentos, conseguindo desviar-se deles.'),('Custo','Um Teste de Sangue.'),('Requisitos adicionais','Reflexos Rápidos.'),('Sistema','Ao defender-se de múltiplos ataques à distância com Destreza + Atletismo, não sofre redução progressiva da parada. Acrescenta também seu nível de Celeridade a todas essas defesas enquanto o poder estiver ativo.'),('Duração','Uma cena.')]),
('blurred-momentum','Blurred Momentum','Movimento Borrado','Celeridade',4,[74],{},[
('Descrição','Move-se como um borrão irregular, difícil de atingir mesmo quando não percebe o oponente ou não se defende ativamente.'),('Custo','Um Teste de Sangue por turno.'),('Sistema','Ataques com menos sucessos que o nível de Celeridade do usuário sempre erram, independentemente do resultado de sua defesa ou esquiva, se houver. Também funciona contra ataques surpresa e ataques que impedem defesa, como Golpe Relâmpago. Ativar exige um Teste de Sangue, e cada turno adicional exige outro.'),('Duração','Até o usuário deixar de manter o poder.')]),
('players-guide-v5-power-celeridade-unseen-strike','Unseen Strike','Golpe Invisível','Celeridade',5,[75],{'Ofuscação':4},[
('Descrição','Desaparece à vista e desloca-se instantaneamente até um inimigo para atacar, combinando Piscar com elementos de Desaparecer.'),('Custo','Dois Testes de Sangue.'),('Requisitos adicionais','Piscar.'),('Parada e resistência','Destreza + Celeridade contra Raciocínio + Percepção.'),('Sistema','O alvo é surpreendido e, salvo se vencer a disputa de percepção, não pode defender-se: o ataque é feito contra Dificuldade 1, conforme ataques surpresa do Livro Básico inglês, p. 300. Se o usuário falhar nessa disputa, ainda realiza um ataque normal conforme Piscar, p. 253. O deslocamento tem as mesmas restrições de Piscar.'),('Duração','Um turno.')]),
('earths-perseverance','Earth’s Perseverance','Perseverança da Terra','Fortitude',2,[76,77],{},[
('Descrição','Extrai a permanência da terra para permanecer enraizado e quase impossível de deslocar.'),('Custo','Um Teste de Sangue.'),('Sistema','Enquanto o poder estiver ativo, só se move se escolher fazê-lo por conta própria. Isso não oferece resistência a dano: ainda pode ser esmagado, despedaçado ou dilacerado, assim como o piso em que está apoiado.'),('Duração','Uma cena ou até encerrar o poder.')]),
('invigorating-vitae','Invigorating Vitae','Vitae Revigorante','Fortitude',2,[77],{'Auspícios':1},[
('Descrição','Fortalece o poder do próprio Sangue para regenerar carne mortal e curar enfermidades de seres vivos que o bebam.'),('Custo','Nenhum além dos Testes de Sangue por fornecer vitae.'),('Sistema','Ao usar vitae para curar vivos, conforme a p. 139 do Guia, cura três níveis de dano agravado por Teste de Sangue, em vez de um. Os outros efeitos, como tornar-se carniçal e arriscar Laço de Sangue, permanecem.'),('Duração','Passivo.')]),
('gorgons-scales','Gorgon’s Scales','Escamas da Górgona','Fortitude',4,[77,78],{},[
('Descrição','A Ressonância do sangue da última alimentação oferece defesas contra poderes e fraquezas vampíricas. Alguns vampiros mantêm vítimas com emoções manipuladas para dispor de diferentes Ressonâncias.'),('Custo','Um Teste de Sangue.'),('Sistema','Ao ativar, recebe a proteção correspondente à Ressonância da última vítima, conforme a tabela. A Ressonância é consumida nas condições indicadas.'),('Proteções','| Ressonância | Efeito | Quando a Ressonância é perdida |\n| --- | --- | --- |\n| Colérica | Uma estaca cravada no coração apodrece ou vira cinzas ao fim da cena, libertando o vampiro da paralisia | Ao libertar o vampiro |\n| Melancólica | Dano agravado de Vitalidade causado por fogo torna-se superficial | Após reduzir quatro níveis |\n| Fleumática | Quatro dados extras para resistir a poderes de Auspícios que revelem informações sobre o vampiro ou seu conhecimento | Ao fim da cena |\n| Sanguínea | Dano agravado de Vitalidade causado por luz solar torna-se superficial | Após reduzir quatro níveis |'),('Duração','Até o fim da cena ou até perder a Ressonância, o que ocorrer primeiro.')]),
('players-guide-v5-power-domina-o-slavish-devotion','Slavish Devotion','Devoção Servil','Dominação',1,[75],{'Fortitude':1},[
('Descrição','Fortalece a mente de quem já está sob sua Dominação contra interferência de outros vampiros.'),('Custo','Nenhum custo adicional.'),('Sistema','Uma terceira pessoa que tente usar Dominação num personagem já sob a Dominação do usuário sofre uma penalidade de dados igual à Fortitude dele.'),('Duração','Passivo.')]),
('players-guide-v5-power-domina-o-ancestral-dominion','Ancestral Dominion','Domínio Ancestral','Dominação',4,[76],{'Feitiçaria de Sangue':2},[
('Descrição','Transmite uma ordem pelo Sangue a um descendente, dispensando fala e contato visual. A vítima sabe instintivamente que um ancestral a manipula.'),('Custo','Um Teste de Sangue.'),('Requisitos adicionais','Mesmerismo.'),('Parada e resistência','Manipulação + Dominação contra Determinação + Ocultismo.'),('Sistema','Uma vitória leva o descendente a cumprir o pedido, desde que não envolva ferir a si mesmo. O alvo recebe um dado extra de resistência por Geração que o separe do usuário: um descendente de 11ª Geração recebe dois dados contra um ancestral de 9ª. A ordem passa silenciosamente de Sangue para Sangue, mas todas as demais limitações de Dominação se aplicam.'),('Duração','Até cumprir a ordem ou o fim da cena, o que ocorrer primeiro.')]),
('players-guide-v5-power-domina-o-implant-suggestion','Implant Suggestion','Implantar Sugestão','Dominação',4,[76],{'Presença':1},[
('Descrição','Altera temporariamente intenções, paixões, opiniões ou personalidade, em vez de apenas conduzir uma vítima sem vontade. Pode suscitar desejos, desconfiança ou abandono de vínculos; seu uso indiscriminado inspira repulsa e medo.'),('Custo','Um Teste de Sangue.'),('Parada e resistência','Manipulação + Dominação contra Autocontrole + Determinação.'),('Sistema','Não exige teste contra mortais desprevenidos. Mortais preparados ou vampiros resistem pela disputa indicada. Mudanças radicais em crenças centrais, como fazer um vegano desejar carne ou um pacifista desejar violência, também permitem resistência a mortais desprevenidos. Ao fim da cena, o alvo sai desse estado.'),('Duração','Uma cena.')]),
]
boundaries=[x[1].upper() for x in data]+['DOMITOR’S FAVOR','VALEREN','CHIMERSTRY']
for id,name,pt,discipline,level,numbers,amalgam,rows in data:
 text='\n\n'.join(json.loads((work/'pages/players-guide-v5'/f'{n:04}.json').read_text(encoding='utf-8'))['content'] for n in numbers)
 text=text.split('## '+name.upper()+'\n',1)[1]
 text=re.split(r'\n## (?:'+'|'.join(re.escape(t) for t in boundaries)+r'|Level \d|Dominate|Fortitude|Obfuscate)\n',text,1)[0]
 text=re.sub(r'^##\s+', '',text,flags=re.M).replace('\u0083','\n- ')
 text=text.replace('Vampire:\n\nThe Masquerade','Vampire: The Masquerade')
 text=re.sub(r'(?<=[a-z,])\n\n(?=[a-z])',' ',text)
 text=re.sub(r'(?<!\n)( Dice Pools?:)',r'\n\n\1',text)
 parts=re.split(r'(?:^|\n\n)(Cost|Dice Pools?|System|Duration):\s*',text)
 english=[{'title':'Description','text':parts[0].strip()}]
 for i in range(1,len(parts),2):english.append({'title':parts[i],'text':parts[i+1].strip()})
 required={discipline:level}|amalgam
 en_names={'Celeridade':'Celerity','Dominação':'Dominate','Ofuscação':'Obfuscate','Auspícios':'Auspex','Feitiçaria de Sangue':'Blood Sorcery'}
 english.insert(1,{'title':'Requirements','text':'; '.join(f'{en_names.get(d,d)} {n}' for d,n in required.items())+'.'})
 portuguese=[{'title':t,'text':v} for t,v in rows]
 portuguese.insert(1,{'title':'Requisitos','text':'; '.join(f'{d} {n}' for d,n in required.items())+'.'})
 requirements={'disciplines':required}
 alternatives={'Weaving':['Reflexos Rápidos','Rapid Reflexes'],'Unseen Strike':['Piscar','Blink'],'Ancestral Dominion':['Mesmerismo','Mesmerize']}
 if name in alternatives:requirements['prerequisiteAlternatives']=[alternatives[name]]
 version={'id':id+'-players-guide-v5','book':'players-guide-v5','level':level,'sourceTitle':'Guia do Jogador V5, PDF pp. '+', '.join(map(str,numbers)),'sourceLanguage':'en','pdfSha256':source['sha256'],'pages':[{'pdfPage':n,'printedPage':n-2} for n in numbers],'requirements':requirements,'descriptions':{'pt-BR':portuguese,'en':english}}
 entry={'id':id,'kind':'power','names':{'pt-BR':pt,'en':name},'aliases':[pt,name],'discipline':discipline,'level':level,'versions':[version]}
 (repo/'scripts/reviewed-content'/f'{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print('10 additional Guide powers prepared')
