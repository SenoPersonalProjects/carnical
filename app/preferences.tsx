"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Languages, Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";
import translations from "./ui-translations.json";

export type Locale = "pt-BR" | "en";

const UI_TRANSLATIONS: Record<string,string> = {
  "Busca consentimento para se alimentar":"Seeks consent before feeding","Evita sangue humano e caça animais":"Avoids human blood and hunts animals","Alimenta-se de seguidores e devotos":"Feeds on followers and devotees","Depende de sangue preservado":"Relies on preserved blood","Caça vítimas adormecidas":"Hunts sleeping victims","Alimenta-se de outros vampiros":"Feeds on other vampires","Caça dentro de uma subcultura":"Hunts within a subculture","Usa sedução para se aproximar":"Uses seduction to approach prey","Oculta a caça entre família e amigos":"Conceals feeding among family and friends","Caça por assalto e intimidação":"Hunts through assault and intimidation","Obtém sangue por coerção":"Obtains blood through coercion","Caça em cemitérios, hospitais e necrotérios":"Hunts in cemeteries, hospitals and morgues","Alimenta-se de pessoas próximas da morte":"Feeds on people near death","Usa uma equipe para conduzir as presas":"Uses a team to drive prey toward them","Estuda e persegue uma presa":"Studies and stalks prey","Atrai presas para seu território":"Lures prey into their territory","Tipo de Predador da fonte indicada":"Predator Type from the indicated source",
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

export function translateUi(value:string,locale:Locale) { return locale==="en"?(UI_TRANSLATIONS[value]||(translations as Record<string,string>)[value]||value):value; }

export function PreferencesProvider({children}:{children:React.ReactNode}) {
  const locale=usePreferredLocale();
  useEffect(()=>{document.documentElement.lang=locale},[locale]);
  return <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} storageKey="noctis-theme"><LocaleContext locale={locale}>{children}<PreferencesDock locale={locale}/></LocaleContext></ThemeProvider>;
}

function LocaleContext({locale,children}:{locale:Locale;children:React.ReactNode}){return <div data-locale={locale} style={{display:"contents"}}>{children}</div>}

export function getLocale():Locale {if(typeof window==="undefined")return "pt-BR";return localStorage.getItem("noctis-locale")==="en"?"en":"pt-BR"}
export function setPreferredLocale(locale:Locale){localStorage.setItem("noctis-locale",locale);window.dispatchEvent(new Event("noctis-locale-change"))}

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
  return useSyncExternalStore(subscribeLocale,getLocale,()=>"pt-BR" as Locale);
}

function subscribeLocale(notify:()=>void){window.addEventListener("noctis-locale-change",notify);window.addEventListener("storage",notify);return()=>{window.removeEventListener("noctis-locale-change",notify);window.removeEventListener("storage",notify)}}
