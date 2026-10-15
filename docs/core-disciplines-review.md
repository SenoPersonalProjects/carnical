# Revisão do Livro Básico: primeiro bloco de Disciplinas

36 poderes conferidos nas imagens do PDF fornecido, páginas 247–259 do arquivo
(245–257 impressas): nove de Animalismo, nove de Auspícios, nove de Celeridade e
nove de Dominação. As regras gerais aplicáveis de Animalismo e Dominação foram
incluídas nas descrições em ambos os idiomas.

As descrições editoriais preservam regras, custos, testes, resistências,
durações, limites, consequências e exemplos mecânicos. Não reproduzem a prosa
ficcional de abertura das Disciplinas. A página original fica acessível em
separado. A biblioteca integral e os demais poderes continuam no inventário de
trabalho pendente.

## Correções e compatibilidade

- Enxame Não Vivo é Animalismo 3, amálgama Ofuscação 2, conforme PDF 248 /
  impressa 246. O catálogo anterior o colocava incorretamente no nível 2.
- IDs e nomes selecionáveis existentes foram mantidos. “Famulus Enlaçado”,
  “Piscadela” e “A Mente Esquecida”, usados no PDF, foram adicionados como
  alternativas de busca para os nomes existentes na ficha.
- A referência de Expulsar a Besta termina no PDF 250: a captura automática
  anterior incluía a abertura narrativa de Auspícios e texto de outra página.
- Possessão exige Dominação 3; Mira Infalível exige Auspícios 2; Dementação e
  Enxame Não Vivo exigem Ofuscação 2.
- Não alterar fichas existentes nem custos de compras antigas. A correção de
  nível vale nas escolhas guiadas seguintes.
- O anexo de regras do PDF agora acrescenta links clicáveis para todas as
  páginas originais devolvidas pela consulta do item, inclusive quando a
  descrição não continha um link escrito no próprio texto.
- Os efeitos dos poderes permanecem consultivos: nenhuma automação de cena
  foi acrescentada.

Gerador editorial: `scripts/review-core-disciplines.py`. Verificação das regras
de seleção e preservação das 213 entradas anteriores:
`scripts/check-core-disciplines.mjs`.

## Segundo bloco: 33 poderes

PDF 262–273 (impressas 260–271): oito poderes de Ofuscação, nove de Potência,
nove de Presença e sete de Proteanismo. Fusão com a Terra já estava revisada e
foi preservada. Os nomes do livro “Beijo Indelével” e “Beijo Selvagem” foram
incluídos como alternativas para os nomes existentes. As regras gerais de
Ofuscação, Presença e transformação de Proteanismo acompanham as entradas.

Desaparecer exige Manto de Sombras; Disfarce do Impostor exige Máscara de Mil
Faces; Metamorfose exige Mudança de Forma. Os requisitos aceitam nomes nos dois
idiomas. Centelha de Fúria exige Presença 3 e Voz Irresistível exige Dominação 1.
“Manto de Sombras” de Oblívio (Shadow Cloak) não satisfaz o requisito de
Desaparecer: ele exige o de Ofuscação (Cloak of Shadows). A verificação resolve
nomes também pela Disciplina em que a escolha foi registrada.

Ocultar continua pendente: o texto fornecido permite esconder um carro e depois
proíbe “qualquer automóvel (como um carro em movimento)”. Foi solicitado ao
usuário o original em inglês ou errata. Fortificar a Fachada Interior também
aguarda confirmação da frase sobre a parada usada para “acionar” o poder
adversário. Nenhuma interpretação desses trechos foi publicada como regra.

Geradores: `review-core-shadow-strength.py` e `review-core-presence-protean.py`.
Verificação: `check-core-shadow-strength.mjs`, incluindo preservação das 249
entradas publicadas anteriormente.

## Terceiro bloco: 16 poderes

PDF 260–262 e 274–276: oito de Fortitude (exceto Fortificar a Fachada Interior)
e os oito poderes de Feitiçaria de Sangue. Preservam limites por cena, ordem de
redução do dano, riscos dos animais fortalecidos, resistência com Fortitude,
restrições de transmissão dos venenos e Torpor causado por Carícia de Baal.

O exemplo de Poder Vindo da Dor usa a tabela oficial de Potência corrigida:
Potência 3 dá Impulso 3, produzindo limite 9 pela fórmula Impulso + 6. O exemplo
do PDF diz Impulso 2 e limite 9, apesar da incompatibilidade aritmética. O poder
não foi automatizado. Sangue Potente preserva a divergência da própria fonte:
o Sistema fala em cena e a linha de Duração diz “uma cena ou uma noite”.
Vitae Corrosivo preserva os 35 cm efetivamente impressos no PDF recebido,
explicitando a edição de origem dessa medida.

Gerador: `review-core-fortitude-sorcery.py`. Verificação:
`check-core-fortitude-sorcery.mjs`, incluindo preservação das 282 entradas
anteriores. Este bloco não conclui o inventário de Rituais, fórmulas, Vantagens,
Defeitos e demais opções do Livro Básico.

## Quarto bloco: todos os Rituais do Livro Básico

Os 21 Rituais dos níveis 2 a 5, PDF 279–284, foram acrescentados ao catálogo
compartilhado e às opções de compra com XP. A seção completa possui 26 Rituais:
5 de nível 1, 6 de nível 2, 6 de nível 3, 5 de nível 4 e 4 de nível 5. As cinco
entradas anteriores de nível 1 foram preservadas. Somente o nível 1 é gratuito
na criação; ambos os modos de custo da crônica mantêm nível do Ritual × 3 XP.

Proteções e Círculos incluem suas regras gerais das páginas PDF 277–278, com
custo, rolagens adiadas, dano, novas tentativas e durações. Os testes especiais
de Verdade do Sangue e Chamado de Dagon substituem a parada padrão na descrição.
Tempos e custos especiais de Fuga para o Verdadeiro Santuário e Fuste de Extinção
Tardia foram preservados. Nenhum efeito de Ritual foi automatizado no jogo.

Gerador: `review-core-rituals.py`. Seleção usa os identificadores e metadados do
catálogo compartilhado. Verificação: `check-core-rituals.mjs`, incluindo a
preservação das 298 entradas anteriores. A seção de Alquimia continua pendente.

## Quinto bloco: sete fórmulas nomeadas de Alquimia

PDF 284–289: Longo Alcance, Neblina, Envolver, Defracionar, Hieros Gamos Profano,
Ímpeto Aéreo e Despertar Adormecido. Incluem a tabela de qualidade 2/4/6,
ingredientes, custo separado de destilação e ativação, os três métodos com
paradas e limites, dano de extração, resistências e referências. O trecho de
três colunas da página 287 foi conferido na imagem original.

As sete fórmulas entram nas escolhas gratuitas e no XP, com nível e clã
Sangue-Ralo exigidos. A fórmula gratuita por ponto continua limitada pelo total
de escolhas. Defracionar mantém o nome alternativo “Defracionado” do texto.

**Ainda pendente:** modelar na ficha aprendizado independente por método e
cada receita que imita um poder específico. As descrições explicam essas
restrições; este bloco não transfere receitas automaticamente nem apresenta
uma fórmula genérica de imitação reutilizável como solução completa.

Gerador `review-core-alchemy.py`; teste `check-core-alchemy.mjs`, preservando as
319 entradas anteriores. Não automatiza fabricação, alimentação ou efeitos.

## Correção de característica permanente

Resiliência acrescenta a Fortitude atual à Vitalidade. Criação, modo de jogo e
exportação agora usam o mesmo cálculo. A presença do poder é verificada na
disciplina Fortitude, aceitando o nome português ou inglês; possuir apenas
pontos de Fortitude não concede o benefício. Recalcular o máximo não apaga nem
cura dano salvo. Verificação: `check-derived-traits.mjs`.

## Sexto bloco: dez Predadores do Livro Básico

PDF 177–180 (impressas 175–178), conferido nas imagens originais, incluindo
continuações. Os nomes e identificadores usados pelas fichas foram preservados.
As descrições em português e inglês incluem o conceito, pacote integral,
alternativas e restrições. Fazendeiro 2, Esôfago de Ferro 3 e Inimigo 2 do
Sacoleiro foram conferidos pelos pontos impressos, perdidos no OCR.

As descrições são compartilhadas entre a criação, a consulta em jogo e o anexo
do PDF; a aplicação dos benefícios continua usando o pacote existente, sem
conceder pontos pela abertura do accordion. Gerador `review-core-predators.py`;
verificação `check-core-predators.mjs`, preservando as 326 entradas anteriores.
