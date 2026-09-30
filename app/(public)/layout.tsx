import Link from "next/link";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <main className="public-page">
    <header className="public-header"><Link href="/sobre" className="public-brand">Carniçal</Link><Link href="/auth/login">Entrar</Link></header>
    <article className="public-article">{children}</article>
    <nav className="public-footer" aria-label="Informações do aplicativo"><Link href="/sobre">Sobre</Link><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos de uso</Link></nav>
  </main>;
}
