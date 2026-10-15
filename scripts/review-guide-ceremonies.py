"""Review all nine Guide Ceremonies, including their complete servant profiles."""
import json,re,sys
from pathlib import Path
work=Path(sys.argv[1]);repo=Path(__file__).resolve().parent.parent
manifest=json.loads((work/'pages/manifest.json').read_text(encoding='utf-8'))
candidates=json.loads((work/'catalog/candidates.json').read_text(encoding='utf-8'))
source=next(row for row in manifest if row['id']=='players-guide-v5')
power_names={entry['names']['en']:entry['names']['pt-BR'] for entry in json.loads((repo/'app/content/catalog.json').read_text(encoding='utf-8'))['entries'] if entry['kind']=='power'}
durations={
 'The Gift of False Life':'Until its task is complete or it is destroyed; ordinary decay continues.',
 'Summon Spirit':'Travel time varies and can take several nights. The spirit departs at the end of the scene unless another Ceremony compels or binds it.',
 'Awaken the Homuncular Servant':'A number of nights equal to successes; permanently on a critical win. Inert outside 100 yards/meters.',
 'Compel Spirit':'Until the commands are fulfilled or the chronicle ends; ends immediately if the vampire attacks the wraith.',
 'Host Spirit':'A number of scenes equal to successes. A wraith that overcomes resistance controls the vampire until the end of the scene.',
 'Shambling Hordes':'Until commanded to rest, the master meets final death, or the corpses are destroyed. Continued usefulness beyond the story requires Experience.',
 'Bind the Spirit':'Indefinite, until canceled, the fetter is removed, the wraith is destroyed, or the necromancer attacks it.',
 'Split the Veil':'An absent veil permits passage for the rest of the session or night, then rises to frayed. No separate duration is specified for results short of absent.',
 'Lazarene Blessing':'Indefinite, until the body dies again or the possessing wraith is exorcized.'
}
titles=['THE GIFT OF FALSE LIFE','SUMMON SPIRIT','AWAKEN THE HOMUNCULAR SERVANT','COMPEL SPIRIT','HOST SPIRIT','SHAMBLING HORDES','BIND THE SPIRIT','SPLIT THE VEIL','LAZARENE BLESSING']
profiles={
 'THE GIFT OF FALSE LIFE':('MINDLESS CORPSE','Cadáver Sem Mente','Mindless Corpse',[
 ('Paradas padrão','Standard pools','Físicas 2; Sociais 0; Mentais 0','Physical 2; Social 0; Mental 0'),
 ('Atributos secundários','Secondary Attributes','Vitalidade 4; Força de Vontade 0','Health 4; Willpower 0'),
 ('Paradas excepcionais','Exceptional pools','Intimidação 4','Intimidation 4'),
 ('Dificuldades gerais','General Difficulties','2/1','2/1')],
 'Recebe dano superficial e agravado como vampiros, mas é imune à luz solar. Não pode curar ou reparar dano e apodrece pelo menos um ponto de dano superficial à Vitalidade por dia. Não pode ser dominado ou influenciado mentalmente, pois está ligado ao mestre. Não reage a movimentos, palavras ou interferência de ninguém além do reanimador. Sempre pode contribuir para Trabalho em Equipe em tarefas braçais, como cavar, levantar ou empurrar, mesmo sem Habilidades (Livro Básico inglês, p. 122).',
 'Mindless corpses take Superficial and Aggravated damage in the same way as vampires, except they are immune to sunlight. They cannot heal or mend damage, and rot at least one Superficial Health damage each day. They cannot be mentally dominated or influenced as they are bound to their master. They do not react to motion, words, or interference from anyone but their reanimator. They may always contribute to Teamwork for menial labor such as digging, lifting or pushing even if they lack Skills (Vampire: The Masquerade, p. 122).'),
 'AWAKEN THE HOMUNCULAR SERVANT':('HOMUNCULAR SERVANT','Servo Homuncular','Homuncular Servant',[
 ('Paradas padrão','Standard pools','Físicas 1; Sociais 0; Mentais 1','Physical 1; Social 0; Mental 1'),
 ('Atributos secundários','Secondary Attributes','Vitalidade 3; Força de Vontade 1','Health 3; Willpower 1'),
 ('Paradas excepcionais','Exceptional pools','Atletismo 4; Furtividade 6; Intimidação 4','Athletics 4; Stealth 6; Intimidation 4'),
 ('Dificuldades gerais','General Difficulties','3/1','3/1')],
 'Recebe dano superficial e agravado como vampiros, mas é imune à luz solar. Não pode curar ou reparar dano nem ser dominado ou influenciado mentalmente, pois está ligado ao mestre. Não precisa de olhos ou ouvidos para perceber tudo ao redor como alguém com visão e audição desimpedidas. Pode transmitir telepaticamente uma única imagem por cena ao mestre.',
 'Homuncular servants take Superficial and Aggravated damage in the same way as vampires, except they are immune to sunlight. They cannot heal or mend damage. They cannot be mentally dominated or influenced as they are bound to their master. They do not need eyes or ears to perceive everything around them as someone with unimpeded vision and hearing might. They can telepathically broadcast a single image per scene to their master.'),
 'SHAMBLING HORDES':('AGGRESSIVE CORPSE','Cadáver Agressivo','Aggressive Corpse',[
 ('Paradas padrão','Standard pools','Físicas 4; Sociais 0; Mentais 0','Physical 4; Social 0; Mental 0'),
 ('Atributos secundários','Secondary Attributes','Vitalidade 6; Força de Vontade 0','Health 6; Willpower 0'),
 ('Paradas excepcionais','Exceptional pools','Briga 6; Intimidação 5','Brawl 6; Intimidation 5'),
 ('Dificuldades gerais','General Difficulties','3/2','3/2')],
 'Recebe dano superficial e agravado como vampiros, mas é imune à luz solar. Não pode curar ou reparar dano nem ser dominado ou influenciado mentalmente, pois está ligado ao mestre. Não precisa de olhos ou ouvidos para perceber os arredores como alguém com visão e audição desimpedidas. Suas mordidas causam +2 de dano à Vitalidade, agravado contra mortais.',
 'Aggressive corpses take Superficial and Aggravated damage in the same way as vampires, except they are immune to sunlight. They cannot heal or mend damage. They cannot be mentally dominated or influenced as they are bound to their master. They do not need eyes or ears to perceive everything around them as someone with unimpeded vision and hearing might. Bites from the aggressive dead inflict +2 Health damage which is Aggravated to mortals.')
}
data=[
 ('The Gift of False Life','O Dom da Falsa Vida',1,[94],'Ashes to Ashes',[
 ('Descrição','Reanima um cadáver ou grupo de cadáveres para executar tarefas simples, únicas ou repetitivas.'),
 ('Ingredientes','Um ou mais corpos humanos e uma pequena mistura de sangue, catarro e bile.'),
 ('Processo','Aplique a mistura aos corpos e realize a Cerimônia. Os cadáveres obedecem a uma ordem simples que sejam fisicamente capazes de cumprir, como varrer o chão, manter uma porta fechada ou andar pelo perímetro da casa. Não pensam nem calculam: ordens condicionais ou complexas, como atacar a próxima pessoa que passar, dirigir ou construir uma cabana, não funcionam. O usuário pode indicar um alvo específico para ataque ou outra ação apontando para ele.'),
 ('Sistema','Uma vitória anima um número de corpos igual ao nível de Oblívio ou à quantidade preparada, o que for menor. Uma vitória crítica dobra o nível de Oblívio apenas para determinar quantos cadáveres podem ser animados; ainda depende dos corpos preparados. A animação termina quando o cadáver é destruído ou conclui a tarefa. Eles não se defendem de ataques e se decompõem normalmente: a Cerimônia não os protege dos elementos nem da passagem do tempo.'),
 ('Duração','Até concluir a tarefa ou ser destruído; a decomposição continua normalmente.')]),
 ('Summon Spirit','Invocar Espírito',1,[94,95],'The Binding Fetter',[
 ('Descrição','Invoca um espírito do Submundo.'),
 ('Ingredientes','Uma âncora da aparição, uma fotografia ou outra representação visual dela ou seu nome assinado, e vitae do conjurador.'),
 ('Processo','Derrame vitae na âncora e, estudando a imagem ou assinatura, chame o nome da aparição. Ela sente o chamado e viaja do Submundo até o conjurador. A geografia tem escalas diferentes, mas a viagem pode levar várias noites se vier do outro lado do mundo. Se o véu for suficientemente tênue no local, a âncora puxa o espírito através dele. A aparição não é obrigada a servir: pode reagir com hostilidade se sua âncora estiver ameaçada, ou ficar grata pela convocação e companhia.'),
 ('Sistema','Faça o teste de Cerimônia após marcar a âncora com vitae. A aparição não atravessa um véu impenetrável. Mover a âncora depois não ajuda: sua capacidade de atravessar desaparece se a âncora sair do local da Cerimônia. A aparição desaparece no fim da cena, salvo se outra Cerimônia a compelir ou prender. Não se manifesta fisicamente: surge como sombras nas paredes ou silhuetas trêmulas de sua forma viva, das quais podem vir vozes. Fala os idiomas que conhecia em vida, salvo se aprendeu outros no Submundo.'),
 ('Duração','Chegada variável, possivelmente várias noites; após chegar, até o fim da cena, salvo outra Cerimônia.')]),
 ('Awaken the Homuncular Servant','Despertar o Servo Homuncular',2,[95],'Where the Veil Thins',[
 ('Descrição','Cria servos e espiões de partes de corpos, como mãos ou crânios, ou de pequenos animais mortos, como ratos e raposas. Alguns necromantes enchem suas oficinas dessas criaturas inquietantes.'),
 ('Ingredientes','A parte de corpo ou carcaça, a arma usada para cortá-la ou matá-la e uma pequena mistura de urina, matéria fecal e sêmen.'),
 ('Processo','Cubra uma lâmina ou instrumento adequado com a mistura e separe o apêndice do corpo ou mate o animal. O animal não pode ser maior que um cão pequeno e não pode voar, mesmo que tenha asas. Massageie vitae no alvo para animá-lo como um servo fiel ao mestre.'),
 ('Sistema','Uma vitória cria um servo que espiona, segue ou intimida conforme as ordens do necromante. A mais de 100 metros do vampiro, fica inerte, voltando a despertar quando ele entra nesse alcance. Fora isso, permanece ativo por um número de noites igual aos sucessos obtidos. Uma vitória crítica o mantém ativo para sempre; uma falha total destrói todos os componentes. Muitos escalam paredes, saltam mesmo sem membros apropriados e se escondem bem, com variações conforme sua construção e tarefa. Não falam nem realizam ações que exijam pensamento profundo, mas comunicam telepaticamente imagens, cheiros ou sons isolados ao criador. O perfil abaixo limita a transmissão de imagens a uma por cena.'),
 ('Duração','Sucessos em noites; permanente numa vitória crítica. Fica inerte fora do alcance de 100 metros.')]),
 ('Compel Spirit','Compelir Espírito',2,[96],'Where the Veil Thins',[
 ('Descrição','Submete uma aparição à vontade do vampiro.'),
 ('Ingredientes','Uma âncora da aparição, vitae e um objeto ou ameaça suficiente para danificar a âncora.'),
 ('Processo','Esteja próximo da aparição, normalmente após Invocar Espírito. Lance um punhado de vitae na direção dela enquanto ameaça sua âncora com faca, martelo, arma, fogo ou palavras que o espírito acredite. Os dois disputam vontades. Uma vitória impõe serviço temporário; uma derrota deixa o vampiro debilitado e a âncora desaparece de sua mão.'),
 ('Parada e resistência','Determinação + Oblívio contra Determinação + Autocontrole da aparição, em vez da Dificuldade fixa habitual. Se não houver como ameaçar fisicamente a âncora, faça também Manipulação + Intimidação com Dificuldade igual à Determinação + Autocontrole da aparição.'),
 ('Sistema','Vença todos os testes exigidos. Cada sucesso no teste de Cerimônia permite uma tarefa moderadamente difícil, como espionar, pesquisar ou responder com sinceridade. Para cada dois sucessos, pode pedir uma tarefa difícil, como atacar alguém ou agir contra os valores da aparição. Uma vitória crítica permite exigir qualquer ação, que ela tentará cumprir da melhor maneira. O serviço dura até cumprir as ordens ou o fim da crônica; depois, a aparição volta ao Submundo com inimizade eterna pelo necromante.\n\nSe a aparição vencer qualquer disputa, o vampiro sofre a margem como dano superficial à Vitalidade, e ela volta ao Submundo. Atacar a aparição encerra a compulsão imediatamente. Danificar a âncora causa de um a três danos agravados à Força de Vontade da aparição, conforme sua importância, e a envia ao Submundo para ser atormentada e possivelmente transformada em um espectro assassino (Livro Básico inglês, p. 377).'),
 ('Duração','Até cumprir as ordens ou o fim da crônica; termina imediatamente se o vampiro atacar a aparição.')]),
 ('Host Spirit','Hospedar Espírito',3,[96,97],'Aura of Decay',[
 ('Descrição','Abre o corpo do vampiro à possessão de uma aparição. Ela pode oferecer aprimoramento físico, memórias que queira compartilhar e conselhos; também pode tomar o controle, o que alguns necromantes consideram uma bênção e outros um motivo para evitar a Cerimônia. A entrega voluntária do controle por uma noite subjuga a Besta e pode revelar capacidades que o vampiro não possui normalmente.'),
 ('Ingredientes','Um tributo que a aparição possa valorizar, um inseto parasita e dois dentes extraídos da boca do vampiro.'),
 ('Processo','Esteja próximo da aparição, normalmente após Invocar Espírito. Ofereça o tributo: álcool na sepultura, moedas enterradas ou mesmo a cabeça de um inimigo recém-morto são exemplos. Arranque dois dentes, normalmente com um alicate, morda o parasita com os dentes restantes e abra a boca. A aparição pode escolher entrar no corpo.'),
 ('Sistema','Vença o teste de Cerimônia. Se a aparição aceitar, permanece por um número de cenas igual aos sucessos obtidos. Enquanto ela estiver no corpo, o vampiro recebe dois dados em todos os testes de Atributos Físicos e +2 de Vitalidade. Ouve seus conselhos e pode substituir suas Habilidades pelas da aparição a critério do Narrador.\n\nA aparição pode tentar assumir o controle em vez de ser passageira. Se resistir, o vampiro disputa Determinação + Autocontrole contra a mesma parada da aparição. Uma vitória rejeita a influência; uma derrota entrega o controle até o fim da cena, mas ela não pode obrigá-lo a agir de forma autodestrutiva.'),
 ('Duração','Sucessos em cenas; o controle por uma aparição que venceu a resistência dura até o fim da cena.')]),
 ('Shambling Hordes','Hordas Cambaleantes',3,[97,98],'Aura of Decay',[
 ('Descrição','Reanima um grupo de mortos ambulantes agressivos para servir ao vampiro.'),
 ('Ingredientes','Um ou mais cadáveres mortais e um mortal vivo para um sacrifício recente.'),
 ('Processo','Mantenha os cadáveres separados da vítima a sacrificar. Mate a vítima e derrame seu sangue nos corpos preparados. Numa Cerimônia bem-sucedida, esses corpos se levantam; o mortal recém-sacrificado não é reanimado por esse ato.'),
 ('Sistema','Antes do teste de Cerimônia, resista ao Frenesi de Fome com Dificuldade 2 devido ao sangue derramado. Realize a Cerimônia; os Preceitos da crônica e o Narrador podem atribuir Máculas. Uma vitória anima uma quantidade de mortos agressivos igual ao nível de Oblívio ou ao número de corpos preparados, o que for menor. Eles não se decompõem e só entram em repouso por ordem do mestre, pela Morte Final dele ou quando destruídos.\n\nEntendem ordens moderadamente complexas: matar quem entrar, gemer ao ver alguém passar ou aterrorizar um bairro. Sem ordens, atacam todos ao redor exceto o mestre, ao contrário dos corpos do Dom da Falsa Vida. Para manter sua utilidade além da história atual, assegure-os com XP, como no Antecedente Lacaios: um ponto por cadáver leal. Caso contrário, podem ficar instáveis e indisciplinados (Livro Básico inglês, pp. 180 e 196).'),
 ('Duração','Até ordem de repouso, Morte Final do mestre ou destruição. Lealdade e utilidade além da história exigem investimento em XP conforme as regras de Vantagens temporárias.')]),
 ('Bind the Spirit','Prender o Espírito',4,[98],'Necrotic Plague',[
 ('Descrição','Acorrenta aparições a locais ou pessoas.'),
 ('Ingredientes','Uma âncora da aparição, o sacrifício de um mortal inocente e sal suficiente para cercar o imóvel ou indivíduo. Para assombrar uma pessoa, obtenha algo de seu corpo, como unhas, cabelo, sangue ou pele.'),
 ('Processo','A aparição já deve estar sob o controle do vampiro por Compelir Espírito. Mate um mortal inocente no local ou perto da pessoa a assombrar. Inocência é subjetiva; o texto sugere jovens, cuidadores e pessoas genuinamente piedosas. Misture vitae ao sal e pinte um círculo ao redor do alvo. Deixe a âncora no local ou na posse da pessoa.'),
 ('Sistema','O assassinato pode causar Máculas conforme os Preceitos e o Narrador. Faça o teste de Cerimônia sem resistência da aparição, pois ela já deve estar compelida. Ela fica presa ao local ou indivíduo por tempo indeterminado. Emoções intensas sentidas na vinculação afetam os moradores ou a pessoa: todos sofrem uma penalidade de dois dados em testes para resistir a sentir ou agir como a aparição. Um espírito furioso pode favorecer o Frenesi; um deprimido pode levar mortais a negligenciar o autocuidado. A aparição vinculada possui os mesmos poderes de um espectro (Livro Básico inglês, p. 377).\n\nO vínculo termina se o vampiro cancelar a Cerimônia, a âncora sair do local ou da posse da pessoa, o espírito for destruído ou o necromante atacá-lo. Muitas aparições ficam furiosas ou melancólicas, afetando a área. O método pode proteger refúgios ou assombrar inimigos.'),
 ('Duração','Indefinida, até uma das condições de encerramento. A exigência de controle por Compelir Espírito é uma condição de uso, além do poder pré-requisito para aprender.')]),
 ('Split the Veil','Romper o Véu',4,[98,99],'Necrotic Plague',[
 ('Descrição','Abre um rasgo no véu para a passagem de aparições. Elas podem assombrar locais e pessoas, seguir suas paixões e possuir mortais se tiverem poderes para isso. Algumas são gratas; outras atormentam quem abriu a passagem.'),
 ('Ingredientes','Uma lâmina já usada para cortar uma pessoa viva, giz ou carvão, um lençol de seda e um sacrifício humano.'),
 ('Processo','Pendure o lençol numa parede de um local com véu padrão, fino ou desgastado. Faça o sacrifício contra o tecido e, quando o sangue o cobrir, corte-o com a lâmina, alargando a passagem entre vivos e mortos.'),
 ('Sistema','O sacrifício pode causar Máculas conforme os Preceitos e o Narrador. Role a Cerimônia ao cortar o lençol e resista ao Frenesi de Fome, Dificuldade 2, devido ao sangue derramado. Cada sucesso reduz a densidade do véu em um nível, até Ausente. Se chegar a Ausente, aparições podem atravessar para o mundo físico durante o restante da sessão ou noite. Ao fim desse período, um véu Ausente volta a Desgastado e a passagem se fecha. Consulte a tabela de Onde o Véu se Afina.'),
 ('Duração','A passagem de um véu Ausente dura o restante da sessão ou noite. O texto não fixa outra duração para resultados que não cheguem a Ausente.')]),
 ('Lazarene Blessing','Bênção de Lázaro',5,[99,100],'Skuld Fulfilled',[
 ('Descrição','Devolve movimento e vida aparente a um corpo recém-morto, mas não devolve a pessoa como parentes e amigos a conheciam: uma aparição ocupa o corpo.'),
 ('Ingredientes','Um mortal para sacrifício, incenso, o coração de qualquer mamífero e prata em pó.'),
 ('Processo','Perfume o ambiente com incenso, realize o sacrifício e troque o coração da vítima pelo de outro mamífero. Não é necessário costurá-lo ou fazê-lo funcionar para que a Cerimônia tenha efeito. Derrame prata em pó nos olhos abertos do mortal moribundo ou morto e convide uma aparição a ocupar o corpo. Ela não pode ser forçada, embora muitas aceitem voltar a caminhar num corpo semivivo.'),
 ('Sistema','Matar o mortal pode causar Máculas conforme os Preceitos. Se o coração substituto veio de alguém assassinado pelo vampiro, essa morte também pode causar Máculas. A aparição deve estar presente durante o sacrifício. Uma vitória permite que ela entre no corpo recém-morto e o use como próprio.\n\nO corpo desperta com os ferimentos que o mataram; o coração substituto funciona independentemente de sua origem ou posição. A possessão cura um ponto de dano à Vitalidade; o restante se recupera com o tempo como na cura vampírica. Não ganha resistência especial ao dano além de Disciplinas que já possuísse em vida. Mantém os Atributos Físicos, Disciplinas se era carniçal e Vantagens do corpo em vida. Atributos Sociais e Mentais, Habilidades e qualquer valor de moralidade pertencem à aparição.'),
 ('Duração','Indefinida, até o corpo morrer novamente ou a aparição ser exorcizada.')]),
]
def english_body(title,numbers):
 text=''
 for n in numbers:
  content=json.loads((work/'pages/players-guide-v5'/f'{n:04}.json').read_text(encoding='utf-8'))['content']
  text+=(' ' if text and re.search(r'[\w,]$',text) and not content.startswith('#') else '\n\n')+content
 text=text.split('## '+title+'\n',1)[1]
 stop=r'\n## (?:'+ '|'.join(re.escape(item) for item in titles)+r'|Level \d|Blood Sorcery)\n'
 text=re.split(stop,text,1)[0]
 profile=profiles.get(title)
 if profile:text=text.split('## '+profile[0]+'\n',1)[0]
 # Delete artificial heading markers, not content. Known spell boundaries above
 # deliberately keep complete body/servant profiles rather than cutting at caps.
 text=re.sub(r'^##\s*$', '',text,flags=re.M)
 text=re.sub(r'^##\s+', '',text,flags=re.M)
 text=text.replace('untilrecently','until-recently').replace('selfdestructive','self-destructive').replace('Ceremony roll).','Ceremony roll.')
 parts=re.split(r'(?:^|\n\n)(Prerequisite Power|Ingredients|Process|System):\s*',text)
 result=[{'title':'Description','text':parts[0].strip()}]
 for i in range(1,len(parts),2):result.append({'title':'Requirements' if parts[i]=='Prerequisite Power' else parts[i],'text':parts[i+1].strip()})
 return result
for name,pt,level,numbers,prerequisite,ptrows in data:
 id=next(row['id'] for row in candidates if row['book']=='players-guide-v5' and row['name']==name)
 english=english_body(name.upper(),numbers)
 portuguese=[{'title':title,'text':body} for title,body in ptrows]
 required_name=power_names[prerequisite]
 next(section for section in english if section['title']=='Requirements')['text']=f'Oblivion {level}; prerequisite power: {prerequisite}.'
 english.append({'title':'Duration','text':durations[name]})
 portuguese.insert(1,{'title':'Requisitos','text':f'Oblívio {level}; poder {required_name} ({prerequisite}).'})
 for locale,values in [('pt-BR',portuguese),('en',english)]:
  en=locale=='en'
  values.append({'title':'Cost and preparation' if en else 'Custo e preparação','text':f'One Rouse Check; {level*5} minutes (five minutes per level). Unless a specific exception is stated, roll Resolve + Oblivion at Difficulty {level+1} (Ceremony level + 1).' if en else f'Um Teste de Sangue; {level*5} minutos (cinco minutos por nível). Salvo exceção específica, teste Determinação + Oblívio com Dificuldade {level+1} (nível da Cerimônia + 1).'})
  values.append({'title':'Learning and limits' if en else 'Aprendizado e limites','text':f'Learning costs {level*3} XP (Ceremony level × 3) and requires the prerequisite Oblivion power. During play, learning also requires a teacher who knows the Ceremony and at least {level*level} weeks (level squared). At character creation, one level 1 Ceremony may be chosen if its prerequisite power is known. Unless explicitly stated otherwise, beneficial Ceremonies affect only the caster. Ghouls and thin-bloods can gain temporary Oblivion powers but not Ceremonies.' if en else f'Aprender custa {level*3} XP (nível da Cerimônia × 3) e exige o poder pré-requisito de Oblívio. Durante o jogo, exige também um professor que conheça a Cerimônia e pelo menos {level*level} semanas (nível ao quadrado). Na criação, pode-se escolher uma Cerimônia de nível 1 se seu poder pré-requisito for conhecido. Salvo indicação explícita, Cerimônias benéficas só afetam o conjurador. Carniçais e sangues-ralos podem obter poderes temporários de Oblívio, mas não Cerimônias.'})
  if name.upper() in profiles:
   _,ptname,enname,stats,ptspecial,enspecial=profiles[name.upper()]
   table=('| Trait | Rating |\n| --- | --- |\n' if en else '| Característica | Valor |\n| --- | --- |\n')+'\n'.join('| '+row[1 if en else 0]+' | '+row[3 if en else 2]+' |' for row in stats)
   values.append({'title':enname if en else ptname,'text':table+'\n\n'+(enspecial if en else ptspecial)})
  if name=='Compel Spirit':values.append({'title':'Source wording' if en else 'Redação da fonte','text':'The process describes mental debilitation, while the System specifies Superficial Health damage on defeat. Both are retained; no additional Willpower damage is inferred.' if en else 'O Processo descreve debilitação mental, enquanto o Sistema determina dano superficial à Vitalidade na derrota. As duas redações são mantidas; não foi presumido dano adicional à Força de Vontade.'})
 pages=sorted(set(numbers+[93,94]));version={'id':id+'-players-guide-v5','book':'players-guide-v5','level':level,'sourceTitle':'Guia do Jogador V5, PDF pp. '+', '.join(map(str,pages)),'sourceLanguage':'en','pdfSha256':source['sha256'],'pages':[{'pdfPage':page,'printedPage':page-2} for page in pages],'requirements':{'disciplines':{'Oblívio':level},'prerequisites':[prerequisite],'characterTypes':['vampire']},'descriptions':{'pt-BR':portuguese,'en':english}}
 entry={'id':id,'kind':'ceremony','names':{'pt-BR':pt,'en':name},'aliases':[pt,name],'discipline':'Oblívio','level':level,'versions':[version]}
 (repo/'scripts/reviewed-content'/f'{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print('9 bilingual Ceremonies prepared, with all three complete servant profiles')
