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

## Campos de Branding

- Nome do aplicativo: `Carniçal`.
- Logotipo: `public/logo-carnical-120.png` (PNG quadrado de 120 × 120 pixels, abaixo de 1 MB). A versão de 512 pixels fica em `public/logo-carnical-512.png`.
- Página inicial do aplicativo: `https://carnical.vercel.app/sobre`.
- Política de Privacidade: `https://carnical.vercel.app/privacidade`.
- Termos de Serviço: `https://carnical.vercel.app/termos`.
- E-mail de suporte e contato do desenvolvedor: a conta monitorada pelo responsável pelo projeto.
- Domínios usados nas URLs: `carnical.vercel.app` e `gqsjizolvrvlnhefnqfu.supabase.co`, sem protocolo ou caminho. A verificação de marca pode exigir comprovação de propriedade dos domínios; os domínios compartilhados dos provedores podem exigir uma solução com domínio próprio.

O logotipo é opcional. Para um aplicativo externo em produção, sua exibição depende da verificação de marca do Google. Se continuar em modo de teste, cadastre os jogadores como usuários de teste em Público-alvo. Publicar a configuração no Google não substitui ativar o provedor no Supabase.

Requisitos de Branding: https://support.google.com/cloud/answer/15549049?hl=pt-BR.

Referência: https://supabase.com/docs/guides/auth/social-login/auth-google e https://supabase.com/docs/guides/auth/auth-identity-linking.
