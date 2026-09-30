import type { SetAllCookies } from "@supabase/ssr";

// OTP requests write a new PKCE verifier before the email service responds.
// Commit those writes only after a successful send, preserving an earlier link on failure.
export function stageCookieWrites(writer: SetAllCookies) {
  const pending = new Map<string, Parameters<SetAllCookies>[0][number]>();
  return {
    setAll: ((cookies) => { for (const cookie of cookies) pending.set(cookie.name, cookie); }) as SetAllCookies,
    commit: () => writer([...pending.values()]),
  };
}
