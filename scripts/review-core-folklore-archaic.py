"""Core PDF182/184: age restrictions and explicit folklore choices."""
import json,sys
from pathlib import Path
repo=Path(__file__).resolve().parent.parent;work=Path(sys.argv[1]);out=repo/'scripts/reviewed-content'
source=next(row for row in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if row['id']=='core-v5')
def add(slug,pt,en,level,page,pt_text,en_text,options=(),repeat=False,age=False):
 id='core-trait-'+slug;versions=[]
 for suffix,label,label_en,system,system_en in options or [('',pt,en,pt_text,en_text)]:
  requirements={}
  if repeat:requirements['repeatableDifferentChoices']=True
  if age:requirements['ancillaOrOlder']=True
  descriptions={locale:[{'title':'Sistema' if locale=='pt-BR' else 'System','text':text},{'title':'Custo' if locale=='pt-BR' else 'Cost','text':f'{level} '+('ponto(s) de Defeito.' if locale=='pt-BR' else 'Flaw dot(s).')}] for locale,text in [('pt-BR',system),('en',system_en)]}
  if options:
   descriptions['pt-BR'].append({'title':'Escolha','text':pt_text});descriptions['en'].append({'title':'Choice','text':en_text})
  if age:
   descriptions['pt-BR'].append({'title':'Requisitos','text':'Somente ancillae ou vampiros mais velhos. Para categoria Personalizada, confirme com o Narrador que a idade corresponde a essa exigência. Não modifica Convicções nem Habilidades já salvas automaticamente.'});descriptions['en'].append({'title':'Requirements','text':'Only ancillae or older vampires. For a Custom category, confirm with the Storyteller that the age meets this requirement. Does not automatically change saved Convictions or Skills.'})
  version={'id':id+'-core-v5'+('-'+suffix if suffix else ''),'book':'core-v5','level':level,'sourceTitle':f'Livro Básico V5, p. {page-2}','sourceLanguage':'pt-BR','pdfSha256':source['sha256'],'pages':[{'pdfPage':page,'printedPage':page-2}],'descriptions':descriptions,'requirements':requirements}
  if options:version['names']={'pt-BR':pt+' — '+label,'en':en+' — '+label_en}
  versions.append(version)
 entry={'id':id,'kind':'flaw','level':level,'names':{'pt-BR':pt,'en':en},'aliases':[pt,en]+[name for version in versions for name in version.get('names',{}).values()],'versions':versions}
 (out/(id+'.json')).write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
add('archaic','Arcaico','Archaic',2,182,
'Não se adaptou ao presente ou passou muito tempo em Torpor. Não pode usar computadores nem celulares e sua Tecnologia permanece em 0. O Narrador pode aplicar −1 dado em outras paradas envolvendo tecnologia muito moderna.',
'Failed to adapt to the present or spent a long time in Torpor. Cannot use computers or mobile phones and Technology remains 0. The Storyteller may apply −1 die to other pools involving very modern technology.',age=True)
add('living-in-the-past','Vivendo no Passado','Living in the Past',1,182,
'Não compreende ou recusa a mentalidade moderna. Uma ou mais Convicções são seriamente antiquadas. Elas ainda sustentam a Humanidade, mas causam repulsa: sofre −1 dado em testes Sociais envolvendo essas crenças, exceto com vampiros de sua idade ou mais velhos que admirem sua virtude inabalável.',
'Does not understand or rejects modern thinking. One or more Convictions are seriously outdated. They still support Humanity but offend others: suffer −1 die on Social tests involving these beliefs, except with vampires of the same age or older who admire such unwavering virtue.',age=True)
add('folkloric-bane','Perdição Folclórica','Folkloric Bane',1,184,
'Selecione a Perdição no seletor da fonte. A escolha causa dano Agravado conforme a regra específica abaixo. O texto “pode incluir” permite ao Narrador avaliar outras Perdições; as três opções impressas estão disponíveis aqui.',
'Select the Bane using the source selector. It causes Aggravated damage under the specific rule below. The wording “may include” allows the Storyteller to consider other Banes; the three printed options are available here.',options=[
('uv','Luz ultravioleta','Ultraviolet light','Luz ultravioleta causa dano Agravado como luz solar direta.','Ultraviolet light causes Aggravated damage as direct sunlight.'),
('silver','Prata','Silver','Armas de prata ou banhadas em prata causam dano Agravado igual ao dano da arma. Simplesmente tocar uma moeda ou um talher de prata causa 1 dano Agravado.','Silver or silver-plated weapons cause Aggravated damage equal to the weapon’s damage. Merely touching a silver coin or utensil causes 1 Aggravated damage.'),
('holy-water','Água benta','Holy water','Água benta causa dano Agravado como fogo.','Holy water causes Aggravated damage as fire.')])
add('folkloric-block','Tabu Folclórico','Folkloric Block',1,184,
'Ao confrontar o tabu escolhido, precisa se afastar ou gastar 1 Força de Vontade para superá-lo. Cada tabu diferente conta como um Defeito separado de 1 ponto. Pode adicionar escolhas diferentes deste item; não repita o mesmo tabu. Outras opções exigem acordo com o Narrador.',
'When confronted with the chosen block, must retreat or spend 1 Willpower to overcome it. Each different block counts as a separate one-dot Flaw. May add different choices of this item; do not repeat the same block. Other options require Storyteller agreement.',options=[
(slug,pt,en,'Ao confrontar '+condition+', precisa se afastar ou gastar 1 Força de Vontade para superar o tabu.','When confronted with '+condition_en+', must retreat or spend 1 Willpower to overcome the block.') for slug,pt,en,condition,condition_en in [
('holy-symbols','Símbolos sagrados','Holy symbols','símbolos sagrados mostrados por qualquer crente, mesmo sem Fé Verdadeira','holy symbols displayed by any believer, even without True Faith'),
('running-water','Água corrente','Running water','uma travessia de água corrente visível; o livro alerta que isso pode ser impraticável em cidades com muitos canais','a crossing of visible running water; the book warns this may be impractical in cities with many waterways'),
('uninvited','Casa sem convite','Uninvited homes','a entrada em uma casa sem convite do proprietário','entry to a home without an invitation from its owner'),
('white-animal','Animal branco','White animal','um animal branco','a white animal'),
('garlic','Alho','Garlic','alho','garlic'),
('wild-roses','Rosas selvagens','Wild roses','rosas selvagens','wild roses'),
('seeds','Sementes não contadas','Uncounted seeds','sementes espalhadas que você ainda não contou','scattered seeds you have not counted')]],repeat=True)
print('Four Core Flaws: two age-restricted traits, three Bane choices and seven independently rated Folkloric Blocks.')
