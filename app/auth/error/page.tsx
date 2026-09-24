import Link from "next/link";
export default function AuthErrorPage() { return <main className="auth-page"><section className="auth-card"><p className="eyebrow">CARNIÇAL</p><h1>O link não funcionou</h1><p>Ele pode ter expirado ou já ter sido usado.</p><Link href="/auth/login">Solicitar um novo link</Link></section></main>; }
