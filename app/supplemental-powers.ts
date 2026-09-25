import type {PowerRule,SourceRef} from "./game-rules";

type Entry=[name:string,level:number,amalgam?:string];
function add(book:SourceRef["book"],chapter:string,label:string,discipline:string,kind:PowerRule["kind"],entries:Entry[]):PowerRule[]{
  return entries.map(([name,level,amalgam])=>({id:`${book}-${kind}-${discipline}-${name}`.toLocaleLowerCase("en").replace(/[^a-z0-9]+/g,"-"),name,discipline,kind,level,amalgam,cost:"Consultar regra",duration:"Consultar regra",source:{book,chapter,query:name,label}}));
}
const player=(discipline:string,entries:Entry[])=>add("players-guide-v5","players-guide-v5-discipline-powers","Player’s Guide V5, Disciplinas, PDF pp. 71–105",discipline,"power",entries);
const ceremony=(entries:Entry[])=>add("players-guide-v5","players-guide-v5-discipline-powers","Player’s Guide V5, Cerimônias, PDF pp. 94–99","Oblívio","ceremony",entries.map(([name,level])=>[name,level])).map((item,index)=>({...item,prerequisite:entries[index][2]}));
const ritual=(book:SourceRef["book"],chapter:string,label:string,entries:Entry[])=>add(book,chapter,label,"Feitiçaria de Sangue","ritual",entries);
const formula=(book:SourceRef["book"],chapter:string,label:string,entries:Entry[])=>add(book,chapter,label,"Alquimia do Sangue-Fraco","formula",entries);

export const SUPPLEMENTAL_POWERS:PowerRule[]=[
  ...player("Celeridade",[["Unseen Strike",5,"Ofuscação 4"]]),
  ...player("Dominação",[["Slavish Devotion",1,"Fortitude 1"],["Domitor’s Favor",2],["Ancestral Dominion",4,"Feitiçaria de Sangue 2"],["Implant Suggestion",4,"Presença 1"]]),
  ...player("Auspícios",[["Obeah",2,"Fortitude 1"]]),
  ...player("Ofuscação",[["Mind Masque",4,"Dominação 2"]]),
  ...player("Potência",[["Relentless Grasp",2],["Wrecker",3],["Crash Down",4],["Subtle Hammer",5]]),
  ...player("Presença",[["Eyes of the Serpent",1,"Proteanismo 1"],["Melpominee",2],["Thrown Voice",3,"Auspícios 1"],["Suffuse the Edifice",4]]),
  ...player("Proteanismo",[["Vicissitude",2,"Dominação 2"],["Fleshcrafting",3,"Dominação 2"],["Horrid Form",4,"Dominação 2"],["One with the Land",5,"Animalismo 2"]]),
  ...player("Oblívio",[["Ashes to Ashes",1],["The Binding Fetter",1],["Fatal Prediction",2],["Where the Veil Thins",2],["Aura of Decay",3],["Passion Feast",3],["Shadow Servant",3],["Necrotic Plague",4],["Skuld Fulfilled",5]]),
  ...player("Feitiçaria de Sangue",[["Scour Secrets",2],["Blood Aegis",4]]),
  ...ceremony([["The Gift of False Life",1,"Ashes to Ashes"],["Summon Spirit",1,"The Binding Fetter"],["Awaken the Homuncular Servant",2,"Where the Veil Thins"],["Compel Spirit",2,"Where the Veil Thins"],["Host Spirit",3,"Aura of Decay"],["Shambling Hordes",3,"Aura of Decay"],["Bind the Spirit",4,"Necrotic Plague"],["Split the Veil",4,"Necrotic Plague"],["Lazarene Blessing",5,"Skuld Fulfilled"]]),
  ...ritual("players-guide-v5","players-guide-v5-discipline-powers","Player’s Guide V5, Rituais, PDF pp. 101–104",[["Douse the Fear",1],["Seal the Brand",1],["As Fog on Water",2],["Calix Secretus",2],["Soporific Touch",2],["Fire in the Blood",3],["One with the Blade",3],["Feast of Ashes",4],["Guided Memory",4],["Invisible Chains of Binding",4],["Antebrachia Ignium",5]]),
  ...formula("players-guide-v5","players-guide-v5-discipline-powers","Player’s Guide V5, Fórmulas, PDF pp. 105–108",[["Mercurian Tongue",1],["Plug-In",1],["Friends List",2],["Mandagloire",3],["Tank",3],["Rumor",3],["Short Circuit",4],["Toxic Personality",4]]),
  ...add("companion-v5","companion-v5-parte-i-os-clas-e-suas-aptidoes","Companion V5, Poderes das Disciplinas, PDF pp. 24–28","Auspícios","power",[["Aliviando a Alma Bestial",5,"Dominação 3"]]),
  ...add("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Disciplinas, PDF pp. 47–51","Auspícios","power",[["Unerring Pursuit",2,"Dominação 1"]]),
  ...add("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Disciplinas, PDF pp. 47–51","Animalismo","power",[["Scent of Prey",3]]),
  ...add("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Disciplinas, PDF pp. 47–51","Dominação","power",[["Tabula Rasa",4]]),
  ...add("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Disciplinas, PDF pp. 47–51","Ofuscação","power",[["Mask of Isolation",3,"Dominação 1"]]).map(item=>({...item,prerequisite:"Máscara de Mil Faces"})),
  ...add("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Disciplinas, PDF pp. 47–51","Proteanismo","power",[["Visceral Absorption",3,"Feitiçaria de Sangue 2"]]),
  ...add("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Disciplinas, PDF pp. 47–51","Oblívio","power",[["Umbrous Clutch",4]]),
  ...add("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Disciplinas, PDF pp. 47–51","Feitiçaria de Sangue","power",[["Transitive Bond",3],["Reclamation of Vitae",5]]),
  ...ritual("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Rituais, PDF pp. 51–52",[["Beelzebeatit",1],["Communal Vigor",3],["Galvanic Ruination",3],["Simulacrum Gate",5]]),
  ...add("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Cerimônias, PDF p. 53","Oblívio","ceremony",[["Blinding the Alloy Eye",2],["Harrowhaunt",3],["Befoul Vessel",4]]).map(item=>({...item,prerequisite:item.name==="Blinding the Alloy Eye"?"Shadow Cast":item.name==="Befoul Vessel"?"Necrotic Touch":undefined})),
  ...formula("sabbat-black-hand-v5","sabbat-black-hand-v5-chapter-2-apostates-of-a-cruel-church","Sabbat: The Black Hand V5, Fórmulas, PDF p. 54",[["Portable Shade",1],["On-Demand Sunburn",3]]),
  ...add("cultos-deuses-sangue-v5","cultos-deuses-sangue-v5-capitulo-2-religioes-vampiricas","Cultos dos Deuses de Sangue V5, Cerimônias de Shalim, PDF pp. 93–94","Oblívio","ceremony",[["O Chamado do Viajante",2],["Nome do Pai",3],["Poço da Contemplação",5]]),
  ...add("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Disciplinas, PDF pp. 48–50","Animalismo","power",[["Spirit Walk",5]]),
  ...add("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Disciplinas, PDF pp. 48–50","Celeridade","power",[["Fluent Swiftness",1]]),
  ...add("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Disciplinas, PDF pp. 48–50","Dominação","power",[["Lethe’s Call",5]]),
  ...add("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Disciplinas, PDF pp. 48–50","Fortitude","power",[["Fluent Endurance",1]]),
  ...add("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Disciplinas, PDF pp. 48–50","Ofuscação","power",[["Ensconce",1],["Cache",2]]),
  ...add("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Disciplinas, PDF pp. 48–50","Potência","power",[["Fluent Strength",1]]),
  ...add("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Disciplinas, PDF pp. 48–50","Proteanismo","power",[["Bloodform",5,"Feitiçaria de Sangue 2"],["Master of Forms",5]]),
  ...add("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Disciplinas, PDF pp. 50–52","Feitiçaria de Sangue","power",[["Blood’s Curse",2]]),
  ...ritual("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Rituais, PDF pp. 50–51",[["Blood to Water",1],["Revealing the Crimson Trail",1],["Innocence’s Veil",4],["Atrocity’s Release",5],["Reawakened Vigor",5]]),
  ...add("gehenna-war-v5","gehenna-war-v5-chapter-2-we-who-are-already-dead","Gehenna War V5, Cerimônia, PDF p. 52","Oblívio","ceremony",[["The Shallow Slumber",3]]),
  ...ritual("sigilos-de-sangue-v5","sigilos-de-sangue-v5-o-enforcado-e-a-temperanca-as-magias","Sigilos de Sangue V5, Rituais, PDF pp. 61–74",[["Astromancia",1],["Amarre a Língua Acusadora",1],["Apreensão Elemental",2],["Mestre Artesão",2],["Profundezas do Pesadelo",2],["Le Sang De L’amour",2],["Tiamat Glistens",2],["Silentia Mortis",2],["Jardim das Vísceras",2],["Abrigo Elemental",3],["Nepenthe",3],["Ver com os Olhos do Céu",3],["Procurando Tiamat",3],["Alma do Hemonculus",3],["Pedra da Verdadeira Forma",3],["Haruspex Viral",4],["Invasão",4],["Compelir o Inanimado",4],["Consulta de Egrégora",4],["Sustento da Terra",4],["Ataque Elemental",5],["Cavalgando nas Veias da Terra",5],["Rei Pescador",5]]),
  ...formula("sigilos-de-sangue-v5","sigilos-de-sangue-v5-o-enforcado-e-a-temperanca-as-magias","Sigilos de Sangue V5, Fórmulas, PDF pp. 75–82",[["Pintura Corporal",1],["Torpor Avançado",2],["Surpresa de Luz Negra",2],["Pele de Diamante",3],["Pele de Fogo",3],["Imitador",4],["Condutor Meio Vivo",4],["Fluxo de Saturno",5]]),
];
