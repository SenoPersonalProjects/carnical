import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidade — Carniçal" };

export default function PrivacyPage() {
  return <>
    <h1>Política de Privacidade</h1><p className="public-date">Atualizada em 30 de setembro de 2026.</p>
    <p>Esta página explica o uso de dados no Carniçal, aplicativo independente para fichas e sessões de Vampiro V5. O responsável pelo projeto pode ser contatado em <a href="mailto:viniciusbladeuchiha@gmail.com">viniciusbladeuchiha@gmail.com</a>.</p>
    <h2>Dados usados pelo aplicativo</h2>
    <ul><li><strong>Conta:</strong> e-mail, identificador de usuário e informações de autenticação. Ao entrar com Google, o Supabase recebe informações básicas de perfil, como nome e imagem, quando fornecidas pelo Google, para identificar sua conta.</li><li><strong>Conteúdo salvo:</strong> fichas, histórias, anotações, características dos personagens, crônicas, regras e registros de experiência que você ou o mestre adicionam.</li><li><strong>Dados técnicos:</strong> cookies de sessão e registros operacionais dos serviços de hospedagem e autenticação, que podem incluir endereço IP, horários e erros.</li></ul>
    <p>Esses dados permitem autenticar usuários, salvar e recuperar conteúdo, aplicar as permissões das crônicas e investigar problemas de funcionamento. O login com Google não solicita acesso às suas mensagens, arquivos do Drive ou Agenda.</p>
    <h2>Quem pode acessar</h2>
    <p>Você acessa suas próprias fichas. Ao associar uma ficha a uma crônica real, o mestre responsável pode consultar essa ficha e gerenciar as regras e a experiência da crônica. Evite incluir informações pessoais sensíveis nas histórias e anotações de personagens.</p>
    <p>O Supabase fornece autenticação e armazenamento em banco de dados; a Vercel hospeda o aplicativo. Esses serviços processam dados necessários ao funcionamento e seguem suas próprias políticas. Ao solicitar uma tradução na biblioteca, o texto solicitado é enviado ao serviço de tradução do Google.</p>
    <h2>Cookies e preferências</h2>
    <p>Cookies mantêm sua sessão de acesso. O navegador também guarda suas preferências de idioma e tema localmente. Limpar esses dados pode encerrar a sessão ou restaurar as preferências padrão.</p>
    <h2>Conservação e pedidos sobre seus dados</h2>
    <p>As informações salvas permanecem no serviço para permitir o uso contínuo da conta. Para solicitar acesso, correção ou exclusão dos dados da sua conta, escreva para o contato acima. A identidade do solicitante será verificada antes de disponibilizar ou excluir informações. Cópias de segurança e registros técnicos podem permanecer conforme os prazos dos provedores.</p>
    <p>Você pode revogar a conexão do Carniçal nas configurações da sua conta Google. Revogar essa conexão não exclui automaticamente as fichas já salvas no Carniçal; solicite a exclusão pelo contato do projeto.</p>
    <h2>Alterações</h2><p>Esta página será atualizada quando o tratamento de dados do aplicativo mudar. A data no início identifica a versão vigente.</p>
  </>;
}
