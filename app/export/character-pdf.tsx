import {catalogPurchaseName} from "../content/catalog-item-xp";
import React from "react";
import { Document, Page, Text, View, Svg, Circle, Rect, Line, Link as PdfLink, StyleSheet, pdf } from "@react-pdf/renderer";
import { bloodBenefits } from "../play/blood";
import { humanityTrack } from "../play/dice";
import { POWER_CATALOG } from "../game-rules";
import {resolveContent,CONTENT_INDEX} from "../content/resolve";
import {hasCreationTrait,indexedItem} from "../content/item-eligibility";
import {powerForSources} from "../content/power-eligibility";
import {normalizeActiveSourcebooks} from "../creation-sources";
import {sourcebookLabel,SOURCEBOOKS} from "../sourcebooks";
import {selectedClanBane,decayCreationAdjustment} from "../content/clan-banes";
import type { Locale } from "../preferences";
import type { ExportRule, ExportSnapshot } from "./character-snapshot";
import {parseReferenceMarkdown} from "../content/reference-markdown";

const labels: Record<string, string> = { Identidade:"Identity", Conceito:"Concept", Clã:"Clan", Senhor:"Sire", "Nome mortal":"Mortal name", "Ano do Abraço":"Embrace year", "Idade real":"Actual age", "Idade aparente":"Apparent age", Nascimento:"Birth", Morte:"Death", "Categoria de criação":"Creation category", Geração:"Generation", Crônica:"Chronicle", Ressonância:"Resonance", Atributos:"Attributes", Habilidades:"Skills", Disciplinas:"Disciplines", Especializações:"Specialties", Vantagens:"Advantages", Defeitos:"Flaws", Predador:"Predator", "Escolhas do Predador":"Predator choices", Ambição:"Ambition", Desejo:"Desire", "Fraqueza do Clã":"Clan Bane", "Compulsão do Clã":"Clan Compulsion", "Pilares e Convicções":"Touchstones and Convictions", Pilar:"Touchstone", Convicção:"Conviction", Vitalidade:"Health", Vontade:"Willpower", Humanidade:"Humanity", Máculas:"Stains", Fome:"Hunger", Potência:"Potency", "Estado da sessão":"Session state", Noite:"Night", Turno:"Turn", "XP total":"Total XP", "XP gasto":"Spent XP", "XP disponível":"Available XP", "Regras da crônica":"Chronicle rules", "Preceitos da crônica":"Chronicle tenets", "Fontes habilitadas":"Enabled sources", "Compras com XP":"XP purchases", Aparência:"Appearance", "Traços distintivos":"Distinguishing traits", História:"History", Notas:"Notes", "Vantagens livres":"Free-form advantages", "Defeitos livres":"Free-form flaws", "Referência de sessão":"Session reference", "Regras dos itens":"Item rules", "Sem nome":"Unnamed", "Não preenchido":"Not filled in", Força:"Strength", Destreza:"Dexterity", Vigor:"Stamina", Carisma:"Charisma", Manipulação:"Manipulation", Autocontrole:"Composure", Inteligência:"Intelligence", Raciocínio:"Wits", Determinação:"Resolve", Atletismo:"Athletics", Briga:"Brawl", Furtividade:"Stealth", "Armas Brancas":"Melee", "Armas de Fogo":"Firearms", Condução:"Drive", Ladroagem:"Larceny", Ofícios:"Craft", Sobrevivência:"Survival", "Empatia com Animais":"Animal Ken", Etiqueta:"Etiquette", Intimidação:"Intimidation", Liderança:"Leadership", Manha:"Streetwise", Performance:"Performance", Persuasão:"Persuasion", Sagacidade:"Insight", Subterfúgio:"Subterfuge", Ciência:"Science", Erudição:"Academics", Finanças:"Finance", Investigação:"Investigation", Medicina:"Medicine", Ocultismo:"Occult", Percepção:"Awareness", Política:"Politics", Tecnologia:"Technology", Celeridade:"Celerity", PotênciaDisciplina:"Potence", Presença:"Presence", Proteanismo:"Protean", Auspícios:"Auspex", Dominação:"Dominate", Ofuscação:"Obfuscate", Oblívio:"Oblivion", "Feitiçaria de Sangue":"Blood Sorcery", Animalismo:"Animalism", Fortitude:"Fortitude" };
const styles = StyleSheet.create({ page:{padding:32,paddingTop:36,paddingBottom:42,fontFamily:"Helvetica",fontSize:9,color:"#202020",backgroundColor:"#fff"}, header:{borderBottomWidth:2,borderBottomColor:"#9f1825",paddingBottom:10,marginBottom:14}, brand:{fontFamily:"Times-Roman",fontSize:26,lineHeight:1.2,color:"#9f1825",letterSpacing:2}, name:{fontSize:17,lineHeight:1.2,marginTop:7}, meta:{fontSize:8,color:"#555"}, title:{fontFamily:"Helvetica-Bold",fontSize:12,color:"#9f1825",marginTop:13,marginBottom:6}, row:{flexDirection:"row",borderBottomWidth:0.3,borderBottomColor:"#ccc",paddingVertical:4}, key:{width:"43%",color:"#555",paddingRight:8}, value:{width:"57%"}, columns:{flexDirection:"row",gap:18}, column:{width:"48%"}, paragraph:{marginBottom:6}, item:{marginBottom:9}, sub:{fontFamily:"Helvetica-Bold",fontSize:10,marginBottom:4}, footer:{position:"absolute",bottom:22,left:32,fontSize:8,color:"#666"}, track:{marginBottom:6}, trackLabel:{fontFamily:"Helvetica-Bold",marginBottom:3}, notice:{borderLeftWidth:2,borderLeftColor:"#9f1825",paddingLeft:7,marginVertical:6}, rules:{fontSize:8.5}, ruleTitle:{fontFamily:"Helvetica-Bold",fontSize:12,marginTop:12,marginBottom:5}, sectionTitle:{fontFamily:"Helvetica-Bold",marginTop:5,marginBottom:3} });

function Markers({ value, max=5, superficial=0, aggravated=0, stains=0, square=false }: { value:number;max?:number;superficial?:number;aggravated?:number;stains?:number;square?:boolean }) {
  const count = Math.max(0,Math.min(20,Math.trunc(max)));
  return <Svg width={count*14} height={13} viewBox={`0 0 ${count*14} 13`}>{Array.from({length:count},(_,i)=>{
    const x=i*14+2,filled=i<value,damage=i<aggravated?2:i<aggravated+superficial?1:0,stain=i>=count-stains&&i>=value;
    return <React.Fragment key={i}>{square?<Rect x={x} y={2} width={9} height={9} stroke="#222" strokeWidth={0.8} fill={filled?"#222":"#fff"}/>:<Circle cx={x+4.5} cy={6.5} r={4.5} stroke="#222" strokeWidth={0.8} fill={filled?"#222":"#fff"}/>}{(damage>0||stain)?<Line x1={x+1} y1={10} x2={x+8} y2={3} stroke="#222" strokeWidth={1}/>:null}{(damage===2||stain)?<Line x1={x+1} y1={3} x2={x+8} y2={10} stroke="#222" strokeWidth={1}/>:null}</React.Fragment>;
  })}</Svg>;
}

export function CharacterPdfDocument({ snapshot:s, locale, rules=[] }: {snapshot:ExportSnapshot;locale:Locale;rules?:ExportRule[]}) {
  const en=locale==="en", t=(key:string)=>en?(labels[key]||key):key;
  const alternateBane=s.customClan?undefined:selectedClanBane(s.clan,s.chronicleRules,s.flaws);
  const additionalBane=!!alternateBane&&!selectedClanBane(s.clan,s.chronicleRules);
  const decayModeLabel=s.chronicleRules.decayXpMode==="per_dot"?(en?"per acquired dot":"por ponto adquirido"):s.chronicleRules.decayXpMode==="per_purchase"?(en?"once per purchase":"uma vez por compra"):(en?"pending":"pendente");
  const itemName=(name:string,discipline?:string)=>resolveContent(name,{discipline})?.names[locale]||name;
  const chronicleLabels:Record<string,string>=en?{customTargets:"Custom creation budgets",meritPoints:"Advantage dots",flawPoints:"Flaw dots",disciplinePoints:"Discipline dots",generationOverride:"Generation exception",exemptStainPenaltyOnFrenzy:"Frenzy exempt from Stain penalty",notes:"Storyteller notes"}:{customTargets:"Orçamentos personalizados de criação",meritPoints:"Pontos de Vantagens",flawPoints:"Pontos de Defeitos",disciplinePoints:"Pontos de Disciplinas",generationOverride:"Exceção de Geração",exemptStainPenaltyOnFrenzy:"Frenesi isento da penalidade por Máculas",notes:"Anotações do mestre"};
  const track=humanityTrack(s.humanity,s.stains), benefits=bloodBenefits(s.potency);
  const row=(key:string,value:React.ReactNode)=>typeof value==="string"&&value.length>300?<View key={key} style={styles.item}><Text style={styles.meta} minPresenceAhead={20}>{t(key)}</Text>{paragraphs(value)}</View>:<View style={styles.row} key={key} wrap={false}><Text style={styles.key}>{t(key)}</Text><View style={styles.value}>{typeof value==="string"||typeof value==="number"?<Text>{String(value)||t("Não preenchido")}</Text>:value}</View></View>;
  const heading=(title:string)=><Text style={styles.title} minPresenceAhead={28}>{t(title)}</Text>;
  const paragraphs=(text:string)=>text.split(/\n\s*\n/).map((p,i)=><Text key={i} style={[styles.paragraph,{lineHeight:1.35}]} orphans={2} widows={2}>{p.replace(/^#{1,6}\s*/gm,"").replace(/\*\*([^*]+)\*\*/g,"$1").replaceAll("−","-")}</Text>);
  const traits=(title:string,values:Record<string,number>)=><View>{heading(title)}{Object.entries(values).map(([name,value])=>row(name,<View style={{flexDirection:"row",gap:5}}><Markers value={value}/><Text>{value}</Text></View>))}</View>;
  const savedItemName=(item:ExportSnapshot["merits"][number])=>{const {entry,version}=indexedItem(item);return (version?.names?.[locale]||entry?.names[locale]||item.name)+(item.instanceName?` — ${item.instanceName}`:"")};
  const meritList=(title:string,items:typeof s.merits)=><View>{heading(title)}{items.length?items.map((item,i)=><View key={i} style={styles.item}><View wrap={false}><Text style={styles.sub}>{savedItemName(item)}{indexedItem(item).version?.requirements?.selectionGroup?` · ${en?"special choice":"escolha especial"}`:` (${item.dots})`}</Text>{!indexedItem(item).version?.requirements?.selectionGroup&&<Markers value={item.dots} max={Math.max(5,item.dots)}/>}</View>{item.source&&<Text style={styles.meta}>{sourcebookLabel(item.source,locale)}</Text>}{item.notes&&paragraphs(item.notes)}</View>):<Text>—</Text>}</View>;
  const identityLabels:Record<string,string>={sire:"Senhor",mortalName:"Nome mortal",embraceYear:"Ano do Abraço",trueAge:"Idade real",apparentAge:"Idade aparente",birthDate:"Nascimento",deathDate:"Morte",ageCategory:"Categoria de criação",generation:"Geração",chronicle:"Crônica",resonance:"Ressonância"};
  return <Document title={`Carniçal — ${s.name}`} author="Carniçal" language={en?"en":"pt-BR"}>
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}><Text style={styles.brand}>CARNIÇAL</Text><Text style={styles.name}>{s.name||t("Sem nome")}</Text></View>
      {heading("Identidade")}{row("Conceito",s.concept)}{row("Clã",s.clan)}{Object.entries(s.identity).filter(([,v])=>v).map(([k,v])=>row(identityLabels[k],v))}{row("Potência",s.potency)}
      {heading("Estado da sessão")}
      {[{name:"Vitalidade",max:s.healthMax,superficial:s.healthSuperficial,aggravated:s.healthAggravated},{name:"Vontade",max:s.willpowerMax,superficial:s.willpowerSuperficial,aggravated:s.willpowerAggravated}].map(item=><View key={item.name} style={styles.track} wrap={false}><Text style={styles.trackLabel}>{t(item.name)} {item.max} · {en?"Superficial":"Superficial"} {item.superficial} · {en?"Aggravated":"Agravado"} {item.aggravated}</Text><Markers value={0} max={item.max} square superficial={item.superficial} aggravated={item.aggravated}/></View>)}
      <View style={styles.track} wrap={false}><Text style={styles.trackLabel}>{t("Humanidade")} {s.humanity} · {t("Máculas")} {s.stains}</Text><Markers value={s.humanity} max={10} square stains={Math.min(s.stains,10-s.humanity)}/><Text style={styles.meta}>{en?"Solid: Humanity · X: Stain · /: superficial damage · X: aggravated damage":"Cheio: Humanidade · X: Mácula · /: dano superficial · X: dano agravado"}</Text></View>
      {row("Fome",<Markers value={s.hunger} max={5} square/>)}{row("Noite",s.session.night+1)}{row("Turno",s.session.turn+1)}
      <Text style={styles.meta}>{en?"Last superficial mend turn":"Último turno de recuperação superficial"}: {s.session.lastMendTurn===null?"—":s.session.lastMendTurn+1}. {en?"Last aggravated recovery night":"Última noite de recuperação agravada"}: {s.session.lastAggravatedNight===null?"—":s.session.lastAggravatedNight+1}.</Text>
      <Text style={styles.meta}>{en?"Aggravated damage nights":"Noites dos danos agravados"}: {s.session.aggravatedNights.map(n=>n+1).join(", ")||"—"}.</Text>
      {(s.impaired||track.impaired)&&<Text style={styles.notice}>{en?"Impaired by Stains: -2 dice. Lasts until Remorse or voluntary Humanity loss.":"Debilitado pelas Máculas: -2 dados. Mantido até Remorso ou perda voluntária de Humanidade."}</Text>}
      {s.session.torpor&&<Text style={styles.notice}>Torpor</Text>}{s.humanity===0&&<Text style={styles.notice}>{en?"Humanity 0: character under Storyteller control.":"Humanidade 0: personagem sob controle do Narrador."}</Text>}
      <View style={styles.columns}><View style={styles.column}>{traits("Atributos",s.attributes)}</View><View style={styles.column}>{traits("Habilidades",s.skills)}</View></View>
      {heading("Especializações")}{s.specialties.map((item,i)=><Text key={i} style={styles.paragraph}>{t(item.skill)}: {item.name}{item.source?` (${item.source})`:""}</Text>)}
      {heading("Disciplinas")}{Object.entries(s.disciplines).map(([name,level])=><View key={name} style={styles.item}><View wrap={false}><Text style={styles.sub}>{name==="Potência"&&en?"Potence":t(name)} ({level})</Text><Markers value={level}/></View>{(s.powers[name]||[]).map((power,i)=><Text key={i}>• {itemName(power,name)}</Text>)}</View>)}
      {heading("Predador")}{paragraphs(itemName(s.predator)||"—")}{s.predatorDiscipline&&paragraphs(t(s.predatorDiscipline))}{s.predatorSpecialty&&paragraphs(s.predatorSpecialty)}
      {Object.keys(s.predatorResolutions).length>0&&heading("Escolhas do Predador")}{Object.entries(s.predatorResolutions).map(([key,value])=><Text key={key} style={styles.paragraph}>{key}: {value}{s.predatorNotes[key]?` — ${s.predatorNotes[key]}`:""}</Text>)}
      {meritList("Vantagens",s.merits)}{meritList("Defeitos",s.flaws)}
      {heading("Fraqueza do Clã")}{alternateBane&&paragraphs((additionalBane?(en?"Additional Bane: ":"Perdição adicional: "):(en?"Chronicle Bane: ":"Perdição da crônica: "))+alternateBane!.names[locale]+(additionalBane?(en?". Added to the standard Bane; full rules in the appendix.":". Acumula-se à padrão; regras completas no anexo."):(en?". Replaces the standard Bane; full rules in the appendix.":". Substitui a padrão; regras completas no anexo.")))}{paragraphs(s.bane?(alternateBane?(en?"Personal notes: ":"Anotações pessoais: "):"")+s.bane:"—")}{heading("Compulsão do Clã")}{paragraphs(s.compulsion||"—")}
      {alternateBane?.id==="bane-hecata"&&paragraphs(en?`Decay creation: ${s.hecataDecayBuyoff?"paid":"additional Flaws"}; Background dots spent: ${decayCreationAdjustment(s.clan,s.potency,s.chronicleRules,s.hecataDecayBuyoff,s.purchases,s.flaws).backgroundCost}. XP interpretation: ${decayModeLabel}.`:`Decadência na criação: ${s.hecataDecayBuyoff?"compensada":"Defeitos extras"}; pontos de Antecedentes pagos: ${decayCreationAdjustment(s.clan,s.potency,s.chronicleRules,s.hecataDecayBuyoff,s.purchases,s.flaws).backgroundCost}. Interpretação de XP: ${decayModeLabel}.`)}{heading("Pilares e Convicções")}{s.anchors.map((anchor,i)=><View key={i} style={styles.item}><Text style={styles.sub} minPresenceAhead={20}>{t("Pilar")} {i+1}</Text>{paragraphs(anchor.touchstone||"—")}<Text style={styles.sub} minPresenceAhead={20}>{t("Convicção")}</Text>{paragraphs(anchor.conviction||"—")}</View>)}
      {heading("Ambição")}{paragraphs(s.ambition||"—")}{heading("Desejo")}{paragraphs(s.desire||"—")}
      {heading("Compras com XP")}{row("XP total",s.xpTotal)}{row("XP gasto",s.xpSpent)}{row("XP disponível",s.xpTotal-s.xpSpent)}
      {s.purchases.map((purchase,i)=><Text key={i} style={styles.paragraph}>{catalogPurchaseName(purchase,locale)} · {purchase.from} → {purchase.to} · {purchase.cost} XP</Text>)}
      {heading("Regras da crônica")}<Text style={styles.paragraph}>{en?"XP calculation":"Cálculo de XP"}: {s.xpCostMode==="current_level"?en?"current level × factor (minimum level 1)":"nível atual × fator (mínimo 1)":en?"new level × factor":"novo nível × fator"}.</Text>
      {Object.entries(s.chronicleRules).filter(([key])=>key in chronicleLabels).map(([key,value])=><Text key={key} style={styles.paragraph}>{chronicleLabels[key]}: {typeof value==="boolean"?(value?(en?"Yes":"Sim"):(en?"No":"Não")):String(value)}</Text>)}
      {s.tenets&&<>{heading("Preceitos da crônica")}{paragraphs(s.tenets)}</>}{s.sources.length>0&&<>{heading("Fontes habilitadas")}{paragraphs(s.sources.map(source=>sourcebookLabel(source,locale)).join(", "))}</>}
      {Object.entries(s.prose).filter(([,value])=>value).map(([key,value])=><View key={key}>{heading(({appearance:"Aparência",distinguishingTraits:"Traços distintivos",history:"História",notes:"Notas",advantages:"Vantagens livres",flaws:"Defeitos livres"} as Record<string,string>)[key])}{paragraphs(value)}</View>)}
      {heading("Referência de sessão")}
      {hasCreationTrait([...s.merits,...s.flaws],"thin-blood-mortal-frailty")&&paragraphs(en?"Mortal Frailty replaces vampire mending with mortal healing. Do not use the Rouse-based mending reference below; the full mortal healing rules are included in the Flaw appendix.":"Fragilidade Mortal substitui a recuperação vampírica pela cura mortal. Não use a recuperação com Sangue da referência abaixo; as regras completas de cura mortal estão no anexo do Defeito.")}
      {s.clan==="Sangue-Ralo"&&!hasCreationTrait([...s.merits,...s.flaws],"thin-blood-bestial-temper")&&paragraphs(en?"Thin-blood: frenzy resistance applies only when supernatural means provoke frenzy. Natural frenzy does not apply without Bestial Temper.":"Sangue-Ralo: a resistência ao Frenesi só se aplica quando ele é provocado por meios sobrenaturais. Frenesi natural não se aplica sem Temperamento Bestial.")}
      {paragraphs(en?`Blood Surge: +${benefits.surge} dice for one Attribute roll. One Rouse Check; Hunger increases after the effect. No voluntary use at Hunger 5.\n\nMending: ${benefits.mend} superficial Health per Rouse Check, once per turn. Aggravated: one point per night, from the night following the damage; three Rouse Checks in addition to awakening. Required checks that would raise Hunger above 5 cause Torpor.\n\nRemorse: max(1, 10 - Humanity - Stains), difficulty 1, no Hunger dice. Success preserves Humanity; failure loses 1. Both clear all Stains.\n\nFrenzy resistance: undamaged Willpower + floor(Humanity / 3), including -2 for Stain impairment unless the chronicle exempts it. No Hunger dice, Willpower reroll or Blood Surge. Success takes one turn; critical success allows immediate action.\n\nCore Rulebook pp. 211, 218–219, 239–240; corrected Renegade Blood Potency table.`:`Impulso: +${benefits.surge} dados em uma rolagem com Atributo. Um teste de Sangue; a Fome aumenta depois do efeito. Sem uso voluntário em Fome 5.\n\nRecuperação: ${benefits.mend} dano superficial de Vitalidade por teste de Sangue, uma vez por turno. Agravado: um ponto por noite, a partir da noite seguinte ao dano; três testes de Sangue além do despertar. Testes obrigatórios que levariam a Fome acima de 5 causam Torpor.\n\nRemorso: máx(1, 10 - Humanidade - Máculas), dificuldade 1, sem Fome. Sucesso preserva Humanidade; falha perde 1. Ambos apagam todas as Máculas.\n\nFrenesi: Vontade sem dano + piso(Humanidade / 3), incluindo -2 pela debilitação por Máculas, salvo dispensa da crônica. Sem Fome, rerrolagem por Vontade ou Impulso. Sucesso exige um turno; crítico permite agir imediatamente.\n\nLivro Básico pp. 211, 218–219, 239–240; tabela de Potência corrigida da Renegade.`)}
      {rules.length>0&&heading("Regras dos itens")}{rules.map((rule,index)=><View key={`${rule.id}:${index}`} style={styles.rules}><Text style={styles.ruleTitle} minPresenceAhead={70}>{rule.name}</Text><Text style={styles.meta}>{rule.source}</Text>{rule.sections.map((section,i)=><View key={i}><Text style={styles.sectionTitle} minPresenceAhead={30}>{section.title}</Text><RuleBody text={section.text}/></View>)}</View>)}
      <Text fixed style={styles.footer} render={({pageNumber,totalPages})=>`Carniçal · ${s.name||t("Sem nome")} · ${pageNumber} / ${totalPages}`}/>
    </Page>
  </Document>;
}

function RuleBody({text}:{text:string}){
 const plain=(value:string)=>value.replace(/\*\*([^*]+)\*\*/g,"$1").replaceAll("−","-");
 const inline=(value:string)=>plain(value).split(/(\[[^\]]+\]\([^\s)]+\))/g).map((part,i)=>{
  const link=part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
  if(!link||!(/^https?:\/\//.test(link[2])||link[2].startsWith("/rules/source?")))return part;
  const target=link[2].startsWith("/")?`https://carnical.vercel.app${link[2]}`:link[2];
  return <PdfLink key={i} src={target} style={{color:"#9f1825",textDecoration:"underline"}}>{link[1]}</PdfLink>;
 });
 return <>{parseReferenceMarkdown(text).map((block,index)=>{
  if(block.kind==="table"){
   const columns=block.header?.length||1,width=`${100/columns}%` as `${number}%`;
   return <View key={index} style={{marginBottom:8}}>{[block.header||[],...(block.rows||[])].map((cells,row)=><View key={row} wrap={false} minPresenceAhead={row===0?28:0} style={{flexDirection:"row",backgroundColor:row===0?"#eeeeee":"#ffffff"}}>{Array.from({length:columns},(_,column)=><Text key={column} style={{width,padding:4,borderWidth:0.4,borderColor:"#aaa",fontFamily:row===0?"Helvetica-Bold":"Helvetica"}}>{inline(cells[column]||"")}</Text>)}</View>)}</View>;
  }
  if(block.kind==="list")return <View key={index} style={styles.paragraph}>{block.items?.map((item,i)=><Text key={i} style={{marginBottom:3}}>• {inline(item)}</Text>)}</View>;
  if(block.kind==="rule")return <View key={index} style={{borderBottomWidth:0.5,borderBottomColor:"#aaa",marginVertical:5}}/>;
  return <Text key={index} style={block.kind==="heading"?styles.sectionTitle:styles.paragraph}>{inline(block.text||"")}</Text>;
 })}</>;
}

export async function createCharacterPdf(snapshot:ExportSnapshot,locale:Locale) {
  const activeSources=new Set(normalizeActiveSourcebooks(snapshot.sources.length?snapshot.sources:undefined));
  type RuleTarget={id:string;book?:string;version?:string};
  const targets:RuleTarget[]=Object.entries(snapshot.powers).flatMap(([discipline,names])=>names.flatMap(name=>{
    const entry=resolveContent(name,{discipline});
    const legacy=POWER_CATALOG.filter(power=>power.discipline===discipline&&power.name===name);
    const power=legacy.length===1?legacy[0]:POWER_CATALOG.find(power=>power.id===entry?.id);
    const id=entry?.id||power?.id;
    return id?[{id,book:power?powerForSources(power,activeSources).source.book:undefined}]:[];
  }));
  const clan=snapshot.customClan?undefined:resolveContent(snapshot.clan,{kind:"clan"});
  if(clan){const savedBook=SOURCEBOOKS.find(book=>book.value===snapshot.sourcebook)?.libraryId;targets.push({id:clan.id,book:savedBook&&clan.books.includes(savedBook)?savedBook:undefined})}
  const alternate=snapshot.customClan?undefined:selectedClanBane(snapshot.clan,snapshot.chronicleRules,snapshot.flaws);if(alternate)targets.push({id:alternate.id,version:alternate.versions?.[0].id});
  const predator=resolveContent(snapshot.predator,{kind:"predator"});if(predator)targets.push({id:predator.id});
  for(const [items,kind] of [[snapshot.merits,"background"],[snapshot.flaws,"flaw"]] as const){
    for(const item of items){const entry=resolveSavedItem(item,kind),version=entry?indexedItem({...item,catalogId:entry.id}).version:undefined;if(entry&&version){const book=SOURCEBOOKS.find(source=>source.value===item.source||source.libraryId===item.source)?.libraryId;targets.push({id:entry.id,book,version:version.id})}}
  }
  const uniqueTargets=[...new Map(targets.map(target=>[JSON.stringify(target),target])).values()];
  const rules = await Promise.all(uniqueTargets.map(async ({id,book,version})=>{
    const power=POWER_CATALOG.find(power=>power.id===id);
    const response=await fetch(`/api/content?id=${encodeURIComponent(id)}&lang=${locale}${book?`&book=${encodeURIComponent(book)}`:""}${version?`&version=${encodeURIComponent(version)}`:""}`,{cache:"no-store"});
    if(response.status===404&&power){
      const selectedPower=powerForSources(power,activeSources),en=locale==="en";
      const sections=[{title:en?"Source reference":"Referência à fonte",text:en?"The full description of this item has not yet been reviewed for the PDF. Consult the original source before using it. The recorded character choice is preserved.":"A descrição completa deste item ainda não foi revisada para o PDF. Consulte a fonte original antes de usá-lo. A escolha registrada na ficha foi preservada."}];
      if(selectedPower.cost!=="Consultar regra")sections.push({title:en?"Recorded cost":"Custo registrado",text:selectedPower.cost});
      if(selectedPower.duration!=="Consultar regra")sections.push({title:en?"Recorded duration":"Duração registrada",text:selectedPower.duration});
      if(selectedPower.pool)sections.push({title:en?"Recorded dice pool":"Parada registrada",text:selectedPower.pool});
      return {id,name:selectedPower.name,source:selectedPower.source.label,sections} satisfies ExportRule;
    }
    if(!response.ok)throw new Error("Missing item rules");
    const rule=await response.json() as ExportRule&{pages?:Array<{pdfPage:number;printedPage:number|null;url:string}>};
    const references=(rule.pages||[]).filter(page=>page.url.startsWith("/rules/source?")).map(page=>`- [${locale==="en"?"Original page":"Página original"} ${page.printedPage??page.pdfPage} (PDF ${page.pdfPage})](${page.url})`).join("\n");
    return references?{...rule,sections:[...rule.sections,{title:locale==="en"?"Original source pages":"Páginas da fonte original",text:references}]}:rule;
  }));
  return pdf(<CharacterPdfDocument snapshot={snapshot} locale={locale} rules={rules}/>).toBlob();
}
function resolveSavedItem(item:{name:string;source:string;catalogId?:string;versionId?:string},kind:"background"|"flaw"){
  if(["custom","personalizado","conteúdo personalizado","homebrew"].includes(item.source.toLocaleLowerCase("pt-BR")))return undefined;
  const book=SOURCEBOOKS.find(book=>book.value===item.source||book.libraryId===item.source)?.libraryId;
  if(item.catalogId){
    const entry=CONTENT_INDEX.find(entry=>entry.id===item.catalogId);
    if(!entry||!((kind==="flaw"&&entry.kind==="flaw")||(kind==="background"&&["background","merit","loresheet"].includes(entry.kind)))||(book&&!entry.books.includes(book))||(item.versionId&&!entry.versions?.some(version=>version.id===item.versionId&&(!book||version.book===book))))return undefined;
    return entry;
  }
  if(kind==="flaw")return resolveContent(item.name,{kind,book});
  return resolveContent(item.name,{kinds:["background","merit","loresheet"],book});
}
