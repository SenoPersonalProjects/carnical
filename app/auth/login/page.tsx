import { signIn } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  return <main className="auth-page"><section className="auth-card">
    <p className="eyebrow">FICHAS • REGRAS • SESSÕES</p><h1>Carniçal</h1>
    <p>Entre para acessar suas fichas, regras e ferramentas de sessão.</p>
    {params.sent && <div role="status" className="auth-success">
      <span className="auth-success-icon" aria-hidden="true">✓</span>
      <span><strong>Link enviado!</strong> Confira sua caixa de entrada e a pasta de spam. O link pode ser usado apenas uma vez.</span>
    </div>}
    {params.error && <p role="alert" className="auth-error">Não foi possível enviar o link. Confira o e-mail e tente novamente.</p>}
    <form action={signIn}><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com"/><button type="submit">Enviar link de acesso</button></form>
    <small>Não é necessário criar ou memorizar uma senha.</small>
  </section></main>;
}
