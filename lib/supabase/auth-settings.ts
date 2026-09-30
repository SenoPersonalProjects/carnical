export async function googleLoginEnabled() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return false;
  try {
    const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key }, cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return false;
    const settings = await response.json() as { external?: { google?: boolean } };
    return settings.external?.google === true;
  } catch { return false; }
}
