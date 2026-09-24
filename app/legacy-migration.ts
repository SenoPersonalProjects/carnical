type MeritLike={name:string;dots:number;source:string;notes:string};
type DataLike={advantages?:string;flaws?:string;merits?:MeritLike[];flawItems?:MeritLike[];[key:string]:unknown};

function parseLegacy(value:string|undefined,kind:"Vantagem"|"Defeito"):MeritLike[]{
  if(!value?.trim())return[];
  return value.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
    const marks=line.match(/[•●]+/g)?.join("")??"";
    const numeric=line.match(/(?:^|\s)([1-5])\s*(?:pontos?|pts?)?$/i)?.[1];
    const dots=marks.length||Number(numeric)||1;
    const name=line.replace(/[•●]+/g,"").replace(/(?:\s|—|-)*[1-5]\s*(?:pontos?|pts?)?$/i,"").replace(/^\*+|\*+$/g,"").trim();
    return{name:name||kind,dots:Math.min(5,Math.max(1,dots)),source:"core_v5_ptbr",notes:"Migrado automaticamente do formato antigo."};
  });
}

export function migrateLegacyData<T extends DataLike>(data:T):{data:T;migrated:boolean}{
  let migrated=false;
  const next={...data};
  if((!next.merits||next.merits.length===0)&&next.advantages?.trim()){next.merits=parseLegacy(next.advantages,"Vantagem");migrated=true}
  if((!next.flawItems||next.flawItems.length===0)&&next.flaws?.trim()){next.flawItems=parseLegacy(next.flaws,"Defeito");migrated=true}
  return{data:next as T,migrated};
}
