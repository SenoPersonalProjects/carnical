import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sobre o Carniçal" };

export default function AboutPage() {
  return <>
    <p className="eyebrow">FICHAS · REGRAS · SESSÕES</p>
    <h1>Seu apoio para jogar Vampiro V5.</h1>
    <p>O Carniçal é um aplicativo gratuito para criar personagens, consultar conteúdo de regras e acompanhar sessões de Vampiro: A Máscara, 5ª edição.</p>
    <h2>O que você pode fazer</h2>
    <ul><li>Criar e salvar fichas com clãs, habilidades, disciplinas e fontes selecionadas.</li><li>Pesquisar a biblioteca para localizar assuntos nos livros disponíveis.</li><li>Resolver testes com dados de Fome e visualizar sucessos, críticos e falhas bestiais.</li><li>Participar de crônicas: o mestre define regras de progressão e concede experiência ao grupo ou a cada personagem.</li></ul>
    <h2>Acesso e conta</h2>
    <p>Uma conta permite guardar suas fichas e crônicas. Quando o login com Google está habilitado, ele usa seu e-mail e perfil para identificar sua conta. O aplicativo não solicita acesso ao Gmail, Drive ou Agenda. Use o mesmo e-mail da sua conta anterior para continuar acessando suas fichas.</p>
    <p><Link className="public-cta" href="/auth/login">Acessar o Carniçal</Link></p>
    <h2>Um projeto da comunidade</h2>
    <p>Este é um projeto independente e não oficial. As marcas e os materiais de Vampiro: A Máscara pertencem aos respectivos titulares. As ferramentas auxiliam o jogo; as decisões da mesa continuam com os jogadores e o mestre.</p>
    <p>Contato: <a href="mailto:viniciusbladeuchiha@gmail.com">viniciusbladeuchiha@gmail.com</a>.</p>
    <p>Saiba como os dados são usados na <Link href="/privacidade">Política de Privacidade</Link> e consulte os <Link href="/termos">Termos de Uso</Link>.</p>
  </>;
}
