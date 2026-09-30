import LoginForm, { GoogleLoginForm } from "./login-form";
import { LOGIN_ERRORS, safeAuthNext } from "../auth-flow";
import { googleLoginEnabled } from "../../../lib/supabase/auth-settings";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const googleEnabled = await googleLoginEnabled();
  const next = safeAuthNext(params.return_to);
  const wait = Math.max(0, Math.min(3600, Math.trunc(Number(params.wait)) || 0));
  return <main className="auth-page"><section className="auth-card">
    <p className="eyebrow">FICHAS • REGRAS • SESSÕES</p><h1>Carniçal</h1>
    <p>Entre para acessar suas fichas, regras e ferramentas de sessão.</p>
    {params.sent && <div role="status" className="auth-success">
      <span className="auth-success-icon" aria-hidden="true">✓</span>
      <span><strong>Link enviado!</strong> Confira sua caixa de entrada e a pasta de spam. Abra o link mais recente no mesmo navegador em que pediu o acesso. Cada link pode ser usado apenas uma vez.</span>
    </div>}
    {params.error && <p role="alert" className="auth-error">{LOGIN_ERRORS[params.error] || LOGIN_ERRORS.send}</p>}
    {googleEnabled && <GoogleLoginForm next={next}/>}
    {googleEnabled ? <details className="auth-alternative"><summary>Receber link por e-mail</summary><LoginForm key={`${params.sent || ""}:${params.error || ""}:${wait}`} next={next} wait={wait}/></details> : <LoginForm key={`${params.sent || ""}:${params.error || ""}:${wait}`} next={next} wait={wait}/>}
    <small>{googleEnabled ? "Use a conta Google com o mesmo e-mail da sua conta no Carniçal para manter suas fichas." : "Não é necessário criar ou memorizar uma senha."}</small>
    <nav className="public-footer" aria-label="Informações do aplicativo"><Link href="/sobre">Sobre</Link><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos de uso</Link></nav>
  </section></main>;
}
