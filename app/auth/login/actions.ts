"use server";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email || !email.includes("@")) redirect("/auth/login?error=email");
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${siteUrl}/auth/confirm?next=/` } });
  if (error) redirect("/auth/login?error=send");
  redirect("/auth/login?sent=1");
}
