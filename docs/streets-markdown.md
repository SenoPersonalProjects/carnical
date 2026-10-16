# Base Markdown de Let the Streets Run Red

A base tem 252 arquivos por idioma, texto integral, onze capítulos e manifesto.
As páginas originais são preservadas como imagens e como cópia intacta do PDF
recebido. O manifesto registra o SHA-256, a correspondência de numeração,
os métodos de tradução e as páginas sinalizadas para revisão numérica.

## Correção da extração

A versão 5 detecta uma, duas ou três colunas. No PDF recebido, 55 páginas usam
três colunas; a divisão anterior em duas misturava trechos dessas páginas.
Cabeçalhos repetidos são removidos e palavras hifenizadas entre colunas são
reunidas. A extração de um único livro preserva os outros dez no manifesto.

Quatorze páginas não têm texto extraível; suas imagens e o PDF original ficam
no pacote. Elas não são descartadas nem substituídas por resumos.

## Validações reproduzíveis

- `check-streets-extraction.py <cache-de-páginas>` verifica cobertura,
  versão, identificação, colunas e a regressão da página 28.
- `build-streets-markdown.py <cache-de-páginas> <traduções> <saída> <PDF>`
  rejeita traduções desatualizadas e PDFs cujo hash não corresponda à fonte.
- `check-streets-package.py <saída>` verifica os 504 arquivos de páginas,
  imagens, links locais, cópia original e integridade do ZIP.

## Limite da entrega

O pacote é uma base de trabalho com tradução persistida. O estado editorial
continua `pending-review`. Cobertura de páginas, links válidos e números
preservados não comprovam fidelidade de todos os parágrafos traduzidos.
A biblioteca publicada ainda não foi substituída por esse material provisório.
