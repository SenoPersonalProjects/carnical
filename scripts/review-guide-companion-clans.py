"""Guide clan mechanics visually checked on PDF43–44,49–50,55–56."""
import copy,json,sys
from pathlib import Path
repo=Path(__file__).resolve().parent.parent;work=Path(sys.argv[1])
source=next(row for row in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if row['id']=='players-guide-v5')
for slug,numbers in [('ravnos',[43,44]),('salubri',[49,50]),('tzimisce',[55,56])]:
    file=repo/'scripts/reviewed-content'/f'clan-{slug}.json'
    entry=json.loads(file.read_text(encoding='utf-8'))
    version=copy.deepcopy(next(row for row in entry['versions'] if row['book']=='companion-v5'))
    version.update(id=f'clan-{slug}-players-guide-v5',book=source['id'],sourceTitle=f'Player’s Guide V5, pp. {numbers[0]-2}–{numbers[-1]-2}',sourceLanguage='en',pdfSha256=source['sha256'],pages=[{'pdfPage':n,'printedPage':n-2} for n in numbers])
    for locale,sections in version['descriptions'].items():
        if slug=='ravnos':
            bane=next(section for section in sections if section['title'] in ['Perdição','Bane'])
            bane['text']+= '\n\nA Perdição também se aplica durante o Torpor.' if locale=='pt-BR' else '\n\nThe Bane also applies while the Ravnos is in torpor.'
        if slug=='salubri':
            blood=next(section for section in sections if section['title'] in ['Perdição: Sangue cobiçado','Bane: coveted Blood'])
            blood['text']=('Quando um vampiro que não seja Salubri bebe Sangue Salubri suficiente para saciar pelo menos um nível de Fome, faz um teste de Frenesi de Fome com Dificuldade 2 + a Gravidade da Perdição do Salubri. Para Banu Haqim, a Dificuldade é 3 + a Gravidade da Perdição do Salubri. Se falhar, continua bebendo, podendo precisar ser fisicamente impedido.' if locale=='pt-BR' else 'When a non-Salubri drinks enough Salubri Blood to slake at least one Hunger, they test for hunger frenzy at Difficulty 2 + the Salubri’s Bane Severity. For Banu Haqim, Difficulty is 3 + the Salubri’s Bane Severity. On a failure, they continue drinking and may need to be physically restrained.')
            eye=next(section for section in sections if section['title'] in ['Perdição: terceiro olho','Bane: third eye'])
            eye['text']=('Todo Salubri possui um terceiro olho, cuja aparência pode incluir pupilas verticais e serpentinas ou manchas oculares semelhantes às de vermes. Pode ser coberto fisicamente com lenço ou capuz. Nenhum poder sobrenatural pode ocultá-lo, exceto os que escondem o Salubri inteiro.\n\nSempre que ativa um poder de Disciplina, o olho chora Sangue. A intensidade acompanha o nível do poder, desde poucas lágrimas até um fluxo torrencial. Esse Sangue provoca um teste de Frenesi de Fome em vampiros próximos com Fome 4 ou maior.' if locale=='pt-BR' else 'Every Salubri has a third eye, which may have vertical serpentine pupils or worm-like eyespots. A scarf or hood can physically cover it. No supernatural power can conceal it except powers that hide the entire Salubri.\n\nWhenever the Salubri activates a Discipline power, the eye weeps Blood. The intensity follows the power’s level, from welling tears to a torrent. This Blood prompts a hunger frenzy test in nearby vampires at Hunger 4 or higher.')
    entry['versions']=[row for row in entry['versions'] if row['id']!=version['id']]+[version]
    file.write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print('Three Guide clan versions added; Companion versions preserved, including Salubri concealment differences.')
