
import { UiText } from "../../ui-text";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sobre o Carniçal" };

export default function AboutPage() {
  return <>
    <p className="eyebrow"><UiText text="FICHAS · REGRAS · SESSÕES"/></p>
    <h1><UiText text="Seu apoio para jogar Vampiro V5."/></h1>
    <p><UiText text="O Carniçal é um aplicativo gratuito para criar personagens, consultar conteúdo de regras e acompanhar sessões de Vampiro: A Máscara, 5ª edição."/></p>
    <h2><UiText text="O que você pode fazer"/></h2>
    <ul><li><UiText text="Criar e salvar fichas com clãs, habilidades, disciplinas e fontes selecionadas."/></li><li><UiText text="Pesquisar a biblioteca para localizar assuntos nos livros disponíveis."/></li><li><UiText text="Resolver testes com dados de Fome e visualizar sucessos, críticos e falhas bestiais."/></li><li><UiText text="Participar de crônicas: o mestre define regras de progressão e concede experiência ao grupo ou a cada personagem."/></li></ul>
    <h2><UiText text="Acesso e conta"/></h2>
    <p><UiText text="Uma conta permite guardar suas fichas e crônicas. Quando o login com Google está habilitado, ele usa seu e-mail e perfil para identificar sua conta. O aplicativo não solicita acesso ao Gmail, Drive ou Agenda. Use o mesmo e-mail da sua conta anterior para continuar acessando suas fichas."/></p>
    <p><Link className="public-cta" href="/auth/login"><UiText text="Acessar o Carniçal"/></Link></p>
    <h2><UiText text="Um projeto da comunidade"/></h2>
    <p><UiText text="Este é um projeto independente e não oficial. As marcas e os materiais de Vampiro: A Máscara pertencem aos respectivos titulares. As ferramentas auxiliam o jogo; as decisões da mesa continuam com os jogadores e o mestre."/></p>
    <p><UiText text="Contato: "/><a href="mailto:viniciusbladeuchiha@gmail.com"><UiText text="viniciusbladeuchiha@gmail.com"/></a>.</p>
    <p><UiText text="Saiba como os dados são usados na "/><Link href="/privacidade"><UiText text="Política de Privacidade"/></Link> <UiText text=" e consulte os "/><Link href="/termos"><UiText text="Termos de Uso"/></Link>.</p>
  </>;
}
