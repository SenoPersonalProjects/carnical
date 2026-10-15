"""Core Predator Types, reviewed against original PDF pages 177–180."""
import json,sys
from pathlib import Path
repo=Path(__file__).resolve().parent.parent;work=Path(sys.argv[1])
source=next(s for s in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if s['id']=='core-v5')
general={
'pt-BR':('Como usar o tipo de Predador','O tipo representa seu modo habitual de caçar e as adaptações de seu Sangue, Habilidades e Disciplinas. Não obriga a usar apenas esse método durante a história: oportunidades e cooperação com outros Predadores podem exigir outras formas. O pacote de criação é adicional à distribuição básica; Especializações não aumentam os pontos da Habilidade. Benefícios não são recebidos novamente ao reler ou selecionar o mesmo pacote.'),
'en':('Using a Predator Type','This represents habitual hunting and the adaptations of the vampire’s Blood, Skills and Disciplines. It does not force the same method throughout a story: opportunities and cooperation with other predators may require alternatives. The creation package supplements the base allocation; specialties do not increase Skill ratings. Reading or selecting the same package again does not grant its benefits again.')}
def add(slug,pt,en,pages,description,english,benefits,benefits_en,exceptions='',exceptions_en=''):
 desc={}
 for locale,body,package,extra in [('pt-BR',description,benefits,exceptions),('en',english,benefits_en,exceptions_en)]:
  sections=[{'title':'Descrição' if locale=='pt-BR' else 'Description','text':body},{'title':'Escolhas e benefícios de criação' if locale=='pt-BR' else 'Creation choices and benefits','text':package}]
  if extra:sections.append({'title':'Requisitos e exceções' if locale=='pt-BR' else 'Requirements and exceptions','text':extra})
  title,text=general[locale];sections.append({'title':title,'text':text});desc[locale]=sections
 entry={'id':slug,'kind':'predator','names':{'pt-BR':pt,'en':en},'aliases':list(dict.fromkeys([pt,en])), 'versions':[{'id':slug+'-core-v5','book':'core-v5','sourceTitle':'Livro Básico V5, pp. '+', '.join(str(p-2) for p in pages),'sourceLanguage':'pt-BR','pdfSha256':source['sha256'],'pages':[{'pdfPage':p,'printedPage':p-2} for p in pages],'descriptions':desc}]}
 (repo/'scripts/reviewed-content'/('core-predator-'+slug+'.json')).write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
add('consensualista','Consensualista','Consensualist',[177,178],
'Você não se alimenta contra a vontade da vítima. Pode disfarçar a coleta como doação de sangue, integrar a comunidade de pessoas que bebem sangue ou revelar a verdade e obter permissão. A Camarilla considera a revelação uma quebra da Máscara, enquanto alguns pensadores Anarchs aceitam o risco. Qualquer passado é possível; profissionais do sexo, organizadores políticos e advogados são exemplos de pessoas relutantes em se alimentar sem consentimento.',
'You never feed against the victim’s will. You may disguise collection as a blood donation, belong to the community of blood drinkers, or reveal the truth and obtain permission. The Camarilla calls disclosure a Masquerade breach, while some Anarch thinkers accept the risk. Any former life is possible; sex workers, political organizers and lawyers are examples of people reluctant to feed without consent.',
'''- Uma Especialização: Medicina (Flebotomia) ou Persuasão (Bolsas).
- Um ponto em Auspícios ou Fortitude.
- Um ponto de Humanidade.
- Segredo Sombrio 1: Quebrador da Máscara.
- Exclusão de Presa 1: pessoas sem consentimento.''',
'''- One specialty: Medicine (Phlebotomy) or Persuasion (Vessels).
- One dot of Auspex or Fortitude.
- One Humanity.
- Dark Secret 1: Masquerade Breacher.
- Prey Exclusion 1: non-consenting people.''')
add('fazendeiro','Fazendeiro','Farmer',[178],
'Alimenta-se apenas de animais. A Fome o atormenta, mas pretende não matar humanos, mesmo que tenha havido uma exceção no passado. A escolha expressa preocupação moral, independentemente da ocupação anterior: ativista, sacerdote, voluntário humanitário ou vegano são possibilidades. Manter vidas humanas fora de perigo tem um custo.',
'You feed only on animals. Hunger torments you, but you intend not to kill humans, even if there was a past exception. The choice expresses a moral commitment regardless of former occupation: activist, priest, humanitarian volunteer or vegan are possibilities. Keeping human lives out of danger comes at a cost.',
'''- Uma Especialização: Empatia com Animais (animal específico) ou Sobrevivência (Caça).
- Um ponto em Animalismo ou Proteanismo.
- Um ponto de Humanidade.
- Defeito de Alimentação Fazendeiro 2.''',
'''- One specialty: Animal Ken (a specific animal) or Survival (Hunting).
- One dot of Animalism or Protean.
- One Humanity.
- Farmer feeding Flaw 2.''',
'Ventrue não podem escolher este tipo. Também é proibido com Potência de Sangue 3 ou superior. Os dois pontos do Defeito foram conferidos visualmente no PDF; não é um Defeito de um ponto.',
'Ventrue cannot choose this type. It is also unavailable at Blood Potency 3 or higher. The two-dot Flaw was visually checked in the supplied PDF; it is not a one-dot Flaw.')
add('osiris','Osíris','Osiris',[178],
'Uma celebridade mortal ou líder de culto, igreja ou organização semelhante que se alimenta de fãs e adoradores. Eles o tratam como divindade e facilitam o acesso a sangue, mas podem criar problemas com autoridades, religiões organizadas e a Camarilla. DJs, escritores, cultistas, pregadores e organizadores de LARP são exemplos de vidas anteriores.',
'A mortal celebrity or leader of a cult, church or similar organization who feeds on fans and worshippers. They treat you as divine and make blood accessible, but may create trouble with authorities, organized religion and the Camarilla. DJs, writers, cultists, preachers and LARP organizers are possible former lives.',
'''- Uma Especialização: Ocultismo (tradição específica) ou Performance (campo específico de entretenimento).
- Um ponto em Feitiçaria de Sangue, apenas para Tremere, ou Presença.
- Distribua exatamente 3 pontos entre Fama e Rebanho.
- Distribua exatamente 2 pontos entre Inimigos e Defeitos Míticos.''',
'''- One specialty: Occult (a specific tradition) or Performance (a specific entertainment field).
- One dot of Blood Sorcery, Tremere only, or Presence.
- Allocate exactly 3 dots between Fame and Herd.
- Allocate exactly 2 dots among Enemies and Mythic Flaws.''',
'Os três pontos são compartilhados: não concedem Fama 3 e Rebanho 3. O mesmo vale para o orçamento de dois pontos de Defeitos. Registre o campo da Especialização e a identidade dos seguidores e adversários.',
'The three dots form one shared budget, not Fame 3 plus Herd 3. The two-dot Flaw budget is also shared. Record the specialty field and the identities of followers and adversaries.')
add('sacoleiro','Sacoleiro','Bagger',[178],
'Rouba, compra ou obtém sangue frio em vez de caçar pessoas diretamente. Pode usar o mercado negro, furtos, roubos ou acesso a ambulâncias e hospitais; talvez ainda trabalhe no turno da noite em um hospital.',
'You steal, buy or otherwise obtain cold blood instead of hunting people directly. Black markets, theft, robbery or access to ambulances and hospitals may supply it; perhaps you still work a hospital night shift.',
'''- Uma Especialização: Ladroagem (Abrir Fechaduras) ou Manha (Mercado Negro).
- Um ponto em Feitiçaria de Sangue, apenas para Tremere, ou Ofuscação.
- Esôfago de Ferro 3.
- Inimigo 2: alguém que cobra uma dívida ou outro motivo para evitar as ruas.''',
'''- One specialty: Larceny (Lockpicking) or Streetwise (Black Market).
- One dot of Blood Sorcery, Tremere only, or Obfuscate.
- Iron Gullet 3.
- Enemy 2: someone collecting a debt or another reason to avoid the streets.''',
'Ventrue não podem escolher este tipo. Os pontos de Esôfago de Ferro e Inimigo são respectivamente três e dois, conforme as marcas conferidas no original.',
'Ventrue cannot choose this type. Iron Gullet and Enemy are three and two dots respectively, as visually checked in the original.')
add('sandman','Sandman','Sandman',[178],
'Usa discrição ou Disciplinas para se alimentar de vítimas adormecidas. Se não acordarem durante a alimentação, não descobrirão sua existência. Um passado antissocial ou desconforto com a vida noturna e a violência de outros caçadores pode explicar a escolha.',
'You use discretion or Disciplines to feed on sleeping victims. If they never wake during feeding, they do not discover your existence. An antisocial past or discomfort with nightlife and other hunters’ violence may explain the choice.',
'''- Uma Especialização: Medicina (Anestésicos) ou Furtividade (Invasão).
- Um ponto em Auspícios ou Ofuscação.
- Recursos 1.''',
'''- One specialty: Medicine (Anesthetics) or Stealth (Break-in).
- One dot of Auspex or Obfuscate.
- Resources 1.''')
add('sanguessuga','Sanguessuga','Blood Leech',[178,179],
'Bebe Sangue de outros vampiros por caça, coerção ou pagamento. Pode considerar essa a única alimentação moral, mas a prática costuma ser proibida entre os Membros. Exige correr riscos extremos ou ocupar uma posição de poder invejável.',
'You drink other vampires’ Blood through hunting, coercion or payment. You may consider this the only moral way to feed, but the practice is commonly forbidden among Kindred. It requires extreme risks or an enviable position of power.',
'''- Uma Especialização: Briga (Membros) ou Furtividade (contra Membros).
- Um ponto em Celeridade ou Proteanismo.
- Perca 1 Humanidade.
- Aumente a Potência de Sangue em 1.
- Escolha Segredo Sombrio 2 (Diablerista) ou Segregado 2.
- Exclusão de Presa 2: mortais.''',
'''- One specialty: Brawl (Kindred) or Stealth (against Kindred).
- One dot of Celerity or Protean.
- Lose 1 Humanity.
- Increase Blood Potency by 1.
- Choose Dark Secret 2 (Diablerist) or Shunned 2.
- Prey Exclusion 2: mortals.''',
'Segredo Sombrio e Segregado são alternativas, não dois Defeitos obrigatórios. O aumento de Potência não altera automaticamente a Geração.',
'Dark Secret and Shunned are alternatives, not two mandatory Flaws. Increasing Potency does not automatically change Generation.')
add('scene-queen','Scene Queen','Scene Queen',[179],
'Alimenta-se dentro de uma subcultura que conhece bem, mantendo a imagem de integrante do grupo. As vítimas admiram seu status, e quem percebe a verdade é desacreditado. Pode agir nas ruas ou na elite, oferecendo esperanças e promessas de ascensão. Em vida, já pertencia a uma cena semelhante.',
'You feed within a subculture you know well while presenting yourself as a member. Victims admire your status, and those who recognize the truth are discredited. This can happen on the streets or among elites, using hopes and promises of advancement. In life you already belonged to a similar scene.',
'''- Uma Especialização: Etiqueta, Liderança ou Manha, sempre na cena específica.
- Um ponto em Dominação ou Potência.
- Fama 1.
- Contatos 1.
- Escolha Rejeitado 1 (Influência fora da subcultura) ou Exclusão de Presa 1 (outra subcultura).''',
'''- One specialty: Etiquette, Leadership or Streetwise, always in the specific scene.
- One dot of Dominate or Potence.
- Fame 1.
- Contacts 1.
- Choose Disliked 1 (Influence outside the subculture) or Prey Exclusion 1 (another subculture).''')
add('sereia','Sereia','Siren',[179,180],
'Alimenta-se quase sempre durante o sexo ou ao fingir interesse sexual, ocultando a predação por sedução, Disciplinas ou desejo alheio. Pode ter dominado encontros casuais e clubes noturnos, mas teme o caráter abusivo dessa relação. Um ex-amante sobrevivente pode ser Pilar ou perseguidor e deve entrar no Mapa de Relacionamentos. Sedutor, produtor, autor ou alguém tentando compensar experiências perdidas são conceitos possíveis.',
'You feed almost exclusively during sex or while feigning sexual interest, concealing predation through seduction, Disciplines or others’ desire. You may have mastered casual encounters and nightclubs while fearing the abusive nature of those relationships. A surviving former lover may be a Touchstone or pursuer and belongs on the Relationship Map. A seducer, producer, author or someone compensating for missed experiences are possible concepts.',
'''- Uma Especialização: Persuasão (Sedução) ou Subterfúgio (Sedução).
- Um ponto em Fortitude ou Presença.
- Belo 2.
- Inimigo 1: amante desprezado ou parceiro ciumento.''',
'''- One specialty: Persuasion (Seduction) or Subterfuge (Seduction).
- One dot of Fortitude or Presence.
- Beautiful 2.
- Enemy 1: a spurned lover or jealous partner.''')
add('trinchador','Trinchador','Cleaver',[180],
'Alimenta-se secretamente de familiares e amigos mortais, próprios ou de outra pessoa, com os quais mantém laços. Alguns adotam filhos, casam-se e sustentam a vida familiar por décadas. Inclua essa família no Mapa de Relacionamentos. Esconder a condição pode gerar vínculos destrutivos; a Camarilla proíbe assumir uma família humana e vê a prática como risco iminente à Máscara. Outros Membros usam apelidos depreciativos e podem até matar a família para encerrar o risco, alegando agir pelo bem do vampiro.',
'You secretly feed on mortal family and friends, your own or someone else’s, while maintaining those ties. Some adopt children, marry and sustain family life for as long as possible. Add this family to the Relationship Map. Concealment may create destructive relationships; the Camarilla forbids taking a human family and sees it as an imminent Masquerade risk. Other Kindred use dismissive nicknames and may even kill the family to end the risk, claiming to act for the vampire’s benefit.',
'''- Uma Especialização: Persuasão (Gaslighting) ou Subterfúgio (Encobrimento).
- Um ponto em Dominação ou Animalismo.
- Segredo Sombrio 1: Trinchador.
- Rebanho 2.''',
'''- One specialty: Persuasion (Gaslighting) or Subterfuge (Cover-ups).
- One dot of Dominate or Animalism.
- Dark Secret 1: Cleaver.
- Herd 2.''')
add('vira-lata','Vira-lata','Alleycat',[180],
'Um caçador de assalto que persegue, domina e bebe de quem puder. Pode ameaçar ou usar Dominação para silenciar vítimas ou fazer o ataque parecer roubo. Defina por que a sequência de perseguir, atacar, alimentar-se e fugir se tornou aceitável. Pessoa em situação de rua, soldado de operações especiais, assassino de cartel ou caçador são passados possíveis.',
'A violent ambush hunter who stalks, overpowers and drinks from whoever is available. You may threaten victims or use Dominate to silence them or disguise the attack as robbery. Decide why stalking, attacking, feeding and fleeing became acceptable. A homeless person, special-forces soldier, cartel killer or game hunter are possible former lives.',
'''- Uma Especialização: Intimidação (Assalto à Mão Armada) ou Briga (Agarramento).
- Um ponto em Celeridade ou Potência.
- Perca 1 Humanidade.
- Contatos criminosos 3.''',
'''- One specialty: Intimidation (Stickups) or Brawl (Grappling).
- One dot of Celerity or Potence.
- Lose 1 Humanity.
- Criminal Contacts 3.''')
print('Ten Core Predator Types: bilingual descriptions, complete creation packages and precise source pages')
