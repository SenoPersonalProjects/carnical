"use client";
import ContentDetails from "./content-details";
import {resolveContent} from "./resolve";
import type {ContentKind} from "./types";
export default function KnownContentDetails({name,kind,discipline,book,custom=false}:{name:string;kind?:ContentKind;discipline?:string;book?:string;custom?:boolean}){
  const entry=custom?undefined:resolveContent(name,{kind,discipline,book});
  return entry?<ContentDetails id={entry.id} name={name} book={book}/>:null;
}
