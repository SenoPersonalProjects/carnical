import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { confirmFailure, safeAuthNext } from "../auth-flow";

export async function GET(request: Request) {
  const url = new URL(request.url), code = url.searchParams.get("code"), tokenHash = url.searchParams.get("token_hash"), type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeAuthNext(url.searchParams.get("next"));
  const failureUrl = (reason: string) => new URL(`/auth/login?error=${reason}&return_to=${encodeURIComponent(next)}`, url.origin);
  if (url.searchParams.has("error") || url.searchParams.has("error_code") || (!code && !tokenHash)) return NextResponse.redirect(failureUrl(url.searchParams.get("flow") === "google" ? "oauth" : "expired"));
  const supabase = await createClient();
  const result = code ? await supabase.auth.exchangeCodeForSession(code) : tokenHash && type && ["email", "signup", "magiclink", "recovery", "invite", "email_change"].includes(type) ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type }) : { error: { code: "otp_expired" } };
  if (result.error) {
    console.warn("Magic link confirmation failed", { code: result.error.code });
    return NextResponse.redirect(failureUrl(confirmFailure(result.error)));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
