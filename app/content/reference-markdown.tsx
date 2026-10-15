"use client";
import { Fragment,useMemo } from "react";
type Block={kind:"heading"|"paragraph"|"list"|"quote"|"table"|"rule";text?:string;level?:number;items?:string[];header?:string[];rows?:string[][]};
function cells(line:string){return line.trim().replace(/^\||\|$/g,"").split(/(?<!\\)\|/).map(cell=>cell.trim().replaceAll("\\|","|"));}
export function parseReferenceMarkdown(content:string):Block[]{
  const lines=content.replaceAll("\r","").split("\n"),blocks:Block[]=[],paragraph:string[]=[];
  const flush=()=>{if(paragraph.length){blocks.push({kind:"paragraph",text:paragraph.join(" ")});paragraph.length=0}};
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trim();if(!line){flush();continue}
    if(line.includes("|")&&i+1<lines.length&&/^\|?\s*:?-{3,}/.test(lines[i+1].trim())){
      flush();const header=cells(line),rows:string[][]=[];i+=2;while(i<lines.length&&lines[i].includes("|")){rows.push(cells(lines[i]));i++}i--;blocks.push({kind:"table",header,rows});continue;
    }
    const heading=line.match(/^(#{1,6})\s+(.+)$/);if(heading){flush();blocks.push({kind:"heading",level:heading[1].length,text:heading[2]});continue}
    if(/^[-*_]{3,}$/.test(line)){flush();blocks.push({kind:"rule"});continue}
    if(/^[-*•▪■]\s+|^\d+[.)]\s+/.test(line)){
      flush();const items:string[]=[];while(i<lines.length&&/^[-*•▪■]\s+|^\d+[.)]\s+/.test(lines[i].trim())){items.push(lines[i].trim().replace(/^[-*•▪■]\s+|^\d+[.)]\s+/,""));i++}i--;blocks.push({kind:"list",items});continue;
    }
    if(line.startsWith(">")){flush();blocks.push({kind:"quote",text:line.replace(/^>\s?/,"")});continue}
    paragraph.push(line);
  }flush();return blocks;
}
function Highlight({text,query}:{text:string;query:string}){
  if(!query.trim())return text;
  const escaped=query.trim().replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  return text.split(new RegExp(`(${escaped})`,"gi")).map((part,index)=>part.toLocaleLowerCase()===query.trim().toLocaleLowerCase()?<mark key={index}>{part}</mark>:part);
}
function Inline({text,query}:{text:string;query:string}){
  const parts=text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^\s)]+\))/g);
  return parts.map((part,index)=>{
    if(part.startsWith("**"))return <strong key={index}><Highlight text={part.slice(2,-2)} query={query}/></strong>;
    const link=part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if(link&&(/^(https?:\/\/)/.test(link[2])||link[2].startsWith("/rules/source?")))return <a key={index} href={link[2]} target="_blank" rel="noreferrer"><Highlight text={link[1]} query={query}/></a>;
    return <Fragment key={index}><Highlight text={part} query={query}/></Fragment>;
  });
}
export default function ReferenceMarkdown({content,query=""}:{content:string;query?:string}){
  const blocks=useMemo(()=>parseReferenceMarkdown(content),[content]);
  return <div className="reference-markdown">{blocks.map((block,index)=>{
    if(block.kind==="rule")return <hr key={index}/>;
    if(block.kind==="heading")return block.level===1||block.level===2?<h2 key={index}><Inline text={block.text||""} query={query}/></h2>:<h3 key={index}><Inline text={block.text||""} query={query}/></h3>;
    if(block.kind==="list")return <ul key={index}>{block.items?.map((item,i)=><li key={i}><Inline text={item} query={query}/></li>)}</ul>;
    if(block.kind==="quote")return <blockquote key={index}><Inline text={block.text||""} query={query}/></blockquote>;
    if(block.kind==="table")return <div key={index} className="reference-table" tabIndex={0} role="region" aria-label="Tabela / Table"><table><thead><tr>{block.header?.map((cell,i)=><th key={i} scope="col"><Inline text={cell} query={query}/></th>)}</tr></thead><tbody>{block.rows?.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}><Inline text={cell} query={query}/></td>)}</tr>)}</tbody></table></div>;
    return <p key={index}><Inline text={block.text||""} query={query}/></p>;
  })}</div>;
}
