"use client";
import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";

// One request at a time, with a separate draft for every selected character.
export function useCharacterSave<T extends {id?:number}>({initial,normalize,mergePending,onSaved,enabled}:{initial:()=>T;normalize:(value:T)=>T;mergePending:(local:T,remote:T)=>T;onSaved:(value:T)=>void;enabled:boolean}) {
  const [character,setCharacter]=useState<T>(initial),[loaded,setLoaded]=useState(!enabled);
  const [status,setStatus]=useState<"loading"|"saved"|"saving"|"error">(enabled?"loading":"saved");
  const active=useRef("new:0"),serial=useRef(0),drafts=useRef(new Map<string,T>()),persisted=useRef(new Map<string,string>());
  const queue=useRef(new Set<string>()),running=useRef<Promise<void>|null>(null);
  const flush=useCallback(async()=>{
    if(!enabled)return;
    if(running.current)return running.current;
    const work=async()=>{
      setStatus("saving");
      try{while(queue.current.size){
        const key=queue.current.values().next().value!;queue.current.delete(key);
        const sent=drafts.current.get(key);if(!sent||JSON.stringify(sent)===persisted.current.get(key))continue;
        const serialized=JSON.stringify(sent);
        const response=await fetch(sent.id?`/api/characters/${sent.id}`:"/api/characters",{method:sent.id?"PATCH":"POST",headers:{"content-type":"application/json"},body:serialized});
        if(!response.ok){queue.current.add(key);throw new Error("save")}
        const {character:raw}=await response.json() as {character:T},remote=normalize(raw);
        const local=drafts.current.get(key)??sent;
        const pending=JSON.stringify(local)!==serialized;
        const updated=pending?mergePending(local,remote):remote;
        drafts.current.set(key,updated);persisted.current.set(key,JSON.stringify(remote));
        if(pending)queue.current.add(key);
        if(active.current===key)setCharacter(updated);
        onSaved(updated);
      }setStatus("saved")}catch{
        for(const [key,draft] of drafts.current)if(JSON.stringify(draft)!==persisted.current.get(key))queue.current.add(key);
        setStatus("error");
      }
    };
    running.current=work();await running.current;running.current=null;
  },[enabled,normalize,mergePending,onSaved]);
  const save=useCallback(async(next?:T)=>{
    if(!loaded)return;
    if(next)drafts.current.set(active.current,next);
    queue.current.add(active.current);await flush();
  },[flush,loaded]);
  useEffect(()=>{
    if(!loaded)return;
    drafts.current.set(active.current,character);
    if(!enabled||!loaded||JSON.stringify(character)===persisted.current.get(active.current))return;
    const key=active.current,timer=setTimeout(()=>{queue.current.add(key);void flush()},850);
    return()=>clearTimeout(timer);
  },[character,enabled,loaded,flush]);
  const initialize=useCallback((value:T)=>{
    const key=value.id?`id:${value.id}`:`new:${++serial.current}`;
    active.current=key;drafts.current.set(key,value);persisted.current.set(key,JSON.stringify(value));
    setCharacter(value);setLoaded(true);setStatus("saved");
  },[]);
  const select=useCallback((value:T)=>{
    const previous=active.current;
    if(drafts.current.has(previous)&&JSON.stringify(drafts.current.get(previous))!==persisted.current.get(previous))queue.current.add(previous);
    const key=value.id?([...drafts.current].find(([,draft])=>draft.id===value.id)?.[0]??`id:${value.id}`):`new:${++serial.current}`;
    const draft=drafts.current.get(key)??value;
    if(!drafts.current.has(key))persisted.current.set(key,JSON.stringify(value));
    active.current=key;drafts.current.set(key,draft);setCharacter(draft);
    if(queue.current.size)void flush();
  },[flush]);
  const accept=useCallback((raw:T)=>{
    const remote=normalize(raw),key=active.current,local=drafts.current.get(key);
    if(local?.id!==remote.id)return;
    const updated=local&&JSON.stringify(local)!==persisted.current.get(key)?mergePending(local,remote):remote;
    drafts.current.set(key,updated);persisted.current.set(key,JSON.stringify(remote));setCharacter(updated);onSaved(updated);
  },[normalize,mergePending,onSaved]);
  const failLoading=useCallback(()=>{setStatus("error")},[]);
  return {character,setCharacter:setCharacter as (value:SetStateAction<T>)=>void,status,loaded,initialize,select,save,accept,failLoading};
}
