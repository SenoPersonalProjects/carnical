# Carniçal

Assistente digital para criar personagens, consultar regras e jogar **Vampiro: A Máscara 5ª Edição**.

O Carniçal reúne criação assistida, auditoria não bloqueante de regras, ficha operacional, rolador V5, biblioteca pesquisável e suporte a português e inglês.

## Estado do projeto

Esta branch prepara a versão portátil do projeto para:

- **Next.js 16** e React 19;
- **Vercel** para aplicação e APIs;
- **Supabase Auth** com link mágico por e-mail;
- **Supabase Postgres** para armazenamento das fichas;
- Row Level Security para isolar os dados de cada usuário.

A versão publicada no ChatGPT Sites continua independente desta infraestrutura.

## Recursos atuais

- criação e edição de personagens;
- modo de jogo com Vitalidade, Força de Vontade, Fome, Humanidade e Máculas;
- rolador com Dados de Fome, críticos, crítico bagunçado e falha bestial;
- painel de incoerências sem bloquear escolhas personalizadas;
- regras próprias da crônica;
- catálogo assistido de Disciplinas e poderes;
- biblioteca por capítulo, busca e tradução;
- dez livros na biblioteca (135 capítulos), incluindo os oito suplementos do pacote VTM V5;
- tema claro/escuro e interface PT-BR/EN;
- layout responsivo para celular e tablet.

Os oito suplementos foram importados do pacote fornecido pelo criador. O arquivo-fonte não é necessário em produção. Para reconstruir os dados após uma nova extração, execute `node scripts/integrate-vtm-supplements.mjs <diretório VTM_V5_Base_MD>`. A rotina confere o manifesto e corrige os limites dos capítulos de Disciplinas, Predadores e Antecedentes no Player’s Guide. As opções mecânicas da ficha são um índice curado; os textos completos permanecem na biblioteca.

## Desenvolvimento local

Requisitos:

- Node.js 22.13 ou superior;
- pnpm 11;
- um projeto Supabase.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Não use uma chave `service_role` ou secret key em variáveis `NEXT_PUBLIC_*`.

## Banco de dados

A migração inicial está em:

```text
supabase/migrations/20260924000100_create_characters.sql
```

Ela cria `public.characters`, ativa RLS e permite que cada usuário leia e altere apenas suas próprias fichas.

Antes de produção:

1. aplique a migração no projeto Supabase;
2. configure a URL local e a URL de preview/produção nos redirects do Supabase Auth;
3. cadastre as três variáveis de ambiente na Vercel;
4. importe este repositório na Vercel;
5. valide login, criação, salvamento, exclusão e isolamento entre usuários.

## Deploy na Vercel

Conecte o repositório `SenoPersonalProjects/carnical` no painel da Vercel. O framework deve ser detectado como Next.js e o comando de build é `pnpm build`.

Cada Pull Request poderá gerar um preview independente. O deploy de produção deve ocorrer somente depois da migração do banco e dos testes de autenticação.

## Migração de dados do ChatGPT Sites

O código foi migrado, mas as fichas existentes no banco D1 não são copiadas automaticamente. A migração de dados exigirá exportar os registros do Site e associá-los aos novos usuários do Supabase.

## Aviso sobre conteúdo e licença

Este repositório contém materiais de referência e traduções relacionados a obras de terceiros. Eles não são concedidos sob uma licença de código aberto e não devem ser redistribuídos publicamente sem autorização dos titulares.

Consulte [LICENSE](LICENSE) para os termos do código e do conteúdo do repositório.
