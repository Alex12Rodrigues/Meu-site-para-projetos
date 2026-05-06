# Matemática Aplicada - Função do 2º Grau

Projeto em HTML, CSS e JavaScript voltado para o estudo de casos de função quadrática, com foco em receita, lucro, vértice, raízes e análise da concavidade.

## Visão geral

A aplicação foi montada para trabalhar com os 4 casos apresentados em aula:

1. Receita com venda de sapatos
2. Análise do lucro com sapatos
3. Receita do exercício 11
4. Lucro do exercício 11

Cada caso possui sua própria tela, com campos para os coeficientes da função, botão de cálculo, limpeza dos campos, exemplo da aula e histórico de resultados.

## O que o projeto faz

O sistema permite:

- calcular funções do 2º grau no formato `f(q) = aq² + bq + c`
- encontrar o vértice da parábola
- identificar valor máximo ou mínimo
- calcular as raízes reais, quando existirem
- mostrar o intervalo de lucro nos casos de lucro
- exibir um gráfico SVG após o cálculo
- alternar entre modo claro e escuro
- guardar histórico dos cálculos realizados

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Escolha um dos 4 casos na barra de abas.
3. Preencha os coeficientes `a`, `b` e `c`.
4. Clique em `Calcular`.
5. Leia o resultado exibido abaixo dos campos.
6. Se quiser, use o botão `Exemplo da Aula` para preencher automaticamente um caso pronto.
7. Acesse a aba `Histórico` para ver os cálculos anteriores.

## Interpretação dos casos

- Caso 1: calcula a receita e mostra o valor máximo da função.
- Caso 2: calcula a função lucro, as raízes e o intervalo lucrativo.
- Caso 3: calcula a receita do exercício 11 e o ponto de máximo.
- Caso 4: faz a análise da função lucro do exercício 11, com foco no vértice e nas raízes.

## Tecnologias usadas

- HTML5
- CSS3
- JavaScript ES6+
- SVG para o gráfico da parábola
- `localStorage` para manter histórico e tema

## Estrutura do projeto

- [index.html](Casos%20da%20aula/index.html): interface principal com as abas dos casos
- [style.css](Casos%20da%20aula/style.css): estilos, layout responsivo e temas
- [script.js](Casos%20da%20aula/script.js): cálculos, gráfico, histórico e interações

## Observações

- O coeficiente `a` não pode ser zero.
- Quando a função for de lucro, o sistema também mostra o intervalo em que `L(q) > 0`.
- O gráfico é gerado somente depois do cálculo.
- O projeto foi pensado para uso didático e apresentação em aula.
