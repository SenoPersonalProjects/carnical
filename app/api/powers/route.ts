import { NextRequest, NextResponse } from "next/server";
import { POWER_CATALOG, rulesUrl } from "../../game-rules";
import library from "../../rules/rules-data.json";
import corePages from "../../play/core-power-pages.json";

export async function GET(request:NextRequest) {
  const id=request.nextUrl.searchParams.get("id"),power=POWER_CATALOG.find(item=>item.id===id);
  if(!power)return NextResponse.json({error:"Poder não encontrado."},{status:404});
  const chapter=library.books.find(book=>book.id===power.source.book)?.chapters.find(item=>item.id===power.source.chapter);
  const content=chapter?.content||"";
  const fold=(text:string)=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const position=fold(content).indexOf(fold(power.source.query));
  // Include the surrounding source text, including system and resistance rules.
  const excerpt=position>=0?content.slice(Math.max(0,content.lastIndexOf("\n",position)),position+12000):content.slice(0,12000);
  const range=power.source.book==="core-v5"?power.source.label.match(/pp\. (\d+)[–−-](\d+)/):null;
  const pages=range?Array.from({length:Number(range[2])-Number(range[1])+1},(_,i)=>Number(range[1])+i):[];
  const initialPage=(corePages as Record<string,number>)[power.id]??pages[0];
  return NextResponse.json({power,excerpt,pages,initialPage,url:rulesUrl(power.source)});
}
