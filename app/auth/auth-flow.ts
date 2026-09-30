type AuthFailure = { code?: string; status?: number; message?: string };

export function safeAuthNext(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local" || url.pathname.startsWith("/auth/")) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return "/"; }
}

export function sendFailure(error: AuthFailure) {
  const seconds = error.message?.match(/after (\d+) seconds/i)?.[1];
  if (seconds) return { reason: "wait", wait: Math.max(1, Math.min(3600, Number(seconds))) };
  if (error.code === "over_email_send_rate_limit") return { reason: "email_limit", wait: 60 };
  if (error.status === 429 || error.code === "over_request_rate_limit") return { reason: "wait", wait: 60 };
  if (error.code === "email_address_not_authorized") return { reason: "email_service", wait: 0 };
  if (error.code === "email_address_invalid" || error.code === "validation_failed") return { reason: "email", wait: 0 };
  return { reason: "send", wait: 0 };
}

export function confirmFailure(error: AuthFailure) {
  if (["bad_code_verifier", "flow_state_not_found", "flow_state_expired"].includes(error.code || "")) return "browser";
  return "expired";
}

export const LOGIN_ERRORS: Record<string, string> = {
  email: "Digite um endereço de e-mail válido.",
  wait: "Aguarde o prazo indicado antes de solicitar outro link. Se já recebeu um, tente abrir o link mais recente no mesmo navegador em que pediu o acesso.",
  email_limit: "O serviço de e-mail atingiu o limite de envios do site. Tente mais tarde. Se continuar, avise o responsável pelo Carniçal para configurar a capacidade de envio.",
  email_service: "O serviço de e-mail ainda não permite enviar para este endereço. O responsável pelo Carniçal precisa configurar o envio de e-mails para os jogadores.",
  send: "O serviço de e-mail não conseguiu enviar o link. Tente mais tarde; se continuar, avise o responsável pelo Carniçal.",
  expired: "Este link expirou, já foi usado ou foi substituído por um mais recente. Solicite um novo link e use apenas o último e-mail recebido.",
  browser: "Não foi possível confirmar o acesso neste navegador. Abra o link mais recente no mesmo navegador em que solicitou o acesso. Se não funcionar, solicite um novo link.",
  config: "O acesso está temporariamente indisponível. Avise o responsável pelo Carniçal.",
  google_config: "O login com Google ainda precisa ser ativado pelo responsável pelo Carniçal.",
  oauth: "A entrada com Google não foi concluída. Tente novamente e permita o acesso ao seu nome e e-mail para entrar no Carniçal.",
};
