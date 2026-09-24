import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url), code = url.searchParams.get("code"), tokenHash = url.searchParams.get("token_hash"), type = url.searchParams.get("type") as EmailOtpType | null;
  const requestedNext = url.searchParams.get("next") || "/", next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
  const supabase = await createClient();
  const result = code ? await supabase.auth.exchangeCodeForSession(code) : tokenHash && type ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type }) : { error: new Error("Missing token") };
  return NextResponse.redirect(new URL(result.error ? "/auth/error" : next, url.origin));
}
