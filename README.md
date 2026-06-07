# Meu site de projetos

Portfólio estático para centralizar projetos da faculdade e apresentações em um único domínio.

## Visão geral

O site é organizado em duas camadas:

1. **Página inicial** ([index.html](index.html)): apresentação e acesso ao hub de projetos.
2. **Projeto Atual** ([Projeto Atual/index.html](Projeto%20Atual/index.html)): seletor interno com os aplicativos disponíveis.

Cada aplicativo fica em pasta própria, com HTML, CSS e JavaScript isolados, para facilitar manutenção e evolução sem alterar os demais.

## Projetos disponíveis

### Aplicativo com cálculos do Winston

Calculadoras de juros, equações, funções, inequações, conjuntos e domínio/imagem, com histórico e gráficos.

- [Abrir projeto](Projeto%20Atual/Aplicativo%20com%20c%C3%A1lculos%20do%20Winston/index.html)

### Casos da aula

Analisador de funções quadráticas aplicadas a receita e lucro, com casos práticos, gráficos e histórico.

- [Abrir projeto](Projeto%20Atual/Casos%20da%20aula/index.html)

### Resolução de questões

Assistente para Logística e Matemática Financeira, com conferência de cálculos, gráficos e sugestões guiadas.

- [Abrir projeto](Projeto%20Atual/Resolu%C3%A7%C3%A3o%20de%20quest%C3%B5es/index.html)

**Fluxo principal:**

- Telas de **Logística** e **Financeira** com campos zerados na entrada, botão **Limpar campos** e modo **conferência** para validar cálculos existentes.
- **Ver resultado**: gráfico e métricas do cálculo.
- **Ver sugestões**: painel interativo com fórmula, passos, dicas e resumo visual.
- **Histórico de Gráficos e Sugestões**: revisão de análises anteriores, com opção **Limpar histórico**.

## Estrutura

```
index.html                          → tela de boas-vindas
Projeto Atual/
  index.html                        → seletor de projetos
  Aplicativo com cálculos do Winston/
  Casos da aula/
  Resolução de questões/
```

## Como acessar

1. Abra [index.html](index.html) na raiz do repositório.
2. Clique em **Selecionar projetos**.
3. Escolha o aplicativo desejado no seletor.
4. Use **Voltar para a seleção de projetos** para retornar ao hub interno.

## Tecnologias

- HTML5
- CSS3
- JavaScript (vanilla)
- Google Fonts
- `localStorage` para tema compartilhado, preferências e histórico (conforme cada projeto)

## Objetivo da organização

- manter cada projeto desacoplado
- facilitar manutenção e evolução
- permitir adicionar novos projetos sem alterar a base dos existentes
