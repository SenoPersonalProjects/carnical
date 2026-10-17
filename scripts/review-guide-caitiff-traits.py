"""Caitiff traits checked against Guide PDF128–130 (printed126–128)."""
import json,re,sys
from pathlib import Path
repo=Path(__file__).resolve().parent.parent;work=Path(sys.argv[1]);source=next(row for row in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if row['id']=='players-guide-v5')
content='\n\n'.join(json.loads((work/f'pages/players-guide-v5/{n:04}.json').read_text(encoding='utf-8'))['content'] for n in [128,129,130])
rows=[
('favored-blood','merit',4,'Sangue Favorecido','Favored Blood',[128],
 'O poder vampírico, livre da maldição dos Antigos, flui por você. Seu domínio intuitivo e lendário das capacidades dos Membros provavelmente inspira admiração e medo em outros vampiros.',
 'Você pode comprar pontos em qualquer Disciplina mesmo sem jamais ter provado o sangue de outro vampiro que a possua. Não pode ser combinado com o Defeito Sangue Confuso.'),
('mark-of-caine','merit',2,'Marca de Caim','Mark of Caine',[128],
 'Você possui uma marca física ou espiritual que faz outros vampiros hesitarem. Membros da Camarilla e Ashirra a temem. Anarquistas alegam respeitar sua brincadeira com as superstições dos anciões, mas também evitam olhar de perto. Até Cainitas do Sabá hesitam em enfrentá-lo, embora Nodistas especialmente religiosos possam lhe dar atenção indesejada.',
 'Receba dois dados adicionais em qualquer tentativa de intimidar, ameaçar ou subjugar outros vampiros que acreditem no mito de Caim. Quem tentar cometer diablerie em você não pode acrescentar a própria Potência de Sangue à rolagem; qualquer falha nessa rolagem resulta em falha bestial.'),
('mockingbird','merit',3,'Pássaro Imitador','Mockingbird',[128],
 'Órfãos costumam ser injustamente chamados de ladrões e diableristas, mas alguns realmente conseguem imitar poderes de outros vampiros após provar seu sangue.',
 'Durante uma noite após beber sangue de um vampiro em quantidade equivalente a um dado de Fome, você pode escolher e usar um poder de Disciplina que ele possua. O nível do poder não pode superar sua Disciplina mais alta; você não precisa possuir a mesma Disciplina. Faça normalmente os Testes de Sangue para ativá-lo. Outras rolagens necessárias usam o nível de Disciplina do doador e seus próprios Atributos. Durante esse período, você também imita a Perdição do clã do doador, com a mesma Gravidade dele. Apenas um poder pode ser emprestado dessa maneira por noite.'),
('sun-scarred','merit',5,'Marcado pelo Sol','Sun-Scarred',[128],
 'É um mito comum que Caitiff e Sangues-Ralos possam caminhar ao sol, mas pouquíssimos possuem algo semelhante a essa capacidade. Às vezes chamados de Andarilhos do Dia, os Caitiff com esse poder normalmente o escondem para evitar serem caçados e devorados. Outros podem procurá-los pela experiência e pela vantagem sobre aqueles que precisam dormir durante o dia.',
 'No primeiro turno em que for exposto à luz solar em uma cena, não receba dano de Vitalidade: receba 1 dano agravado em Vontade e obtenha sucesso automático nos testes para resistir ao Frenesi de Terror. Pelo restante da cena, todo dano agravado de Vitalidade causado pela luz solar é imediatamente convertido em dano superficial.'),
('uncle-fangs','merit',3,'Tio Presas','Uncle Fangs',[129],
 'Os Sangues-Ralos locais o conhecem como mentor e guia. Quaisquer que sejam suas verdadeiras motivações, você normalmente consegue ajuda entre os Crepusculares sem precisar pedir duas vezes.',
 'Você tem fácil acesso a uma coterie local de três a cinco Sangues-Ralos. Eles costumam saber dos acontecimentos das ruas antes dos demais e às vezes podem fornecer preparados de Alquimia. Trate-os como um grupo de Aliados (Livro Básico, p. 192), mas, diferentemente dos Aliados comuns, esse grupo é morto-vivo, ainda que por pouco. Não pode ser combinado com Liquidador.'),
('befouling-vitae','flaw',2,'Vitae Corruptora','Befouling Vitae',[129],
 'Quando você Abraça mortais ou os deixa mortos após se alimentar, seu Sangue os transforma em cadáveres maníacos de fome insaciável.',
 'Qualquer mortal que você Abrace ou mate ao se alimentar retorna como um ser degenerado e desesperado em poucas noites. Essas criaturas geralmente são fracas (trate como Carniçal, Livro Básico, p. 372), mas às vezes o Sangue produz um verdadeiro monstro (trate como Degenerado, Livro Básico, p. 375). Sua não vida exige constantes operações de limpeza: se o Príncipe ou Barão descobrir sua condição, os poderosos provavelmente farão uma visita pessoal e fatal.'),
('clan-curse','flaw',2,'Maldição de Clã','Clan Curse',[129],
 'Você é Caitiff por muito pouco e ainda sofre a maldição do clã de seu senhor. Isso às vezes permite passar por integrante daquele clã, mas normalmente só acrescenta sofrimento à sua existência.',
 'Sofra uma Perdição de clã vampírico à sua escolha, provavelmente a de seu senhor, se souber quem ele é. A Gravidade é reduzida à metade, arredondada para baixo, com mínimo de 1.'),
('debt-peon','flaw',2,'Servo das Dívidas','Debt Peon',[129],
 'Órfãos frequentemente precisam vender a própria alma a Príncipes e Barões para encontrar um lugar na noite. Poucos conseguem sair do bolso dos poderosos: o sistema de favores deixa de funcionar quando a sociedade dos Membros se recusa a reconhecer a existência política e os direitos do devedor.',
 'Você deve vários favores menores, ou até alguns maiores, a um vampiro de Status elevado; talvez seu senhor tenha contraído as dívidas. Contabilizá-las é inútil: o credor exige novos favores sempre que tem vantagem sobre você e só considera um favor quitado quando seus pares o obrigam. Ele recebe dois dados adicionais em combate social contra você diante de outros Membros. Recusar-se a honrar a dívida acrescenta o Defeito Rejeitado (2 pontos) e pode até provocar uma Caçada de Sangue.'),
('liquidator','flaw',1,'Liquidador','Liquidator',[129],
 'Sangues-Ralos o chamam de Pander e o evitam sempre que possível. Eles até se recusam a falar abertamente com seus companheiros de coterie e associados. Talvez você tenha sido algoz ou demonstrado crueldade especial no grupo do Xerife.',
 'Sofra uma penalidade de dois dados em todas as paradas de Habilidades Sociais contra Sangues-Ralos, exceto Intimidação. Não pode ser combinado com Tio Presas.'),
('muddled-blood','flaw',1,'Sangue Confuso','Muddled Blood',[129],
 'Seu Sangue não consegue recordar sua natureza e precisa ser lembrado de seu poder inerente toda vez que você deseja fortalecê-lo.',
 'Mesmo que já possua uma Disciplina, você precisa beber o Sangue de alguém que a possua para comprar pontos nela. Não pode ser combinado com a Qualidade Sangue Favorecido.'),
('walking-omen','flaw',2,'Presságio Ambulante','Walking Omen',[129,130],
 'Muitos vampiros dependem de premonições e presságios noturnos. Você funciona como um ímã que desvia essas bússolas sobrenaturais. Adivinhações, premonições e outras previsões do futuro ou da sorte em seu domínio frequentemente apontam você como fonte de desastres. Aliados próximos aprenderam a ignorar isso; outros oráculos o denunciam aos gritos, quando você não está sendo caçado por quem tenta impedir um futuro que acredita que você causará.',
 'Os efeitos finais deste Defeito cabem ao Narrador, mas ele deve causar pelo menos um conflito sério por história.'),
('word-scarred','flaw',1,'Marcado por Palavras','Word-Scarred',[130],
 'Seu corpo, ou parte dele, está coberto por textos antigos do saber vampírico. Talvez seu senhor os tenha inscrito em você ou tenham surgido sozinhos após o Abraço. Forças obscuras conspiram para usar ou destruir esse conhecimento.',
 'O principal adversário ou força ocultista da crônica interfere com frequência em sua vida, tentando aprisioná-lo, esfolá-lo, apagar sua memória, prendê-lo por Laço de Sangue ou neutralizá-lo de outra maneira. Essas forças não se rebaixariam a recrutar um Caitiff: para elas, você é um livro perdido e desobediente. Talvez duas forças disputem o direito de editá-lo. Qualquer outro personagem que leia o texto inteiro em sua pele descobre um segredo terrível sobre a Gehenna, profecias Nodistas, mistérios Bahari ou algo semelhante. Você e o Narrador podem decidir isso juntos, ou o segredo pode ser um mistério até para você.'),
]
headers=[row[4] for row in rows]+['THIN-BLOODS']
for slug,kind,dots,ptname,enname,pages,description,system in rows:
 start=re.search(r'^## '+re.escape(enname)+r'[^\n]*\n\n',content,re.M);assert start,enname
 end=min([m.start() for name in headers if name!=enname for m in [re.search(r'^## '+re.escape(name)+r'(?:[^\n]*)\n',content[start.end():],re.M)] if m] or [len(content)-start.end()])+start.end()
 original=content[start.end():end].strip()
 original=re.sub(r'^## (?=(?:The Masquerade|Vampire: The Masquerade))','',original,flags=re.M)
 original=re.sub(r'^## Caitiff Flaws\s*','',original,flags=re.M)
 original=re.sub(r'\n\s*\n',' ',original).replace('futureor','future- or')
 req={'clans':['Caitiff'],'storytellerApproval':True}
 opposite={'favored-blood':'muddled-blood','muddled-blood':'favored-blood','uncle-fangs':'liquidator','liquidator':'uncle-fangs'}
 if slug in opposite:req['incompatibleItems']=['caitiff-'+opposite[slug]]
 prompts={'clan-curse':('Clã cuja Perdição foi herdada','Clan whose Bane was inherited'),'debt-peon':('Credor e favores devidos','Creditor and boons owed'),'word-scarred':('Força ocultista e conhecimento inscrito','Occult force and inscribed lore')}
 if slug in prompts:req.update(requiresDetail=True,detailLabel=dict(zip(['pt-BR','en'],prompts[slug])))
 if slug=='clan-curse':req['detailOptions']=['Banu Haqim','Brujah','Gangrel','Hecata','Lasombra','Malkavian','Ministry','Nosferatu','Ravnos','Salubri','Toreador','Tremere','Tzimisce','Ventrue']
 id='caitiff-'+slug;rating={'pt-BR':f'{dots} ponto(s). Apenas para Caitiff.','en':f'{dots} dot(s). Caitiff only.'}
 sections={'pt-BR':[{'title':'Descrição','text':description},{'title':'Sistema','text':system},{'title':'Valor e requisitos','text':rating['pt-BR']}],'en':[{'title':'Description and system','text':original},{'title':'Rating and requirements','text':rating['en']}]}
 entry={'id':id,'kind':kind,'names':{'pt-BR':ptname,'en':enname},'aliases':[ptname,enname],'level':dots,'versions':[{'id':id+'-players-guide-v5','book':'players-guide-v5','sourceTitle':'Player’s Guide V5, pp. '+', '.join(str(p-2) for p in pages),'sourceLanguage':'en','pdfSha256':source['sha256'],'level':dots,'pages':[{'pdfPage':p,'printedPage':p-2} for p in pages],'requirements':req,'descriptions':sections}]}
 (repo/f'scripts/reviewed-content/{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(rows)} Caitiff traits written, including both cross-page continuations and mutual exclusions.')
