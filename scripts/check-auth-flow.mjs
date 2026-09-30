import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { createServerClient } from "@supabase/ssr";
import { webcrypto } from "node:crypto";
if (!globalThis.crypto) globalThis.crypto = webcrypto;

function load(relative) {
  const compiled = ts.transpileModule(fs.readFileSync(new URL(relative, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} };
  new Function("module", "exports", compiled)(loaded, loaded.exports);
  return loaded.exports;
}
const { stageCookieWrites } = load("../lib/supabase/cookie-transaction.ts");
const { sendFailure, confirmFailure, safeAuthNext } = load("../app/auth/auth-flow.ts");
assert.equal(sendFailure({ code: "over_email_send_rate_limit" }).reason, "email_limit");
assert.deepEqual(sendFailure({ code: "over_email_send_rate_limit", message: "For security purposes, you can only request this after 56 seconds." }), { reason: "wait", wait: 56 });
assert.equal(sendFailure({ code: "email_address_not_authorized" }).reason, "email_service");
assert.equal(confirmFailure({ code: "bad_code_verifier" }), "browser");
assert.equal(confirmFailure({ code: "otp_expired" }), "expired");
for (const path of ["https://evil.example", "//evil.example", "/\\evil.example", "/auth/login", "/auth/confirm"]) assert.equal(safeAuthNext(path), "/");
assert.equal(safeAuthNext("/play?id=42"), "/play?id=42");

// Exercise the real installed SSR/Auth SDK without sending an email or contacting a server.
const cookieName = "sb-auth-test-auth-token-code-verifier";
const jar = new Map([[cookieName, "existing-link-verifier"]]);
let requests = 0;
function client(status, transaction) {
  return createServerClient("https://auth-test.supabase.co", "sb_publishable_testing", {
    cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: transaction.setAll },
    global: { fetch: async () => {
      requests++;
      return new Response(JSON.stringify(status === 429 ? { code: "over_email_send_rate_limit", error_code: "over_email_send_rate_limit", msg: "email rate limit exceeded" } : {}), { status, headers: { "content-type": "application/json", "x-supabase-api-version": "2024-01-01" } });
    } },
  });
}
const writer = cookies => { for (const cookie of cookies) jar.set(cookie.name, cookie.value); };
const failed = stageCookieWrites(writer);
const { error } = await client(429, failed).auth.signInWithOtp({ email: "test@example.com" });
assert.equal(error.code, "over_email_send_rate_limit");
assert.equal(jar.get(cookieName), "existing-link-verifier", "A failed resend must not replace the browser verifier for an earlier link");
const accepted = stageCookieWrites(writer);
const result = await client(200, accepted).auth.signInWithOtp({ email: "test@example.com" });
assert.equal(result.error, null);
assert.equal(jar.get(cookieName), "existing-link-verifier", "New verifier remains staged until success is committed");
await accepted.commit();
assert.notEqual(jar.get(cookieName), "existing-link-verifier");
assert.equal(requests, 2);
const oauthCookies = stageCookieWrites(writer);
const oauth = await client(200, oauthCookies).auth.signInWithOAuth({ provider: "google", options: { redirectTo: "https://carnical.vercel.app/auth/confirm?next=%2Fplay&flow=google", skipBrowserRedirect: true } });
assert.equal(oauth.error, null);
const oauthUrl = new URL(oauth.data.url);
assert.equal(oauthUrl.searchParams.get("provider"), "google");
assert.equal(oauthUrl.searchParams.get("code_challenge_method"), "s256");
assert.equal(oauthUrl.searchParams.get("redirect_to"), "https://carnical.vercel.app/auth/confirm?next=%2Fplay&flow=google");
assert.equal(requests, 2, "Preparar o login Google não envia e-mail");
console.log("Login conferido: erro 429 preserva o link anterior; envio aceito grava o novo identificador; mensagens e redirecionamentos seguros.");
