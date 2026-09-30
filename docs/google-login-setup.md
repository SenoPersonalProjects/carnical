# Ativar login gratuito com Google

O site mostra “Entrar com Google” automaticamente quando o provedor Google estiver ativo no Supabase. Não é necessário SMTP nem um plano pago para esse fluxo.

1. Abra https://console.cloud.google.com/auth/overview e selecione ou crie um projeto para o Carniçal.
2. Configure o Google Auth Platform: nome Carniçal, e-mail de suporte do responsável, público externo e acesso somente a `openid`, e-mail e perfil. Evite escopos de outros produtos.
3. Em Clientes, crie um cliente OAuth do tipo Aplicativo da Web.
4. Origem JavaScript autorizada: `https://carnical.vercel.app`.
5. URI de redirecionamento autorizada: `https://gqsjizolvrvlnhefnqfu.supabase.co/auth/v1/callback`.
6. Copie o ID e o segredo do cliente diretamente para o provedor Google em https://supabase.com/dashboard/project/gqsjizolvrvlnhefnqfu/auth/providers e ative o provedor. Não coloque o segredo no Git, em variáveis públicas ou em mensagens.
7. No Supabase, confira Site URL `https://carnical.vercel.app` e a URL permitida `https://carnical.vercel.app/auth/confirm` em https://supabase.com/dashboard/project/gqsjizolvrvlnhefnqfu/auth/url-configuration.
8. No Google, publique o aplicativo para o público externo. Se ele permanecer em testes, adicione os jogadores como usuários de teste para permitir o acesso.
9. Teste “Entrar com Google” no site com o mesmo e-mail de uma conta existente. Confira o retorno ao site e a preservação das fichas e crônicas. Teste também com uma conta nova.

O Supabase associa identidades com o mesmo e-mail verificado. Não use um endereço Google diferente se quiser acessar as fichas da conta anterior.

Referência: https://supabase.com/docs/guides/auth/social-login/auth-google e https://supabase.com/docs/guides/auth/auth-identity-linking.
