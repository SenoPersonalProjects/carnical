"""Fourteen additional unrated Thin-blood choices, visually checked PDF137–138."""
import json,re,sys
from pathlib import Path
repo=Path(__file__).resolve().parent.parent;work=Path(sys.argv[1]);source=next(r for r in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if r['id']=='players-guide-v5')
text='\n\n'.join(json.loads((work/f'pages/players-guide-v5/{p:04}.json').read_text(encoding='utf-8'))['content'] for p in [137,138])
rows=[
('heliophobia','flaw','Heliofobia','Heliophobia',[137],
 'Um senhor cauteloso demais insistiu excessivamente para que você evitasse a luz solar, ou você viu alguém pegar fogo ao nascer do sol pouco depois de seu Abraço. Seja qual for a causa, você teme a luz solar como um vampiro pleno. Está sujeito ao Frenesi de Terror provocado pela luz solar.'),
('night-terrors','flaw','Terrores Noturnos','Night Terrors',[137],
 'Você dorme normalmente, sem lembrar dos sonhos que talvez tenha durante o dia. À noite, porém, eles retornam nos momentos mais inconvenientes. Sob estresse ou quando sua Besta está mais forte, os pesadelos parecem dolorosamente reais. Podem ser alucinações desconexas ou um meio de o Narrador transmitir temas e prenunciar acontecimentos. Uma vez por sessão, os terrores noturnos começam e você sofre uma penalidade de um dado em todas as ações pelo restante da cena.'),
('plague-bearer','flaw','Portador da Peste','Plague Bearer',[137],
 'Você ainda está sujeito a doenças mortais: resfriados, gripe e infecções mais graves. Toda vez que se alimentar, role um dado para cada ponto de Fome saciado. Se qualquer dado resultar em 1, você contraiu algo desagradável. O efeito cabe ao Narrador e pode variar de penalidades de dados à perda gradual de Vitalidade. Medicina mortal não o cura: é preciso beber um sistema imunológico funcional, saciando sua Fome até 0. Você também corre o risco de infectar qualquer pessoa de quem se alimentar, usando a mesma rolagem descrita acima.'),
('sloppy-drinker','flaw','Bebedor Desastrado','Sloppy Drinker',[137],
 'Sua mordida é descuidada ou suas presas não perfuram a pele de maneira limpa. Ao se alimentar, faça um teste de Destreza + Medicina com dificuldade igual à Fome saciada para cobrir as marcas antes que muito sangue seja derramado. Em caso de falha, a ferida fica irregular demais para ser fechada: o mortal pode sangrar até morrer com ferimentos no pescoço que ameaçam a Máscara.'),
('sun-faded','flaw','Desvanecido pelo Sol','Sun-Faded',[137],
 'Você não pode usar poderes de Disciplinas, incluindo Alquimia do Sangue-Fraco, sob luz solar. Poderes ativos cessam quando você entra na luz solar. Durante o dia, pode usá-los em ambientes internos com uma penalidade de dois dados, desde que evite qualquer indício de luz solar.'),
('supernatural-tell','flaw','Sinal Sobrenatural','Supernatural Tell',[137],
 'Seja pelo cheiro, aura ou algo ainda mais sutil, outras entidades sobrenaturais percebem sua presença. Podem ficar curiosas, famintas ou irritadas, mas certamente o notam. Perca dois dados em paradas de Furtividade e semelhantes contra adversários sobrenaturais, incluindo outros vampiros.'),
('twilight-presence','flaw','Presença Crepuscular','Twilight Presence',[137],
 'Você deixa os outros desconfortáveis. A maioria dos mortais não quer ficar por perto, e outros Membros o desprezam ainda mais que os Sangues-Ralos comuns. Apenas Sangues-Ralos se acostumam ao seu comportamento estranho. Perca um dado em paradas Sociais que envolvam qualquer pessoa que não seja Sangue-Ralo.'),
('unending-hunger','flaw','Fome Interminável','Unending Hunger',[137],
 'Sua Besta sempre quer mais e não encontra sustento em pequenos goles. Ao se alimentar em uma cena, você sacia um ponto de Fome a menos que outros Sangues-Ralos. Isso se aplica somente uma vez por cena.'),
('abhorrent-blood','merit','Sangue Repulsivo','Abhorrent Blood',[137,138],
 'Algo em seu Sangue faz outros vampiros não conseguirem suportá-lo. Talvez seja a mistura perversa de vida e não vida ou seu histórico de Alquimia do Sangue-Fraco questionável: outros vampiros engasgam e vomitam ao tentar beber de você. Eles interrompem qualquer tentativa de mordida depois do dano inicial. Quem tentar continuar bebendo precisa gastar dois pontos de Vontade a cada turno em que o fizer. Mortais e Alquimia do Sangue-Fraco não são afetados por essa anomalia.'),
('faith-proof','merit','Imune à Fé','Faith-Proof',[138],
 'Seja você ateu ou profundamente religioso, permanece próximo demais da mortalidade para que a Fé Verdadeira o afete.'),
('low-appetite','merit','Pouco Apetite','Low Appetite',[138],
 'Quando estiver com Fome 0 ou 1, e ao se levantar no pôr do sol, role dois dados no Teste de Sangue e use o maior resultado.'),
('lucid-dreamer','merit','Sonhador Lúcido','Lucid Dreamer',[138],
 'A maioria dos vampiros não sonha porque não dorme. Você sonha, consegue recordar seus sonhos e às vezes até controlá-los. Uma vez por sessão, se estiver dormindo durante o dia, pode pedir ao Narrador uma pista baseada nas lembranças da noite anterior ou uma indicação sobre a história apropriada para uma revelação em sonho.'),
('mortalitys-mien','merit','Aspecto Mortal','Mortality’s Mien',[138],
 'Sua natureza mortal ainda se sobressai à Besta. Sua aura não parece vampírica nem sobrenatural: ela parece mortal para qualquer pessoa capaz de detectar criaturas sobrenaturais. Você também pode acrescentar dois dados a qualquer tentativa de parecer mortal por outros meios, como maquiagem.'),
('swift-feeder','merit','Alimentação Veloz','Swift Feeder',[138],
 'Talvez você tenha trabalhado com coleta de sangue em vida ou simplesmente não goste de bagunça. Você bebe delicada e rapidamente, saciando um ponto de Fome em um turno, incluindo lamber a ferida para fechá-la. Esta Qualidade só pode ser usada uma vez por cena.'),
]
for index,(slug,kind,pt,en,pages,translation) in enumerate(rows):
 match=re.search(r'^## '+re.escape(en)+r'\n\n',text,re.M);assert match,en
 if index+1<len(rows):end=re.search(r'^## '+re.escape(rows[index+1][3])+r'\n',text[match.end():],re.M).start()+match.end()
 else:end=text.index(' In the World of Darkness,',match.end())
 original=text[match.end():end].replace('## Thin-Blood Merits','').strip();original=re.sub(r'\s+',' ',original)
 id='thin-blood-'+slug
 req={'clans':['Sangue-Ralo'],'creationOnly':True,'selectionGroup':'thin-blood-'+kind,'storytellerApproval':True}
 guide={'pt-BR':'Escolha especial de Sangue-Ralo, sem valor em pontos. Cada Defeito equilibra uma Qualidade e vice-versa; não usa pontos comuns de Vantagens ou Defeitos nem é uma compra comum com XP. Na criação, escolha de uma a três Qualidades e o mesmo número de Defeitos. Efeitos de cena são resolvidos com o Narrador; esta entrada não altera automaticamente as rolagens gerais.','en':'Unrated Thin-blood choice. Each Flaw balances one Merit and vice versa; it does not use ordinary Advantage or Flaw dots and is not an ordinary XP purchase. At creation, choose one to three Merits and the same number of Flaws. Resolve scene effects with the Storyteller; this entry does not automatically change general rolls.'}
 entry={'id':id,'kind':kind,'names':{'pt-BR':pt,'en':en},'aliases':[pt,en],'level':0,'versions':[{'id':id+'-players-guide-v5','book':'players-guide-v5','sourceTitle':'Player’s Guide V5, pp. '+', '.join(str(p-2) for p in pages),'sourceLanguage':'en','pdfSha256':source['sha256'],'level':0,'pages':[{'pdfPage':p,'printedPage':p-2} for p in pages],'requirements':req,'descriptions':{locale:[{'title':'Descrição e sistema' if locale=='pt-BR' else 'Description and system','text':translation if locale=='pt-BR' else original},{'title':'Escolha e uso' if locale=='pt-BR' else 'Selection and use','text':guide[locale]}] for locale in ['pt-BR','en']}}]}
 (repo/f'scripts/reviewed-content/guide-{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print('14 additional Thin-blood choices, source continuation and unrated balance preserved.')
