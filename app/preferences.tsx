"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Languages, Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";

export type Locale = "pt-BR" | "en";

const UI_TRANSLATIONS: Record<string,string> = {
  "CRIADOR DE PERSONAGENS":"CHARACTER CREATOR","MODO DE JOGO":"PLAY MODE","BIBLIOTECA DA NOITE":"NIGHT LIBRARY",
  "Criação":"Creation","Biblioteca":"Library","Regras":"Rules","Alertas":"Warnings","Incoerências":"Inconsistencies",
  "Salvo":"Saved","Salvando…":"Saving…","Falha ao salvar":"Save failed","Prévia local":"Local preview",
  "PERSONAGENS":"CHARACTERS","Sua primeira ficha aparecerá aqui quando você começar a preencher.":"Your first character sheet will appear here when you start filling it in.",
  "CRIAÇÃO":"CREATION","Conceito":"Concept","Clã":"Clan","Atributos":"Attributes","Habilidades":"Skills","Predador":"Predator",
  "Disciplinas":"Disciplines","Vantagens":"Advantages","Revisão":"Review","Avançar":"Next","Voltar":"Back","Concluído":"Complete",
  "Nome":"Name","Crônica":"Chronicle","Conceito não definido":"Undefined concept","Sem nome":"Unnamed","Sem Clã":"Clanless",
  "Obrigatório":"Required","Opcional":"Optional","Da crônica":"Chronicle","Conteúdo personalizado":"Custom content",
  "Comece pela pessoa. Os números vêm depois.":"Start with the person. The numbers come later.",
  "Escolha uma linhagem oficial ou escreva a sua própria.":"Choose an official bloodline or write your own.",
  "O Sangue carrega uma herança":"The Blood carries a legacy","Como você caça?":"How do you hunt?",
  "O Tipo de Predador modifica a ficha, mas não limita outras formas de alimentação.":"Predator Type changes the sheet, but does not limit other ways of feeding.",
  "O que você aprendeu?":"What have you learned?","O que você possui — e o que o persegue?":"What do you own — and what haunts you?",
  "Quem você deixou para trás?":"Who did you leave behind?","Sua crônica, suas regras":"Your chronicle, your rules",
  "Quais regras valem nesta crônica?":"Which rules apply in this chronicle?","Você pode continuar mesmo com alertas.":"You can continue even with warnings.",
  "Abrir biblioteca completa":"Open full library","Livros separados, índice por capítulos e busca":"Separate books, chapter index and search",
  "Livro Básico":"Core Rulebook","Livro Básico V5":"V5 Core Rulebook","Fontes e regras":"Sources and rules",
  "Características":"Traits","Âncoras":"Anchors","Notas":"Notes","Notas da sessão":"Session notes","Ambição":"Ambition","Desejo":"Desire",
  "Convicções":"Convictions","Pilares":"Touchstones","Defeitos":"Flaws","Vitalidade":"Health","Força de Vontade":"Willpower",
  "Fome":"Hunger","Humanidade":"Humanity","Máculas":"Stains","Potência de Sangue":"Blood Potency","Geração":"Generation",
  "PERSONAGEM EM JOGO":"ACTIVE CHARACTER","Fraqueza do Clã":"Clan Bane","Compulsão do Clã":"Clan Compulsion",
  "ROLADOR V5":"V5 DICE ROLLER","Parada com Dados de Fome":"Pool with Hunger Dice","Abrir regra":"Open rule","Parada manual":"Manual pool",
  "Nenhuma":"None","Modificador":"Modifier","Parada calculada":"Calculated pool","Dificuldade":"Difficulty","Dados de Fome":"Hunger Dice",
  "Teste de Despertar":"Rouse Check","Rolar":"Roll","Ação":"Action","Agravado":"Aggravated","Superficial":"Superficial",
  "Não preenchido":"Not filled in","Nenhuma ficha disponível":"No character sheet available","Crie um personagem antes de abrir o modo de jogo.":"Create a character before opening play mode.",
  "Criar personagem":"Create character","Abrindo ficha…":"Opening sheet…","ACERVO":"COLLECTION","Capítulos":"Chapters","CAPÍTULO":"CHAPTER",
  "Voltar à ficha":"Back to sheet","Voltar à criação de personagem":"Back to character creation","Buscar neste livro...":"Search this book...",
  "Carregando capítulo…":"Loading chapter…","Traduzindo capítulo…":"Translating chapter…","Tentar novamente":"Try again",
  "Não foi possível carregar este capítulo.":"This chapter could not be loaded.","Não foi possível traduzir este capítulo.":"This chapter could not be translated.",
  "Fonte:":"Source:","Abrir índice":"Open index","Fechar índice":"Close index","Limpar busca":"Clear search",
  "Tema claro":"Light theme","Tema escuro":"Dark theme","Mudar para inglês":"Switch to English","Mudar para português":"Switch to Portuguese",
  "Aparência":"Appearance","História":"History","Ressonância":"Resonance","Especializações":"Specialties","Determinação":"Resolve",
  "Autocontrole":"Composure","Força":"Strength","Inteligência":"Intelligence","Percepção":"Awareness","Raciocínio":"Wits",
  "Manipulação":"Manipulation","Sobrevivência":"Survival","Persuasão":"Persuasion","Intimidação":"Intimidation","Investigação":"Investigation",
  "Erudição":"Academics","Ciência":"Science","Política":"Politics","Finanças":"Finance","Condução":"Drive","Ofícios":"Craft",
  "Dominação":"Dominate","Potência":"Potence","Presença":"Presence","Ofuscação":"Obfuscate","Auspícios":"Auspex","Oblívio":"Oblivion",
  "Feitiçaria de Sangue":"Blood Sorcery","Não escolhido":"Not selected","Distribuição concluída":"Distribution complete","Distribuição em andamento":"Distribution in progress"
};

const ATTRIBUTE_NAMES = ["placeholder","title","aria-label"] as const;

function translateText(value:string) {
  const leading=value.match(/^\s*/)?.[0]??"", trailing=value.match(/\s*$/)?.[0]??"", core=value.trim();
  if(!core)return value;
  let translated=UI_TRANSLATIONS[core];
  if(!translated){
    translated=core
      .replace(/^(\d+) capítulos · Português$/,"$1 chapters · Portuguese")
      .replace(/^(\d+) capítulos · Inglês$/,"$1 chapters · English")
      .replace(/^Nível (\d+)/,"Level $1")
      .replace(/^A noite de /,"The night of ")
      .replace(/^Fome atual /,"Current Hunger ")
      .replace(/^Abrir /,"Open ")
      .replace(/^Fechar /,"Close ");
  }
  return leading+translated+trailing;
}

export function PreferencesProvider({children}:{children:React.ReactNode}) {
  const locale=usePreferredLocale();
  useEffect(()=>{
    document.documentElement.lang=locale;
    if(locale!=="en")return;
    const originals=new WeakMap<Node,string>();
    const translateNode=(root:Node)=>{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      let node:Node|null=root.nodeType===Node.TEXT_NODE?root:walker.nextNode();
      while(node){const parent=node.parentElement;if(parent&&!parent.closest("[data-no-auto-translate],script,style")&&node.textContent){const original=originals.get(node)??node.textContent;originals.set(node,original);node.textContent=translateText(original)}node=walker.nextNode()}
      if(root instanceof Element||root instanceof Document){const base=root instanceof Document?root.documentElement:root;[base,...base.querySelectorAll("*")].forEach(element=>ATTRIBUTE_NAMES.forEach(name=>{const value=element.getAttribute(name);if(value)element.setAttribute(name,translateText(value))}))}
    };
    translateNode(document);
    const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(translateNode)));
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[locale]);
  return <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} storageKey="noctis-theme"><LocaleContext locale={locale}>{children}<PreferencesDock locale={locale}/></LocaleContext></ThemeProvider>;
}

function LocaleContext({locale,children}:{locale:Locale;children:React.ReactNode}){return <div data-locale={locale} style={{display:"contents"}}>{children}</div>}

export function getLocale():Locale {if(typeof window==="undefined")return "pt-BR";return localStorage.getItem("noctis-locale")==="en"?"en":"pt-BR"}
export function setPreferredLocale(locale:Locale){localStorage.setItem("noctis-locale",locale);window.location.reload()}

function PreferencesDock({locale}:{locale:Locale}) {
  const {resolvedTheme,setTheme}=useTheme();
  const dark=resolvedTheme!=="light";
  const nextLocale=locale==="pt-BR"?"en":"pt-BR";
  return <div className="preferences-dock" data-no-auto-translate>
    <button type="button" onClick={()=>setPreferredLocale(nextLocale)} aria-label={locale==="pt-BR"?"Mudar para inglês":"Mudar para português"}><Languages size={16}/><span>{locale==="pt-BR"?"EN":"PT"}</span></button>
    <button type="button" onClick={()=>setTheme(dark?"light":"dark")} aria-label={dark?"Tema claro":"Tema escuro"}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button>
  </div>;
}

export function usePreferredLocale(){
  return useSyncExternalStore(()=>()=>{},getLocale,()=>"pt-BR" as Locale);
}
