"use server";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { cookies } from "next/headers";
import { stageCookieWrites } from "../../../lib/supabase/cookie-transaction";
import { safeAuthNext, sendFailure } from "../auth-flow";
import { googleLoginEnabled } from "../../../lib/supabase/auth-settings";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const next = safeAuthNext(String(formData.get("return_to") || "/"));
  const login = new URLSearchParams({ return_to: next });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect(`/auth/login?${login}&error=email`);
  const cookieStore = await cookies();
  const staged = stageCookieWrites(writes => { writes.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); });
  const supabase = await createClient(staged.setAll);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const callback = new URL("/auth/confirm", siteUrl);
  callback.searchParams.set("next", next);
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callback.toString() } });
  if (error) {
    const failure = sendFailure(error);
    console.warn("Magic link send failed", { code: error.code, status: error.status });
    redirect(`/auth/login?${login}&error=${failure.reason}&wait=${failure.wait}`);
  }
  await staged.commit();
  redirect(`/auth/login?${login}&sent=1&wait=60`);
}

export async function signInGoogle(formData: FormData) {
  const next = safeAuthNext(String(formData.get("return_to") || "/"));
  if (!await googleLoginEnabled()) redirect(`/auth/login?error=google_config&return_to=${encodeURIComponent(next)}`);
  const cookieStore = await cookies();
  const staged = stageCookieWrites(writes => { writes.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); });
  const supabase = await createClient(staged.setAll);
  const callback = new URL("/auth/confirm", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  callback.searchParams.set("next", next);
  callback.searchParams.set("flow", "google");
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback.toString(), skipBrowserRedirect: true } });
  if (error || !data.url) {
    console.warn("Google sign-in failed", { code: error?.code, status: error?.status });
    redirect(`/auth/login?error=oauth&return_to=${encodeURIComponent(next)}`);
  }
  await staged.commit();
  redirect(data.url);
}
