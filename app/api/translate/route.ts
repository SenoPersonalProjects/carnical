import { NextRequest, NextResponse } from "next/server";

type TranslationBody={texts?:unknown;source?:unknown;target?:unknown};
const LANGUAGE=new Set(["pt","en"]);

export async function POST(request:NextRequest){
  let body:TranslationBody;
  try{body=await request.json() as TranslationBody}catch{return NextResponse.json({error:"Invalid request."},{status:400})}
  const source=String(body.source||""),target=String(body.target||""),texts=Array.isArray(body.texts)?body.texts.map(String):[];
  if(!LANGUAGE.has(source)||!LANGUAGE.has(target)||texts.length===0||texts.length>20||texts.some(text=>text.length>4500)||texts.reduce((sum,text)=>sum+text.length,0)>70000)return NextResponse.json({error:"Invalid translation batch."},{status:400});
  if(source===target)return NextResponse.json({translations:texts});
  try{
    const translations=await Promise.all(texts.map(async text=>{
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
      try{
        const response=await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t`,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded;charset=UTF-8"},body:new URLSearchParams({q:text}),signal:controller.signal});
        if(!response.ok)throw new Error("translation unavailable");
        const result=await response.json() as Array<Array<Array<string>>>;
        return Array.isArray(result?.[0])?result[0].map(part=>part?.[0]||"").join(""):text;
      }finally{clearTimeout(timeout)}
    }));
    return NextResponse.json({translations},{headers:{"Cache-Control":"public, max-age=86400"}});
  }catch{return NextResponse.json({error:"Translation service unavailable."},{status:502})}
}
