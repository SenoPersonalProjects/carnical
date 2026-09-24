"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, CircleAlert, LogOut, Minus, Plus, Save, Shield, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { migrateLegacyData } from "../legacy-migration";

type Values=Record<string,number>;
type Specialty={skill:string;name:string;source:string};
type Merit={name:string;dots:number;source:string;notes:string};
type GameData={
  attributes:Values;skills:Values;disciplines:Values;disciplinePowers:Record<string,string[]>;specialties:Specialty[];merits:Merit[];flawItems:Merit[];
  predator:string;humanity:number;hunger:number;stains:number;healthSuperficial:number;healthAggravated:number;willpowerSuperficial:number;willpowerAggravated:number;
  convictions:string;touchstones:string;ambition:string;desire:string;clanBane:string;clanCompulsion:string;resonance:string;bloodPotency:number;generation:string;
  xpTotal:string;xpSpent:string;chronicle:string;notes:string;[key:string]:unknown;
};
type Character={id:number;name:string;concept:string;clan:string;sourcebook:string;data:GameData};
const defaults:GameData={attributes:{},skills:{},disciplines:{},disciplinePowers:{},specialties:[],merits:[],flawItems:[],predator:"",humanity:7,hunger:1,stains:0,healthSuperficial:0,healthAggravated:0,willpowerSuperficial:0,willpowerAggravated:0,convictions:"",touchstones:"",ambition:"",desire:"",clanBane:"",clanCompulsion:"",resonance:"",bloodPotency:1,generation:"13ª",xpTotal:"",xpSpent:"",chronicle:"",notes:""};
const normalize=(value:Character):Character=>({...value,data:migrateLegacyData({...defaults,...(value.data||{}),attributes:value.data?.attributes||{},skills:value.data?.skills||{},disciplines:value.data?.disciplines||{},disciplinePowers:value.data?.disciplinePowers||{},specialties:value.data?.specialties||[],merits:value.data?.merits||[],flawItems:value.data?.flawItems||[]}).data as GameData});

export default function GameSheet({displayName,signOutPath}:{displayName:string;signOutPath:string}){
  const [characters,setCharacters]=useState<Character[]>([]),[character,setCharacter]=useState<Character|null>(null),[status,setStatus]=useState<"loading"|"saved"|"saving"|"error">("loading");
  const persisted=useRef("");
  useEffect(()=>{fetch("/api/characters").then(async response=>{if(!response.ok)throw new Error();return await response.json() as {characters:Character[]}}).then(({characters})=>{const safe=characters.map(normalize);setCharacters(safe);const requested=Number(new URLSearchParams(window.location.search).get("id"));const initial=safe.find(item=>item.id===requested)??safe[0]??null;setCharacter(initial);persisted.current=JSON.stringify(initial);setStatus("saved")}).catch(()=>setStatus("error"))},[]);
  useEffect(()=>{if(!character||status==="loading"||JSON.stringify(character)===persisted.current)return;const timer=setTimeout(async()=>{setStatus("saving");try{const response=await fetch(`/api/characters/${character.id}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(character)});if(!response.ok)throw new Error();const {character:saved}=await response.json() as {character:Character};const safe=normalize(saved);persisted.current=JSON.stringify(safe);setCharacter(safe);setCharacters(items=>items.map(item=>item.id===safe.id?safe:item));setStatus("saved")}catch{setStatus("error")}},600);return()=>clearTimeout(timer)},[character,status]);
  const setData=<K extends keyof GameData>(key:K,value:GameData[K])=>setCharacter(current=>current?{...current,data:{...current.data,[key]:value}}:current);
  const selectCharacter=(id:number)=>{const next=characters.find(item=>item.id===id)??null;setCharacter(next);persisted.current=JSON.stringify(next);history.replaceState(null,"",`/play?id=${id}`)};
  const healthMax=(character?.data.attributes.Vigor||1)+3,willpowerMax=(character?.data.attributes.Autocontrole||1)+(character?.data.attributes.Determinação||1);
  const specialtiesBySkill=useMemo(()=>Object.groupBy(character?.data.specialties||[],item=>item.skill),[character]);
  if(status==="loading")return <main className="play-loading">Abrindo ficha…</main>;
  if(!character)return <main className="play-empty"><Shield size={38}/><h1>Nenhuma ficha disponível</h1><p>Crie um personagem antes de abrir o modo de jogo.</p><Link href="/">Criar personagem</Link></main>;
  return <main className="play-shell">
    <header className="play-topbar"><div className="play-brand"><span>N</span><div><strong>NOCTIS</strong><small>MODO DE JOGO</small></div></div><nav><Link href="/"><ArrowLeft size={15}/>Criação</Link><Link href="/rules"><BookOpen size={15}/>Biblioteca</Link></nav><div className="play-account"><span className={status==="error"?"save-error":""}>{status==="saving"?"Salvando…":status==="error"?"Falha ao salvar":"Salvo"}</span><span>{displayName}</span><a href={signOutPath} target="_top"><LogOut size={16}/></a></div></header>
    <div className="play-layout">
      <aside className="play-roster"><span>PERSONAGEM EM JOGO</span><select value={character.id} onChange={event=>selectCharacter(Number(event.target.value))}>{characters.map(item=><option value={item.id} key={item.id}>{item.name||"Sem nome"} — {item.clan||"Sem Clã"}</option>)}</select><div className="play-portrait">{(character.name||"?")[0]}</div><h1>{character.name||"Sem nome"}</h1><p>{character.concept||"Conceito não definido"}</p><dl><div><dt>Clã</dt><dd>{character.clan||"—"}</dd></div><div><dt>Predador</dt><dd>{character.data.predator||"—"}</dd></div><div><dt>Geração</dt><dd>{character.data.generation}</dd></div><div><dt>Potência</dt><dd>{character.data.bloodPotency}</dd></div></dl>{character.data.clanBane&&<div className="play-warning"><CircleAlert size={15}/><div><strong>Fraqueza do Clã</strong><p>{character.data.clanBane}</p></div></div>}</aside>
      <section className="play-main">
        <div className="play-heading"><div><span>{character.data.chronicle||"CRÔNICA NÃO DEFINIDA"}</span><h2>A noite de {character.name||"seu personagem"}</h2></div><div className="xp-card"><span>XP</span><strong>{character.data.xpSpent||"0"} / {character.data.xpTotal||"0"}</strong></div></div>
        <div className="session-trackers">
          <DamageTrack label="Vitalidade" max={healthMax} superficial={character.data.healthSuperficial} aggravated={character.data.healthAggravated} onChange={(superficial,aggravated)=>setCharacter(current=>current?{...current,data:{...current.data,healthSuperficial:superficial,healthAggravated:aggravated}}:current)}/>
          <DamageTrack label="Força de Vontade" max={willpowerMax} superficial={character.data.willpowerSuperficial} aggravated={character.data.willpowerAggravated} onChange={(superficial,aggravated)=>setCharacter(current=>current?{...current,data:{...current.data,willpowerSuperficial:superficial,willpowerAggravated:aggravated}}:current)}/>
          <Counter label="Fome" value={character.data.hunger} min={0} max={5} onChange={value=>setData("hunger",value)} accent/>
          <Counter label="Humanidade" value={character.data.humanity} min={1} max={10} onChange={value=>setData("humanity",value)}/>
          <Counter label="Máculas" value={character.data.stains} min={0} max={10} onChange={value=>setData("stains",value)}/>
        </div>
        <Tabs defaultValue="traits" className="play-tabs"><TabsList variant="line"><TabsTrigger value="traits">Características</TabsTrigger><TabsTrigger value="disciplines">Disciplinas</TabsTrigger><TabsTrigger value="story">Âncoras</TabsTrigger><TabsTrigger value="notes">Notas</TabsTrigger></TabsList>
          <TabsContent value="traits"><div className="play-columns"><TraitPanel title="Atributos" values={character.data.attributes}/><TraitPanel title="Habilidades" values={character.data.skills} specialties={specialtiesBySkill}/></div></TabsContent>
          <TabsContent value="disciplines"><div className="play-disciplines">{Object.entries(character.data.disciplines).filter(([,dots])=>dots>0).map(([name,dots])=><article key={name}><header><h3>{name}</h3><DotsRead value={dots}/></header>{(character.data.disciplinePowers[name]||[]).filter(Boolean).map(power=><p key={power}><Sparkles size={14}/>{power}</p>)}</article>)}</div></TabsContent>
          <TabsContent value="story"><div className="play-story"><StoryBlock title="Ambição" text={character.data.ambition}/><StoryBlock title="Desejo" text={character.data.desire}/><StoryBlock title="Convicções" text={character.data.convictions}/><StoryBlock title="Pilares" text={character.data.touchstones}/><StoryBlock title="Vantagens" text={character.data.merits.map(item=>`${item.name} ${"•".repeat(item.dots)}`).join("\n")}/><StoryBlock title="Defeitos" text={character.data.flawItems.map(item=>`${item.name} ${"•".repeat(item.dots)}`).join("\n")}/></div></TabsContent>
          <TabsContent value="notes"><label className="play-notes"><span>Notas da sessão</span><textarea value={character.data.notes} onChange={event=>setData("notes",event.target.value)} placeholder="Condições, lembretes, dívidas e acontecimentos desta noite…"/></label></TabsContent>
        </Tabs>
      </section>
    </div>
  </main>;
}

function Counter({label,value,min,max,onChange,accent=false}:{label:string;value:number;min:number;max:number;onChange:(value:number)=>void;accent?:boolean}){return <div className={accent?"counter-card accent":"counter-card"}><span>{label}</span><div><button onClick={()=>onChange(Math.max(min,value-1))} disabled={value<=min}><Minus size={14}/></button><strong>{value}</strong><button onClick={()=>onChange(Math.min(max,value+1))} disabled={value>=max}><Plus size={14}/></button></div><div className="counter-dots">{Array.from({length:max},(_,i)=><i className={i<value?"filled":""} key={i}/>)}</div></div>}
function DamageTrack({label,max,superficial,aggravated,onChange}:{label:string;max:number;superficial:number;aggravated:number;onChange:(s:number,a:number)=>void}){const total=Math.min(max,superficial+aggravated);return <div className="damage-card"><header><span>{label}</span><strong>{total}/{max}</strong></header><div className="damage-boxes">{Array.from({length:max},(_,i)=><i key={i} className={i<aggravated?"aggravated":i<aggravated+superficial?"superficial":""}>{i<aggravated?"×":i<aggravated+superficial?"/":""}</i>)}</div><div className="damage-actions"><span>Superficial</span><button onClick={()=>onChange(Math.max(0,superficial-1),aggravated)}><Minus size={13}/></button><button onClick={()=>onChange(Math.min(max-aggravated,superficial+1),aggravated)}><Plus size={13}/></button><span>Agravado</span><button onClick={()=>onChange(superficial,Math.max(0,aggravated-1))}><Minus size={13}/></button><button onClick={()=>onChange(Math.min(superficial,max-(aggravated+1)),Math.min(max,aggravated+1))}><Plus size={13}/></button></div></div>}
function TraitPanel({title,values,specialties={}}:{title:string;values:Values;specialties?:Partial<Record<string,Specialty[]>>}){return <section className="trait-panel"><h3>{title}</h3>{Object.entries(values).filter(([,value])=>value>0).sort((a,b)=>b[1]-a[1]).map(([name,value])=><div key={name}><span>{name}{specialties[name]?.length?<small>{specialties[name]?.map(item=>item.name).join(", ")}</small>:null}</span><DotsRead value={value}/></div>)}</section>}
function DotsRead({value}:{value:number}){return <span className="dots-read">{Array.from({length:5},(_,i)=><i className={i<value?"filled":""} key={i}/>)}</span>}
function StoryBlock({title,text}:{title:string;text:string}){return <article><span>{title}</span>{text?<p>{text}</p>:<em>Não preenchido</em>}</article>}
