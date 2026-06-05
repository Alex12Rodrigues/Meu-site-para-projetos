(function () {
  const THEME_KEY = "alex_site_theme";
  const LEGACY_THEME_KEYS = ["alex_presentation_theme", "winston_theme", "quadratic_theme"];

  const elements = {
    themeToggle: document.getElementById("themeToggle"),
    themeIcon: document.getElementById("themeIcon"),
    screenTabs: Array.from(document.querySelectorAll(".screen-tab")),
    screens: Array.from(document.querySelectorAll(".screen-panel")),
    screenGoButtons: Array.from(document.querySelectorAll(".screen-go")),
    logQuestionInput: document.getElementById("logQuestionInput"),
    finQuestionInput: document.getElementById("finQuestionInput"),
    analyzeLogButton: document.getElementById("analyzeLogButton"),
    analyzeFinButton: document.getElementById("analyzeFinButton"),
    restartBtn: document.getElementById("restartBtn"),
    detectedArea: document.getElementById("detectedArea"),
    mainSuggestion: document.getElementById("mainSuggestion"),
    formulaHint: document.getElementById("formulaHint"),
    calculationResult: document.getElementById("calculationResult"),
    tipsList: document.getElementById("tipsList"),
    logQuantity: document.getElementById("logQuantity"),
    logUnitCost: document.getElementById("logUnitCost"),
    logFreight: document.getElementById("logFreight"),
    logLoss: document.getElementById("logLoss"),
    finCapital: document.getElementById("finCapital"),
    finRate: document.getElementById("finRate"),
    finPeriods: document.getElementById("finPeriods"),
    finMode: document.getElementById("finMode"),
    chips: Array.from(document.querySelectorAll(".chip")),
  };

  const examples = {
    logistica: {
      screen: "logistica",
      question: "Uma transportadora comprou 240 itens por R$ 18,00 cada, com frete de R$ 120,00 e perdas de 3%. Como conferir o custo final?",
      fields: {
        logQuantity: 240,
        logUnitCost: 18,
        logFreight: 120,
        logLoss: 3,
      },
    },
    financeira: {
      screen: "financeira",
      question: "Um capital de R$ 2.500,00 foi aplicado a 2,5% ao mês por 6 meses. Qual é o montante no regime simples e no composto?",
      fields: {
        finCapital: 2500,
        finRate: 2.5,
        finPeriods: 6,
        finMode: "compound",
      },
    },
    conferir: {
      screen: "logistica",
      question: "Preciso conferir um cálculo já pronto e quero saber qual fórmula usar e quais dados revisar primeiro.",
    },
    juros: {
      screen: "financeira",
      question: "Quero conferir um cálculo de juros e entender se o resultado está correto.",
      fields: {
        finCapital: 1800,
        finRate: 1.8,
        finPeriods: 8,
        finMode: "compound",
      },
    },
  };

  const guidance = {
    logistica: {
      formula: "Custo total = (quantidade x custo unitário) + frete + perdas",
      tips: [
        "Confirme se a quantidade e o custo unitário estão na mesma unidade da questão.",
        "Se houver perdas, aplique a taxa sobre o custo base antes de fechar o total.",
        "Para conferir um resultado, compare também o custo por unidade final.",
      ],
    },
    financeira: {
      formula: "Juros simples: M = C x (1 + i x t) | Juros compostos: M = C x (1 + i)^t",
      tips: [
        "Verifique se a taxa está no mesmo período do tempo informado.",
        "Converta taxa mensal, anual ou diária antes de calcular.",
        "O montante final ajuda a conferir se a resposta tem coerência com o enunciado.",
      ],
    },
  };

  let activeScreen = "home";
  let activeTheme = "logistica";
  let lastResult = {
    area: "logistica",
    resultText: "Escolha uma tela e preencha os dados para gerar sugestões.",
    formulaText: guidance.logistica.formula,
    suggestionText: "As sugestões aparecem quando você analisa uma questão.",
    tips: guidance.logistica.tips,
  };

  function readSavedTheme() {
    const shared = localStorage.getItem(THEME_KEY);
    if (shared === "light" || shared === "dark") {
      return shared;
    }

    for (const legacyKey of LEGACY_THEME_KEYS) {
      const legacy = localStorage.getItem(legacyKey);
      if (legacy === "light" || legacy === "dark") {
        return legacy;
      }
    }

    return "dark";
  }

  function persistTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    LEGACY_THEME_KEYS.forEach((key) => localStorage.setItem(key, theme));
  }

  function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-theme", isLight);
    if (elements.themeIcon) {
      elements.themeIcon.textContent = isLight ? "🌙" : "☀️";
    }
  }

  function toNumber(value) {
    const normalized = String(value).replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }

  function getQuestionAnalysis(text) {
    const lowered = text.toLowerCase();
    const financeTerms = ["juros", "montante", "taxa", "capital", "desconto", "financiamento", "parcelas"];
    const logisticsTerms = ["frete", "estoque", "transporte", "custo", "produto", "entrega", "unidade", "avaria", "perda"];

    const financeHits = financeTerms.filter((term) => lowered.includes(term)).length;
    const logisticsHits = logisticsTerms.filter((term) => lowered.includes(term)).length;

    if (financeHits > logisticsHits) {
      return "financeira";
    }

    if (logisticsHits > financeHits) {
      return "logistica";
    }

    return null;
  }

  function setScreen(screenName) {
    activeScreen = screenName;

    elements.screens.forEach((screen) => {
      const isActive = screen.dataset.screen === screenName;
      screen.hidden = !isActive;
      screen.classList.toggle("is-active", isActive);
    });

    elements.screenTabs.forEach((tab) => {
      const isActive = tab.dataset.screen === screenName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    const activePanel = elements.screens.find((screen) => screen.dataset.screen === screenName);
    if (activePanel) {
      activePanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setThemeArea(area) {
    activeTheme = area === "financeira" ? "financeira" : "logistica";
  }

  function getQuestionInput(area) {
    return area === "financeira" ? elements.finQuestionInput : elements.logQuestionInput;
  }

  function getFieldValues(area) {
    if (area === "financeira") {
      return {
        finCapital: toNumber(elements.finCapital.value),
        finRate: toNumber(elements.finRate.value),
        finPeriods: toNumber(elements.finPeriods.value),
        finMode: elements.finMode.value,
      };
    }

    return {
      logQuantity: toNumber(elements.logQuantity.value),
      logUnitCost: toNumber(elements.logUnitCost.value),
      logFreight: toNumber(elements.logFreight.value),
      logLoss: toNumber(elements.logLoss.value),
    };
  }

  function updateTips(area, questionText) {
    const base = guidance[area] || guidance.logistica;
    const tips = [...base.tips];

    if ((questionText || "").toLowerCase().includes("confer")) {
      tips.unshift("Compare o enunciado com cada dado digitado antes de concluir.");
    }

    if (area === "financeira" && (questionText || "").toLowerCase().includes("parcel")) {
      tips.unshift("Se houver parcelas, confira se a taxa se aplica por período ou por parcela.");
    }

    elements.tipsList.innerHTML = tips.map((tip) => `<li>${tip}</li>`).join("");
    lastResult.tips = tips;
  }

  function updateSummary(area, resultText, formulaText, suggestionText, questionText) {
    const friendlyArea = area === "financeira" ? "Matemática financeira" : "Logística";
    elements.detectedArea.textContent = friendlyArea;
    elements.mainSuggestion.textContent = suggestionText;
    elements.formulaHint.textContent = formulaText;
    elements.calculationResult.textContent = resultText;
    updateTips(area, questionText);

    lastResult = {
      area,
      resultText,
      formulaText,
      suggestionText,
      tips: [...(guidance[area] || guidance.logistica).tips],
    };
  }

  function calculateLogistics() {
    const values = getFieldValues("logistica");
    const baseCost = values.logQuantity * values.logUnitCost;
    const lossValue = baseCost * (values.logLoss / 100);
    const total = baseCost + values.logFreight + lossValue;
    const unitFinal = values.logQuantity > 0 ? total / values.logQuantity : 0;

    return {
      resultText: `${formatCurrency(total)} no total e ${formatCurrency(unitFinal)} por item`,
      suggestionText: "A conta principal é o custo total; depois confira o custo por unidade para validar o resultado.",
      formulaText: guidance.logistica.formula,
    };
  }

  function calculateFinance() {
    const values = getFieldValues("financeira");
    const capital = values.finCapital;
    const rate = values.finRate / 100;
    const periods = values.finPeriods;
    const mode = values.finMode;

    const amount = mode === "compound"
      ? capital * Math.pow(1 + rate, periods)
      : capital * (1 + rate * periods);

    const interest = amount - capital;

    return {
      resultText: `${formatCurrency(amount)} de montante e ${formatCurrency(interest)} de juros`,
      suggestionText: mode === "compound"
        ? "O regime composto cresce período a período; revise a potência da taxa antes de concluir."
        : "No regime simples, a taxa incide apenas sobre o capital inicial.",
      formulaText: mode === "compound" ? "M = C x (1 + i)^t" : "M = C x (1 + i x t)",
    };
  }

  function previewArea(area) {
    const questionInput = getQuestionInput(area);
    const questionText = questionInput ? questionInput.value.trim() : "";
    const detected = getQuestionAnalysis(questionText) || area;
    const result = detected === "financeira" ? calculateFinance() : calculateLogistics();

    const suggestionText = questionText
      ? `${result.suggestionText} A leitura do enunciado indica foco em ${detected === "financeira" ? "juros e montante" : "custo e conferência de valores"}.`
      : `Preencha a questão para receber sugestões mais precisas de ${detected === "financeira" ? "juros e montante" : "custo total e custo unitário"}.`;

    updateSummary(detected, result.resultText, result.formulaText, suggestionText, questionText);
  }

  function analyzeArea(area) {
    setThemeArea(area);
    const questionInput = getQuestionInput(area);
    const questionText = questionInput ? questionInput.value.trim() : "";
    const detected = getQuestionAnalysis(questionText) || area;
    const result = detected === "financeira" ? calculateFinance() : calculateLogistics();

    const suggestionText = questionText
      ? `${result.suggestionText} A leitura do enunciado indica foco em ${detected === "financeira" ? "juros e montante" : "custo e conferência de valores"}.`
      : `Preencha a questão para receber sugestões mais precisas de ${detected === "financeira" ? "juros e montante" : "custo total e custo unitário"}.`;

    updateSummary(detected, result.resultText, result.formulaText, suggestionText, questionText);
    setScreen("sugestoes");
  }

  function setQuestionText(area, value) {
    const input = getQuestionInput(area);
    if (input) {
      input.value = value;
    }
  }

  function fillFields(fields) {
    Object.entries(fields || {}).forEach(([field, value]) => {
      if (elements[field] != null) {
        elements[field].value = value;
      }
    });
  }

  function applyExample(exampleKey) {
    const example = examples[exampleKey];
    if (!example) {
      return;
    }

    setThemeArea(example.screen);
    setScreen(example.screen);
    setQuestionText(example.screen, example.question);
    fillFields(example.fields);
    previewArea(example.screen);
  }

  function clearAll() {
    [elements.logQuestionInput, elements.finQuestionInput, elements.logQuantity, elements.logUnitCost, elements.logFreight, elements.logLoss, elements.finCapital, elements.finRate, elements.finPeriods].forEach((input) => {
      if (input) {
        input.value = "";
      }
    });

    if (elements.finMode) {
      elements.finMode.value = "simple";
    }

    setThemeArea("logistica");
    updateSummary(
      "logistica",
      "Aguardando dados",
      guidance.logistica.formula,
      "Escolha uma tela e preencha os dados para gerar sugestões.",
      ""
    );
    setScreen("home");
  }

  window.addEventListener("DOMContentLoaded", function () {
    const currentTheme = readSavedTheme();
    applyTheme(currentTheme);
    persistTheme(currentTheme);
    setScreen("home");
    updateSummary(
      "logistica",
      "Aguardando dados",
      guidance.logistica.formula,
      "Escolha uma tela e preencha os dados para gerar sugestões.",
      ""
    );

    if (elements.themeToggle) {
      elements.themeToggle.addEventListener("click", function () {
        const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
        applyTheme(nextTheme);
        persistTheme(nextTheme);
      });
    }

    elements.screenTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        setScreen(tab.dataset.screen);
        if (tab.dataset.screen === "logistica" || tab.dataset.screen === "financeira") {
          setThemeArea(tab.dataset.screen);
          previewArea(tab.dataset.screen);
        }
      });
    });

    elements.screenGoButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const target = button.dataset.targetScreen;
        if (target) {
          setScreen(target);
          if (target === "logistica" || target === "financeira") {
            setThemeArea(target);
            previewArea(target);
          }
        }
      });
    });

    if (elements.analyzeLogButton) {
      elements.analyzeLogButton.addEventListener("click", function () {
        analyzeArea("logistica");
      });
    }

    if (elements.analyzeFinButton) {
      elements.analyzeFinButton.addEventListener("click", function () {
        analyzeArea("financeira");
      });
    }

    if (elements.restartBtn) {
      elements.restartBtn.addEventListener("click", clearAll);
    }

    [elements.logQuestionInput, elements.logQuantity, elements.logUnitCost, elements.logFreight, elements.logLoss].forEach((input) => {
      if (input) {
        input.addEventListener("input", function () {
          previewArea("logistica");
        });
      }
    });

    [elements.finQuestionInput, elements.finCapital, elements.finRate, elements.finPeriods, elements.finMode].forEach((input) => {
      if (input) {
        input.addEventListener("input", function () {
          previewArea("financeira");
        });
      }
    });

    if (elements.finMode) {
      elements.finMode.addEventListener("change", function () {
        previewArea("financeira");
      });
    }

    elements.chips.forEach((chip) => {
      chip.addEventListener("click", function () {
        applyExample(chip.dataset.example);
      });
    });
  });
})();
