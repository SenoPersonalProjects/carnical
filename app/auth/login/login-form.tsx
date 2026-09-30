"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, signInGoogle } from "./actions";

export default function LoginForm({ next, wait }: { next: string; wait: number }) {
  const [remaining, setRemaining] = useState(wait);
  useEffect(() => {
    if (wait <= 0) return;
    const deadline = Date.now() + wait * 1000;
    const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [wait]);
  return <form action={signIn}>
    <input type="hidden" name="return_to" value={next}/>
    <label htmlFor="email">E-mail</label>
    <input id="email" name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com"/>
    <SendButton remaining={remaining}/>
  </form>;
}

function SendButton({ remaining }: { remaining: number }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending || remaining > 0} aria-disabled={pending || remaining > 0}>{pending ? "Enviando…" : remaining > 0 ? `Aguarde ${remaining}s para pedir outro link` : "Enviar link de acesso"}</button>;
}

export function GoogleLoginForm({ next }: { next: string }) {
  return <form action={signInGoogle}><input type="hidden" name="return_to" value={next}/><GoogleButton/></form>;
}

function GoogleButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Abrindo Google…" : "Entrar com Google"}</button>;
}
