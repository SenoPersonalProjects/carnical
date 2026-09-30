import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de uso — Carniçal" };

export default function TermsPage() {
  return <>
    <h1>Termos de Uso</h1><p className="public-date">Atualizados em 30 de setembro de 2026.</p>
    <h2>Uso do aplicativo</h2><p>O Carniçal é uma ferramenta gratuita e independente para organizar fichas, consultar regras e acompanhar sessões de Vampiro: A Máscara, 5ª edição. Ao utilizá-lo, respeite estes termos, os demais participantes e os direitos dos titulares dos materiais consultados.</p>
    <h2>Conta e conteúdo</h2><p>Use uma conta à qual você tenha acesso legítimo e proteja seu acesso. Você é responsável pelo conteúdo que adiciona e deve ter autorização para compartilhá-lo. Seus textos e personagens próprios continuam sendo seus; salvá-los permite ao serviço armazená-los e exibi-los conforme as permissões da conta e da crônica.</p>
    <p>Ao vincular uma ficha a uma crônica, você permite que o mestre consulte essa ficha e aplique as regras e concessões de experiência da crônica. Confira as regras da mesa antes de entrar.</p>
    <h2>Regras e materiais de terceiros</h2><p>O aplicativo não é um produto oficial nem substitui os livros ou as decisões do mestre. Marcas, textos e outros materiais de terceiros pertencem aos respectivos titulares. O acesso à ferramenta não concede direitos de redistribuição desses materiais.</p>
    <h2>Conduta</h2><p>Não tente acessar contas ou fichas sem autorização, contornar permissões, comprometer o serviço ou publicar conteúdo ilegal ou que viole direitos de outras pessoas. Problemas ou uso indevido podem ser comunicados ao contato do projeto.</p>
    <h2>Disponibilidade e mudanças</h2><p>O projeto pode passar por manutenção, mudanças ou interrupções. Não há garantia de disponibilidade contínua. Mantenha uma cópia própria das informações importantes da sua mesa e comunique resultados incorretos encontrados nas ferramentas.</p>
    <h2>Contato e privacidade</h2><p>Para suporte, solicitações sobre sua conta ou dúvidas sobre estes termos, escreva para <a href="mailto:viniciusbladeuchiha@gmail.com">viniciusbladeuchiha@gmail.com</a>. O tratamento de dados está descrito na <a href="/privacidade">Política de Privacidade</a>.</p>
  </>;
}
