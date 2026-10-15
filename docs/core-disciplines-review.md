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
