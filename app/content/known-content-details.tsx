"use client";
import ContentDetails from "./content-details";
import {resolveContent} from "./resolve";
import type {ContentKind} from "./types";
import {SOURCEBOOKS} from "../sourcebooks";
export default function KnownContentDetails({name,kind,discipline,book,sourcebook,custom=false}:{name:string;kind?:ContentKind;discipline?:string;book?:string;sourcebook?:string;custom?:boolean}){
  book=book||SOURCEBOOKS.find(source=>source.value===sourcebook)?.libraryId;
  const entry=custom?undefined:resolveContent(name,{kind,discipline,book});
  return entry?<ContentDetails id={entry.id} name={name} book={book}/>:null;
}
