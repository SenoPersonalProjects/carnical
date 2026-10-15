import { NextRequest,NextResponse } from "next/server";
import { CONTENT_CATALOG,foldContent,catalogEntry } from "../../content/catalog";
import type { ContentResponse } from "../../content/types";

export async function GET(request:NextRequest) {
  const params=request.nextUrl.searchParams,locale=params.get("lang")==="en"?"en":"pt-BR",id=params.get("id");
  if(!id){
    const query=foldContent(params.get("q")||""),kind=params.get("kind"),book=params.get("book");
    if(query.length>100)return NextResponse.json({error:"Invalid query"},{status:400});
    const entries=CONTENT_CATALOG.filter(entry=>(!kind||entry.kind===kind)&&(!book||entry.versions.some(version=>version.book===book))&&(!query||[...Object.values(entry.names),...entry.aliases].some(name=>foldContent(name).includes(query))));
    return NextResponse.json({entries:entries.map(entry=>{const versions=entry.versions.filter(version=>!book||version.book===book);return {id:entry.id,kind:entry.kind,name:versions[0]?.names?.[locale]||entry.names[locale],names:entry.names,aliases:entry.aliases,discipline:entry.discipline,level:versions[0]?.level??entry.level,versions:versions.map(version=>({id:version.id,book:version.book,source:version.sourceTitle,names:version.names,level:version.level,requirements:version.requirements,pages:version.pages}))}})});
  }
  const entry=catalogEntry(id);
  if(!entry)return NextResponse.json({error:"Conteúdo não encontrado."},{status:404});
  const requestedVersion=params.get("version"),requestedBook=params.get("book");
  const version=requestedVersion?entry.versions.find(version=>version.id===requestedVersion):requestedBook?entry.versions.find(version=>version.book===requestedBook):entry.versions[0];
  if(!version||(requestedBook&&version.book!==requestedBook))return NextResponse.json({error:"Fonte não encontrada."},{status:404});
  const result:ContentResponse={id:entry.id,name:version.names?.[locale]||entry.names[locale],kind:entry.kind,versionId:version.id,locale,source:version.sourceTitle,sections:version.descriptions[locale],pages:version.pages.map(page=>({...page,url:`/rules/source?book=${encodeURIComponent(version.book)}&page=${page.pdfPage}`})),versions:entry.versions.map(version=>({id:version.id,source:version.sourceTitle}))};
  return NextResponse.json(result);
}
