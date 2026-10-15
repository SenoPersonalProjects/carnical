"""Pair the individual clan coterie Merits in the two supplied sourcebooks."""
import json,re,sys
from pathlib import Path
work=Path(sys.argv[1]);repo=Path(__file__).resolve().parent.parent
manifest=json.loads((work/'pages/manifest.json').read_text(encoding='utf-8'))
def book_text(book,first,last):
 text='';spans=[]
 for n in range(first,last+1):
  page=json.loads((work/'pages'/book/f'{n:04}.json').read_text(encoding='utf-8'));start=len(text);text+=page['content']+'\n\n';spans.append((start,len(text),n))
 return text,spans
pt,pt_pages=book_text('companion-v5',30,40);en,en_pages=book_text('players-guide-v5',181,191)
clans=r'^## (?:Banu Haqim|Brujah|Gangrel|Hecata|Lasombra|Malkavianos|Malkavian|O Ministério|The Ministry|Nosferatu|Ravnos|Salubri|Toreador|Tremere|Tzimisce|Ventrue)\s*$'
records=[
 ('call-to-purpose','Chamado do Dever','Call to Purpose','Banu Haqim',2),
 ('boot-and-rally','Beber para Curar a Ressaca','Boot and Rally','Brujah',1),
 ('pack-tactics','Táticas de Bando','Pack Tactics','Gangrel',3),
 ('ars-moriendi','Ars Moriendi','Ars Moriendi','Hecata',2),
 ('at-any-cost','A Todo Custo','At Any Cost','Lasombra',2),
 ('everything-is-connected','Tudo Está Conectado','Everything Is Connected','Malkaviano',3),
 ('discerning','Discernir','Discerning','Ministério',1),
 ('contextual-contact','Contato Contextual','Contextual Contact','Nosferatu',2),
 ('cryptolect','Criptoleto','Cryptolect','Ravnos',3),
 ('restraint','Contenção','Restraint','Salubri',3),
 ('all-access','Acesso Total','All Access','Toreador',1),
 ('multi-level-lorekeeping','Gestão de Conhecimentos Multinível','Multi-Level Lorekeeping','Tremere',2),
 ('old-world-hospitality','Hospitalidade do Velho Mundo','Old-World Hospitality','Tzimisce',2),
 ('kindred-legacies','Legados Vampíricos','Kindred Legacies','Ventrue',2),
]
def find_span(text,name,english):
 pattern=r'\s*(?:##\s*)?'.join(re.escape(part) for part in name.upper().split())
 if english:
  match=re.search(r'CLAN COTERIE MERIT:\s*(?:##\s*)?'+pattern+r'\s*([•●]+)',text)
  assert match,name;start=match.start();body_start=match.end()
 else:
  match=re.search(pattern,text);assert match,name;start=match.start()
  marker=re.search(r'\(Qualidade[\s\S]*?Clã\):\s*',text[match.end():]);assert marker,name;body_start=match.end()+marker.end()
 ends=[m.start() for m in re.finditer(clans,text,re.M) if m.start()>body_start]
 end=min(ends) if ends else len(text)
 body=text[body_start:end].strip();body=re.sub(r'^##\s*','',body,flags=re.M);body=re.sub(r'([\wÀ-ÿ])-\s+([\wÀ-ÿ])',r'\1\2',body)
 return body,start,end
def refs(spans,start,end,book):
 offset=2 if book=='players-guide-v5' else 0
 return [{'pdfPage':n,'printedPage':n-offset} for a,b,n in spans if b>start and a<end]
for slug,pt_name,en_name,clan,dots in records:
 en_body,en_start,en_end=find_span(en,en_name,True)
 if slug=='restraint':
  pt_body='Seja pela necessidade de manter a discrição ou por convicção moral, o autocontrole dos Salubri pode inspirar outros. Uma vez por sessão, o Salubri pode conter a Besta de outro integrante da coterie em sua presença, permitindo que esse aliado rerrole gratuitamente todos os seus dados de Fome — e somente todos eles — em um teste.'
 else:pt_body,pt_start,pt_end=find_span(pt,pt_name,False)
 guide_pt=pt_body;comp_en=en_body
 if slug=='discerning':
  guide_pt=guide_pt.replace('não deve expor nenhum esquema ou mistério profundo','não deve expor nenhum esquema ou mistério profundo, especialmente se a coterie não tiver conhecimento deles')
  comp_en=comp_en.replace(', especially if the coterie is unaware of them','')
 if slug=='multi-level-lorekeeping':
  guide_pt=guide_pt.replace('uma Vantagem de Ficha de Conhecimento pertencente','uma Vantagem de Ficha de Conhecimento (ou uma Vantagem de nível inferior da mesma Ficha) pertencente')
  guide_pt+=' Todas as demais limitações continuam válidas: por exemplo, uma Vantagem de uso único por história fica gasta pelo restante da história, independentemente de quem a usar.'
  comp_en=comp_en.replace(' (or a lower-dot Advantage from that same Loresheet)','')
  comp_en=comp_en.split(' All other limitations on the Advantage remain:',1)[0]
 if slug=='old-world-hospitality':
  guide_pt+=' Isso inclui refúgios compartilhados da coterie.'
  comp_en=comp_en.replace('Enter freely and of your own will. ','').replace(' This includes shared coterie havens.','')
 id='coterie-merit-'+slug;versions=[]
 for book,body_pt,body_en in [('players-guide-v5',guide_pt,en_body)]+([] if slug=='restraint' else [('companion-v5',pt_body,comp_en)]):
  references=refs(en_pages,en_start,en_end,book) if book=='players-guide-v5' else refs(pt_pages,pt_start,pt_end,book)
  # Include the general purchase and use rules, not just the individual effect.
  general_page={'pdfPage':181,'printedPage':179} if book=='players-guide-v5' else {'pdfPage':30,'printedPage':30}
  references=sorted({row['pdfPage']:row for row in [general_page,*references]}.values(),key=lambda row:row['pdfPage'])
  descriptions={}
  for language,body in [('pt-BR',body_pt),('en',body_en)]:
   english=language=='en'
   rule=('This clan coterie Merit can be purchased by a member of its clan at character creation. Its benefits can be activated or enjoyed by the coterie. In some cases, only one coterie member can use a Merit in a session, as specified by its effect.' if english else 'Esta Qualidade de Coterie e Clã pode ser adquirida por um integrante do clã indicado durante a criação da personagem. Seus benefícios podem ser ativados ou usufruídos pela coterie. Em alguns casos, apenas um integrante pode usar uma Qualidade por sessão, conforme o efeito descrito.')
   if book=='players-guide-v5':rule+=(' The coterie as a whole may also purchase it during coterie creation.' if english else 'A coterie como um todo também pode adquiri-la durante a criação da coterie.')
   descriptions[language]=[{'title':'Requirements' if english else 'Requisitos','text':clan+('. Character creation.' if english else '. Criação da personagem.')},{'title':'Cost' if english else 'Custo','text':str(dots)+(' Advantage dot(s).' if english else ' ponto(s) de Vantagens.')},{'title':'System' if english else 'Sistema','text':body},{'title':'Purchase and shared use' if english else 'Aquisição e uso compartilhado','text':rule}]
  source=next(row for row in manifest if row['id']==book)
  versions.append({'id':id+'-'+book,'book':book,'sourceTitle':('Player’s Guide V5' if book=='players-guide-v5' else 'Companion V5')+', pp. '+', '.join(str(row['printedPage']) for row in references),'sourceLanguage':'en' if book=='players-guide-v5' else 'pt-BR','pdfSha256':source['sha256'],'pages':references,'level':dots,'requirements':{'clans':[clan],'creationOnly':True},'descriptions':descriptions})
 entry={'id':id,'kind':'merit','names':{'pt-BR':pt_name,'en':en_name},'aliases':[pt_name,en_name],'level':dots,'versions':versions}
 (repo/'scripts/reviewed-content'/f'{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(records)} clan coterie Merits compiled, including the Guide-only Salubri option')
