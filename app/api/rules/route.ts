import { NextRequest, NextResponse } from "next/server";
import library from "../../rules/rules-data.json";

type Chapter = { id:string; title:string; section:string; content:string };
type Book = { id:string; title:string; subtitle:string; language:string; chapters:Chapter[] };

const books=library.books as Book[];

export async function GET(request:NextRequest) {
  const {searchParams}=request.nextUrl;
  const bookId=searchParams.get("book")||books[0]?.id;
  const chapterId=searchParams.get("chapter");
  const query=searchParams.get("q")?.trim()||"";
  const book=books.find(item=>item.id===bookId);
  if(!book)return NextResponse.json({error:"Livro não encontrado."},{status:404});
  if(query){
    const normalized=query.toLocaleLowerCase("pt-BR");
    const results=book.chapters.map(chapter=>{const haystack=`${chapter.title}\n${chapter.content}`,lower=haystack.toLocaleLowerCase("pt-BR");let count=0,at=0;while((at=lower.indexOf(normalized,at))>=0){count++;at+=normalized.length||1}const first=lower.indexOf(normalized),start=Math.max(0,first-90),end=Math.min(haystack.length,first+normalized.length+130);return{chapterId:chapter.id,count,snippet:first>=0?`${start>0?"…":""}${haystack.slice(start,end).replace(/\s+/g," ")}${end<haystack.length?"…":""}`:""}}).filter(result=>result.count>0);
    return NextResponse.json({results});
  }
  const chapter=book.chapters.find(item=>item.id===chapterId)??book.chapters[0];
  if(!chapter)return NextResponse.json({error:"Capítulo não encontrado."},{status:404});
  return NextResponse.json({chapter});
}
