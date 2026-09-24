"use client";

import Link from "next/link";
import { BookOpen, Check, CircleAlert, Info } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { auditSourceUrl, type AuditIssue } from "./character-audit";

export function InconsistencySheet({open,onOpenChange,issues}:{open:boolean;onOpenChange:(open:boolean)=>void;issues:AuditIssue[]}){
  const warnings=issues.filter(issue=>issue.kind==="warning").length;
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="source-sheet audit-sheet sm:max-w-xl"><SheetHeader><SheetTitle>Incoerências da ficha</SheetTitle><SheetDescription>Compara a ficha com a criação padrão dos livros enviados. Nada aqui bloqueia, apaga ou corrige suas escolhas.</SheetDescription></SheetHeader><div className="source-scroll audit-scroll">{issues.length===0?<div className="audit-clear"><Check size={25}/><div><strong>Nenhuma incoerência encontrada</strong><p>A ficha corresponde às validações atualmente normalizadas.</p></div></div>:<><div className="audit-summary"><CircleAlert size={18}/><div><strong>{warnings} {warnings===1?"aviso":"avisos"}</strong><p>{issues.length-warnings>0?`${issues.length-warnings} item(ns) personalizado(s) também identificado(s).`:"Você pode manter todas as escolhas como regras da crônica."}</p></div></div>{issues.map(issue=>{const href=auditSourceUrl(issue);return <article className={`audit-item ${issue.kind}`} key={issue.id}>{issue.kind==="warning"?<CircleAlert size={18}/>:<Info size={18}/>}<div><span>{issue.kind==="warning"?"FORA DA REGRA-BASE":"CONTEÚDO PERSONALIZADO"}</span><h3>{issue.title}</h3><p>{issue.detail}</p>{href&&<Link href={href}><BookOpen size={14}/>Abrir regra e fonte</Link>}</div></article>})}</>}</div></SheetContent></Sheet>
}
