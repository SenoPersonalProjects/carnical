"use client";

import Link from "next/link";
import { BookOpen, Check, CircleAlert, Info } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { auditSourceUrl, type AuditIssue } from "./character-audit";

export function InconsistencySheet({open,onOpenChange,issues,onToggleApproval}:{open:boolean;onOpenChange:(open:boolean)=>void;issues:AuditIssue[];onToggleApproval?:(id:string,approved:boolean)=>void}){
  const warnings=issues.filter(issue=>issue.kind==="warning").length;
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="source-sheet audit-sheet sm:max-w-xl"><SheetHeader><SheetTitle>Incoerências da ficha</SheetTitle><SheetDescription>Compara a ficha com as regras ativas. Nada aqui bloqueia, apaga ou corrige suas escolhas.</SheetDescription></SheetHeader><div className="source-scroll audit-scroll">{issues.length===0?<div className="audit-clear"><Check size={25}/><div><strong>Nenhuma incoerência encontrada</strong><p>A ficha corresponde às validações atualmente normalizadas.</p></div></div>:<><div className="audit-summary"><CircleAlert size={18}/><div><strong>{warnings} {warnings===1?"aviso":"avisos"}</strong><p>Exceções podem ser permitidas pela crônica e continuam rastreáveis.</p></div></div>{issues.map(issue=>{const href=auditSourceUrl(issue),approved=issue.kind==="approved";return <article className={`audit-item ${issue.kind}`} key={issue.id}>{approved?<Check size={18}/>:issue.kind==="warning"?<CircleAlert size={18}/>:<Info size={18}/>}<div><span>{approved?"PERMITIDO PELA CRÔNICA":issue.kind==="warning"?"FORA DA REGRA ATIVA":"CONTEÚDO PERSONALIZADO"}</span><h3>{issue.title}</h3><p>{issue.detail}</p><div className="audit-actions">{href&&<Link href={href}><BookOpen size={14}/>Abrir regra e fonte</Link>}{onToggleApproval&&issue.kind!=="info"&&<button onClick={()=>onToggleApproval(issue.id,!approved)}>{approved?"Remover permissão":"Permitir na crônica"}</button>}</div></div></article>})}</>}</div></SheetContent></Sheet>
}
