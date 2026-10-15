"use client";
import { UiText, useUiText } from "../ui-text";
import Link from "next/link";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const t=useUiText();

  return <main className="public-page">
    <header className="public-header"><Link href="/sobre" className="public-brand"><UiText text="Carniçal"/></Link><Link href="/auth/login"><UiText text="Entrar"/></Link></header>
    <article className="public-article">{children}</article>
    <nav className="public-footer" aria-label={t("Informações do aplicativo")}><Link href="/sobre"><UiText text="Sobre"/></Link><Link href="/privacidade"><UiText text="Privacidade"/></Link><Link href="/termos"><UiText text="Termos de uso"/></Link></nav>
  </main>;
}
