"""All seven Advantages on Companion pp. 59–60, including ghoul restrictions."""
import json,sys
from pathlib import Path
repo=Path(__file__).resolve().parent.parent;work=Path(sys.argv[1]);manifest=json.loads((work/'pages/manifest.json').read_text(encoding='utf-8'));source=next(row for row in manifest if row['id']=='companion-v5')
rows=[
 ('baneful-blood','Sangue Pernicioso','Baneful Blood','flaw',[1,2,3],['ghoul'],59,
  'Você manifesta a Perdição do clã do primeiro domitor cujo Sangue bebeu para se tornar carniçal. Ele deve pertencer a Lasombra, Malkavianos, Ministério, Nosferatu, Ravnos, Salubri ou Toreador. A Perdição continua mesmo que você passe a ter outro domitor. Um, dois ou três pontos neste Defeito dão Gravidade da Perdição 1, 2 ou 3, respectivamente.',
  'You manifest the clan Bane of the first domitor whose Blood made you a ghoul. That vampire must be Lasombra, Malkavian, Ministry, Nosferatu, Ravnos, Salubri or Toreador. The Bane remains even if you change domitors. One, two or three dots in this Flaw give Bane Severity 1, 2 or 3 respectively.'),
 ('blood-empathy','Empatia de Sangue','Blood Empathy','merit',[2],['ghoul'],60,
  'Você sente o estado emocional e psicológico do domitor mesmo sem estar fisicamente com ele. Isso pode permitir perceber perigo ou necessidade de sua presença, mas não permite comunicação telepática. O efeito funciona até 1,6 quilômetro do domitor, definido como aquele cujo Sangue você bebeu mais recentemente. Não exige Laço de Sangue, embora pareça mais forte quando há um.',
  'You sense your domitor’s emotional and psychological state even when apart. This may reveal danger or a need for your immediate presence, but does not allow telepathic communication. The effect works within 1.6 kilometers of the domitor whose Blood you most recently drank. A Blood Bond is not required, although the effect seems stronger when one exists.'),
 ('crones-curse','Maldição da Megaira','Crone’s Curse','flaw',[3],['ghoul'],60,
  'Beber o Vitae do domitor fez você envelhecer rapidamente: sua aparência é uma década mais velha que sua idade. Sua trilha de Vitalidade tem uma caixa a menos. O Defeito é cancelado ao receber o Abraço, mas o Narrador pode decidir que ele persiste; nesse caso a condição é sua, não do Sangue do domitor.',
  'Drinking the domitor’s vitae rapidly aged you: you look a decade older than your age. You have one fewer Health box than normal. The Flaw is canceled upon the Embrace, but the Storyteller may decide it persists; in that case the condition is yours rather than a property of the domitor’s Blood.'),
 ('distressing-fangs','Presas Estranhas','Distressing Fangs','flaw',[2],['ghoul'],60,
  'O Sangue lhe deu dentes afiados, mas eles são atrofiados, estranhos e desconcertantes. Perca um dado em paradas Sociais que envolvam mortais, pois suas presas os deixam inquietos.',
  'The Blood has given you sharp but strange, stunted and unsettling teeth. Lose one die from Social pools involving mortals because your fangs make them uneasy.'),
 ('living-on-the-edge','Vivendo no Limite','Living on the Edge','flaw',[2],['vampire','ghoul','mortal'],60,
  'Ao ter oportunidade de experimentar uma tentação arriscada que nunca viveu, você sofre uma penalidade de dois dados em todas as ações até experimentar a novidade ou a cena terminar. Exemplos incluem uma nova droga, beber Sangue vampírico ou flertar com um Membro. O Defeito não obriga ações suicidas, mas você nem sempre consegue prever as consequências de suas ações.',
  'When offered a risky temptation you have never experienced, take a two-dice penalty on all actions until you try it or the scene ends. Examples include a new drug, drinking vampire Blood or flirting with a Kindred. The Flaw does not compel suicidal actions, but you cannot always predict the consequences of your actions.'),
 ('unseemly-aura','Aura Imprópria','Unseemly Aura','merit',[2],['ghoul'],60,
  'O Sangue tornou sua aura pálida e indistinguível da aura de um Membro, em vez da aura vibrante de um mortal vivo. Outros podem superestimar sua natureza, o que tanto pode ajudar quanto provocar situações embaraçosas.',
  'The Blood has made your aura pale and indistinguishable from a Kindred’s rather than the vibrant aura of a living mortal. Others may overestimate your nature, which can help or create awkward situations.'),
 ('weak-willed','Vontade Fraca','Weak-Willed','flaw',[3],['vampire','ghoul','mortal'],60,
  'Você tem dificuldade para impor sua personalidade diante da determinação de outra pessoa. Isso não significa submissão ou lealdade automáticas. Mesmo quando sabe que estão tentando dominá-lo mental ou emocionalmente, como com Dominação ou Presença, você não pode usar os sistemas de resistência ativa para evitar os efeitos.',
  'You struggle to assert your personality against another person’s determination. This does not automatically mean submission or loyalty. Even when you know someone is attempting mental or emotional domination, such as with Dominate or Presence, you cannot use active resistance systems to avoid the effects.'),
]
for slug,pt,en,kind,levels,types,page,body_pt,body_en in rows:
 id='companion-advantage-'+slug;versions=[]
 for dots in levels:
  descriptions={}
  for language,body in [('pt-BR',body_pt),('en',body_en)]:
   english=language=='en'
   text=('The ghoul-specific options do not grant effects to mortals. Merits and Flaws normally carry over when a mortal becomes a ghoul, unless stated otherwise. Becoming a ghoul or receiving the Embrace may invalidate some Advantages. The Storyteller decides whether to reallocate or lose those dots: invalidated Merit dots can generally purchase new Advantages; Flaw dots can be retained by the Storyteller for later use.' if english else 'As opções específicas de carniçal não concedem efeitos a mortais. Qualidades e Defeitos normalmente continuam quando um mortal se torna carniçal, salvo indicação contrária. Tornar-se carniçal ou receber o Abraço pode invalidar certas Vantagens. O Narrador decide se os pontos são realocados ou perdidos: em geral, pontos de Qualidades invalidadas podem comprar novas Vantagens, enquanto pontos de Defeitos podem ser reservados pelo Narrador para uso posterior.')
   descriptions[language]=[{'title':'Requirements' if english else 'Requisitos','text':('Ghoul.' if english else 'Carniçal.') if types==['ghoul'] else ('Psychological Flaw.' if english else 'Defeito Psicológico.')},{'title':'Cost' if english else 'Custo','text':str(dots)+(' dot(s).' if english else ' ponto(s).')},{'title':'System' if english else 'Sistema','text':body},{'title':'Changes of condition' if english else 'Mudanças de condição','text':text}]
  versions.append({'id':id+'-'+str(dots),'book':'companion-v5','sourceTitle':f'Companion V5, pp. 59–60 · {dots} ponto(s)','sourceLanguage':'pt-BR','pdfSha256':source['sha256'],'level':dots,'pages':[{'pdfPage':n,'printedPage':n} for n in sorted({59,page})],'requirements':{'characterTypes':types},'descriptions':descriptions})
 guide_levels={'baneful-blood':[1,2],'blood-empathy':[2],'crones-curse':[2],'distressing-fangs':[1],'living-on-the-edge':[1],'unseemly-aura':[2],'weak-willed':[2]}[slug]
 guide_pt=body_pt;guide_en=body_en
 if slug=='baneful-blood':
  guide_pt='Você manifesta a Perdição do clã do primeiro domitor cujo Sangue bebeu para se tornar carniçal. Ele deve pertencer a Lasombra, Malkavianos, Ministério, Nosferatu, Ravnos, Salubri ou Toreador. A Perdição continua mesmo que o domitor mude. Cada ponto neste Defeito concede um nível de Gravidade da Perdição; nesta versão, o Defeito tem um ou dois pontos.'
  guide_en='You manifest the clan Bane of the first domitor whose Blood made you a ghoul. That vampire must be Lasombra, Malkavian, Ministry, Nosferatu, Ravnos, Salubri or Toreador. The Bane remains even if you change domitors. Each dot in this Flaw gives one level of Bane Severity; this version allows one or two dots.'
 if slug=='crones-curse':guide_pt=guide_pt.replace('uma década mais velha','pelo menos uma década mais velha');guide_en=guide_en.replace('look a decade older','look at least a decade older')
 if slug=='weak-willed':
  guide_pt=guide_pt.replace('Mesmo quando sabe','Sofra uma penalidade de um dado em paradas Sociais contra seu líder ou superior. Mesmo quando sabe')
  guide_en=guide_en.replace('Even when you know','Take a one-die penalty to Social pools against your leader or superior. Even when you know')
 guide_names={'pt-BR':'Propenso ao Risco','en':'Risk-Taker'} if slug=='living-on-the-edge' else {'pt-BR':pt,'en':en}
 pdf_pages=[143,144] if slug=='baneful-blood' else [143] if slug in ['blood-empathy','unseemly-aura'] else [144] if slug in ['crones-curse','distressing-fangs'] else [123]
 guide_source=next(row for row in manifest if row['id']=='players-guide-v5')
 for guide_index,dots in enumerate(guide_levels):
  descriptions={language:[{'title':'Requirements' if language=='en' else 'Requisitos','text':('Ghoul.' if language=='en' else 'Carniçal.') if types==['ghoul'] else ('Psychological Flaw.' if language=='en' else 'Defeito Psicológico.')},{'title':'Cost' if language=='en' else 'Custo','text':str(dots)+(' dot(s).' if language=='en' else ' ponto(s).')},{'title':'System' if language=='en' else 'Sistema','text':guide_en if language=='en' else guide_pt}] for language in ['pt-BR','en']}
  versions.insert(guide_index,{'id':id+'-guide-'+str(dots),'book':'players-guide-v5','sourceTitle':'Player’s Guide V5, pp. '+', '.join(str(n-2) for n in pdf_pages)+f' · {dots} ponto(s)','sourceLanguage':'en','pdfSha256':guide_source['sha256'],'names':guide_names,'level':dots,'pages':[{'pdfPage':n,'printedPage':n-2} for n in pdf_pages],'requirements':{'characterTypes':types},'descriptions':descriptions})
 entry={'id':id,'kind':kind,'names':{'pt-BR':pt,'en':en},'aliases':list(dict.fromkeys([pt,en,*guide_names.values()])),'versions':versions}
 if len(levels)==1:entry['level']=levels[0]
 (repo/'scripts/reviewed-content'/f'{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(rows)} Companion Advantages, with explicit applicability and per-level versions')
