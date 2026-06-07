(function () {
  const THEME_KEY = "alex_site_theme";
  const LEGACY_THEME_KEYS = ["alex_presentation_theme", "winston_theme", "quadratic_theme"];
  const HISTORY_KEY = "resolucao_questoes_historico";
  const MAX_HISTORY = 30;

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
    showLogResult: document.getElementById("showLogResult"),
    showFinResult: document.getElementById("showFinResult"),
    clearLogButton: document.getElementById("clearLogButton"),
    clearFinButton: document.getElementById("clearFinButton"),
    restartBtn: document.getElementById("restartBtn"),
    backToFormBtn: document.getElementById("backToFormBtn"),
    resultToSuggestionsBtn: document.getElementById("resultToSuggestionsBtn"),
    suggestionsToResultBtn: document.getElementById("suggestionsToResultBtn"),
    backToHistoryBtn: document.getElementById("backToHistoryBtn"),
    clearHistoryBtn: document.getElementById("clearHistoryBtn"),
    logCheckModeBanner: document.getElementById("logCheckModeBanner"),
    finCheckModeBanner: document.getElementById("finCheckModeBanner"),
    logHelperText: document.getElementById("logHelperText"),
    finHelperText: document.getElementById("finHelperText"),
    suggestionsHistoryView: document.getElementById("suggestionsHistoryView"),
    suggestionsDetailView: document.getElementById("suggestionsDetailView"),
    suggestionsHistoryList: document.getElementById("suggestionsHistoryList"),
    suggestionsHistoryEmpty: document.getElementById("suggestionsHistoryEmpty"),
    resultTitle: document.getElementById("resultTitle"),
    resultSubtitle: document.getElementById("resultSubtitle"),
    resultAreaBadge: document.getElementById("resultAreaBadge"),
    resultChart: document.getElementById("resultChart"),
    resultMetrics: document.getElementById("resultMetrics"),
    dashboardAreaBadge: document.getElementById("dashboardAreaBadge"),
    dashboardResult: document.getElementById("dashboardResult"),
    dashboardSuggestion: document.getElementById("dashboardSuggestion"),
    dashboardFormula: document.getElementById("dashboardFormula"),
    confidenceFill: document.getElementById("confidenceFill"),
    confidenceLabel: document.getElementById("confidenceLabel"),
    stepsList: document.getElementById("stepsList"),
    tipsList: document.getElementById("tipsList"),
    dashboardMiniChart: document.getElementById("dashboardMiniChart"),
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
      checkOnly: true,
    },
    juros: {
      screen: "financeira",
      question: "Quero conferir um cálculo de juros e entender se o resultado está correto.",
      checkOnly: true,
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
      steps: [
        "Multiplique quantidade pelo custo unitário para obter o custo base.",
        "Some o frete ou taxa fixa ao custo base.",
        "Calcule as perdas sobre o custo base e some ao total.",
        "Divida o custo total pela quantidade para validar o custo unitário final.",
      ],
    },
    financeira: {
      formula: "Juros simples: M = C x (1 + i x t) | Juros compostos: M = C x (1 + i)^t",
      tips: [
        "Verifique se a taxa está no mesmo período do tempo informado.",
        "Converta taxa mensal, anual ou diária antes de calcular.",
        "O montante final ajuda a conferir se a resposta tem coerência com o enunciado.",
      ],
      steps: [
        "Identifique capital, taxa e número de períodos no enunciado.",
        "Converta a taxa percentual para decimal dividindo por 100.",
        "Escolha o regime: simples (linear) ou composto (exponencial).",
        "Calcule montante e juros para comparar com a resposta esperada.",
      ],
    },
  };

  const checkGuidance = {
    logistica: {
      formula: "Custo total = (quantidade x custo unitário) + frete + perdas",
      tips: [
        "No modo conferência, comece comparando o enunciado com os dados que você já possui.",
        "Revise se frete e perdas foram aplicados na ordem correta.",
        "Se o resultado final já estiver pronto, valide apenas o custo unitário para ganhar tempo.",
        "Use os campos numéricos somente para comparar valores, não para refazer toda a conta.",
      ],
      steps: [
        "Leia o enunciado e separe quantidade, custo unitário, frete e perdas.",
        "Identifique qual fórmula o problema pede para conferência.",
        "Compare cada parcela do seu cálculo com os dados informados.",
        "Só depois feche o custo total e o custo por item para validar a resposta.",
      ],
      suggestionText: "Modo conferência ativo: o foco é validar um cálculo existente, revisando fórmula, dados e coerência do resultado.",
      resultText: "Modo conferência — preencha os valores que deseja comparar ou siga as dicas para revisar o cálculo.",
    },
    financeira: {
      formula: "Juros simples: M = C x (1 + i x t) | Juros compostos: M = C x (1 + i)^t",
      tips: [
        "Confira primeiro se a taxa está no mesmo período informado no enunciado.",
        "Verifique se o problema usa regime simples ou composto antes de comparar o montante.",
        "Se você já tem a resposta final, compare apenas juros e montante.",
        "Use os campos apenas para testar valores que queira validar.",
      ],
      steps: [
        "Identifique capital, taxa, tempo e regime no enunciado.",
        "Escreva a fórmula correta antes de comparar números.",
        "Substitua somente os dados necessários para conferir o resultado.",
        "Compare montante e juros com a resposta que você quer validar.",
      ],
      suggestionText: "Modo conferência ativo: revise regime, taxa e montante para validar se o cálculo de juros está correto.",
      resultText: "Modo conferência — informe os valores que deseja comparar ou siga o roteiro de conferência.",
    },
  };

  let activeScreen = "home";
  let activeTheme = "logistica";
  let lastSourceArea = "logistica";
  let preserveFormOnEnter = false;
  let activeHistoryId = null;
  let checkOnlyMode = {
    logistica: false,
    financeira: false,
  };

  function emptyResult() {
    return {
      area: "logistica",
      resultText: "Aguardando dados",
      formulaText: guidance.logistica.formula,
      suggestionText: "Preencha os campos e clique em Ver sugestões.",
      tips: [...guidance.logistica.tips],
      steps: [...guidance.logistica.steps],
      confidence: 0,
      metrics: [],
      chartHtml: "",
      miniChartHtml: "",
      questionText: "",
      checkOnly: false,
    };
  }

  let lastResult = emptyResult();

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
    refreshCharts();
    renderHistoryList();
  }

  function toNumber(value) {
    const normalized = String(value).replace(",", ".").trim();
    if (!normalized) {
      return 0;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }

  function formatPercent(value) {
    return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
  }

  function formatDate(isoDate) {
    return new Date(isoDate).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function friendlyArea(area) {
    return area === "financeira" ? "Matemática financeira" : "Logística";
  }

  function isLightTheme() {
    return document.body.classList.contains("light-theme");
  }

  function getChartPalette() {
    if (isLightTheme()) {
      return {
        label: "#42506b",
        grid: "rgba(66, 80, 107, 0.14)",
        axis: "rgba(13, 26, 52, 0.45)",
        barA: "#1a9fd4",
        barB: "#8b7cf8",
        barC: "#5b4fd6",
        line: "#1a9fd4",
        fill: "rgba(26, 159, 212, 0.16)",
      };
    }

    return {
      label: "#b7c1d8",
      grid: "rgba(255, 255, 255, 0.1)",
      axis: "rgba(255, 255, 255, 0.72)",
      barA: "#35d0ff",
      barB: "#8b7cf8",
      barC: "#5b4fd6",
      line: "#5ce4ff",
      fill: "rgba(53, 208, 255, 0.18)",
    };
  }

  function svgHeader(width, height) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gráfico do resultado" style="display:block; max-width:100%;">`;
  }

  function createBarChart(items, options = {}) {
    const palette = getChartPalette();
    const width = options.width || 760;
    const height = options.height || 320;
    const paddingLeft = 72;
    const paddingRight = 28;
    const paddingTop = 28;
    const paddingBottom = 54;
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;
    const maxValue = Math.max(...items.map((item) => item.value), 1);
    const barWidth = graphWidth / items.length * 0.58;
    const gap = graphWidth / items.length;

    let svg = svgHeader(width, height);

    for (let step = 0; step <= 4; step += 1) {
      const y = paddingTop + (graphHeight * step) / 4;
      const value = maxValue - (maxValue * step) / 4;
      svg += `<line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="${palette.grid}" stroke-width="1" />`;
      svg += `<text x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${palette.label}">${formatCurrency(value)}</text>`;
    }

    svg += `<line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" stroke="${palette.axis}" stroke-width="2" />`;
    svg += `<line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="${palette.axis}" stroke-width="2" />`;

    items.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * graphHeight;
      const x = paddingLeft + gap * index + (gap - barWidth) / 2;
      const y = height - paddingBottom - barHeight;
      const color = item.color || [palette.barA, palette.barB, palette.barC][index % 3];
      svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="10" fill="${color}" opacity="0.92" />`;
      svg += `<text x="${x + barWidth / 2}" y="${height - 24}" text-anchor="middle" font-size="11" fill="${palette.label}">${item.label}</text>`;
      svg += `<text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="11" fill="${palette.label}">${formatCurrency(item.value)}</text>`;
    });

    svg += "</svg>";
    return `<div class="graph-block"><div class="graph-title">${options.title || "Composição do custo"}</div>${svg}</div>`;
  }

  function createFinanceChart(capital, ratePercent, periods, mode, options = {}) {
    const palette = getChartPalette();
    const rate = ratePercent / 100;
    const width = options.width || 760;
    const height = options.height || 320;
    const paddingLeft = 72;
    const paddingRight = 28;
    const paddingTop = 28;
    const paddingBottom = 54;
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;
    const xMax = Math.max(periods, 1);
    const samples = Math.max(12, Math.ceil(xMax * 8));
    const points = [];

    for (let index = 0; index <= samples; index += 1) {
      const x = (xMax * index) / samples;
      const y = mode === "compound"
        ? capital * Math.pow(1 + rate, x)
        : capital * (1 + rate * x);
      points.push({ x, y });
    }

    const maxY = Math.max(...points.map((point) => point.y), capital) * 1.1;
    const toX = (value) => paddingLeft + (value / xMax) * graphWidth;
    const toY = (value) => paddingTop + graphHeight - (value / maxY) * graphHeight;
    const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${toX(point.x)} ${toY(point.y)}`).join(" ");
    const areaPath = `${path} L ${toX(points[points.length - 1].x)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;
    const finalPoint = points[points.length - 1];

    let svg = svgHeader(width, height);

    for (let step = 0; step <= 4; step += 1) {
      const y = paddingTop + (graphHeight * step) / 4;
      const value = maxY - (maxY * step) / 4;
      svg += `<line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="${palette.grid}" stroke-width="1" />`;
      svg += `<text x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${palette.label}">${formatCurrency(value)}</text>`;
    }

    for (let step = 0; step <= 5; step += 1) {
      const x = paddingLeft + (graphWidth * step) / 5;
      const value = (xMax * step) / 5;
      svg += `<text x="${x}" y="${height - 24}" text-anchor="middle" font-size="11" fill="${palette.label}">${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</text>`;
    }

    svg += `<line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" stroke="${palette.axis}" stroke-width="2" />`;
    svg += `<line x1="${paddingLeft}" y1="${height - paddingBottom}" x2="${width - paddingRight}" y2="${height - paddingBottom}" stroke="${palette.axis}" stroke-width="2" />`;
    svg += `<path d="${areaPath}" fill="${palette.fill}" stroke="none" />`;
    svg += `<path d="${path}" fill="none" stroke="${palette.line}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`;
    svg += `<circle cx="${toX(0)}" cy="${toY(capital)}" r="5" fill="${palette.barB}" />`;
    svg += `<circle cx="${toX(finalPoint.x)}" cy="${toY(finalPoint.y)}" r="5" fill="${palette.barA}" />`;
    svg += `<text x="${toX(finalPoint.x)}" y="${toY(finalPoint.y) - 10}" text-anchor="middle" font-size="11" fill="${palette.label}">${formatCurrency(finalPoint.y)}</text>`;
    svg += "</svg>";

    const title = mode === "compound" ? "Evolução do montante (juros compostos)" : "Evolução do montante (juros simples)";
    return `<div class="graph-block"><div class="graph-title">${title}</div>${svg}</div>`;
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

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveHistory(entries) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    activeHistoryId = null;
    clearSessionCache();
    renderHistoryList();
    showSuggestionsHistoryView();
  }

  function addHistoryEntry(result) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasResult: Boolean(result.chartHtml),
      hasSuggestions: true,
      ...result,
    };
    const history = loadHistory();
    history.unshift(entry);
    saveHistory(history);
    activeHistoryId = entry.id;
    renderHistoryList();
    return entry;
  }

  function updateHistoryEntry(id, result) {
    const history = loadHistory();
    const index = history.findIndex((entry) => entry.id === id);

    if (index === -1) {
      return addHistoryEntry(result);
    }

    const updatedEntry = {
      ...history[index],
      ...result,
      id: history[index].id,
      createdAt: history[index].createdAt,
      updatedAt: new Date().toISOString(),
      chartHtml: result.chartHtml || history[index].chartHtml,
      miniChartHtml: result.miniChartHtml || history[index].miniChartHtml,
      metrics: (result.metrics && result.metrics.length) ? result.metrics : history[index].metrics,
      fieldSnapshot: result.fieldSnapshot || history[index].fieldSnapshot,
      hasResult: Boolean(result.chartHtml || history[index].chartHtml),
      hasSuggestions: true,
    };

    history[index] = updatedEntry;
    saveHistory(history);
    activeHistoryId = updatedEntry.id;
    renderHistoryList();
    return updatedEntry;
  }

  function prepareResultForHistory(area, result) {
    const questionInput = getQuestionInput(area);
    return {
      ...result,
      area,
      questionText: result.questionText || (questionInput ? questionInput.value.trim() : ""),
      fieldSnapshot: getFieldValues(area),
    };
  }

  function hasEnoughSnapshotData(area, snapshot) {
    if (!snapshot) {
      return false;
    }

    if (area === "financeira") {
      return snapshot.finCapital > 0 && snapshot.finRate >= 0 && snapshot.finPeriods > 0;
    }

    return snapshot.logQuantity > 0 && snapshot.logUnitCost >= 0;
  }

  function hydrateHistoryEntry(entry) {
    if (entry.chartHtml) {
      return entry;
    }

    if (!hasEnoughSnapshotData(entry.area, entry.fieldSnapshot)) {
      return entry;
    }

    const calculated = entry.area === "financeira"
      ? calculateFinance(entry.fieldSnapshot)
      : calculateLogistics(entry.fieldSnapshot);

    return {
      ...entry,
      ...calculated,
      suggestionText: entry.suggestionText || calculated.suggestionText,
      formulaText: entry.formulaText || calculated.formulaText,
      steps: entry.steps || calculated.steps,
      tips: entry.tips || calculated.tips,
      confidence: entry.confidence ?? 0,
      checkOnly: entry.checkOnly === true,
      hasResult: true,
    };
  }

  function persistAnalysisHistory(area, result, options = {}) {
    const payload = prepareResultForHistory(area, result);

    if (options.updateExisting && activeHistoryId && getHistoryEntry(activeHistoryId)) {
      return updateHistoryEntry(activeHistoryId, payload);
    }

    return addHistoryEntry(payload);
  }

  function getActiveStoredResult() {
    if (activeHistoryId) {
      const stored = getHistoryEntry(activeHistoryId);
      if (stored) {
        return hydrateHistoryEntry(stored);
      }
    }

    return hydrateHistoryEntry(lastResult);
  }

  function getHistoryEntry(id) {
    return loadHistory().find((entry) => entry.id === id) || null;
  }

  function renderHistoryList() {
    const history = loadHistory();

    if (elements.clearHistoryBtn) {
      elements.clearHistoryBtn.disabled = history.length === 0;
    }

    if (elements.suggestionsHistoryEmpty) {
      elements.suggestionsHistoryEmpty.hidden = history.length > 0;
    }

    if (!elements.suggestionsHistoryList) {
      return;
    }

    if (history.length === 0) {
      elements.suggestionsHistoryList.innerHTML = "";
      return;
    }

    elements.suggestionsHistoryList.innerHTML = history.map((entry) => `
      <button class="history-item" type="button" data-history-id="${entry.id}" role="listitem">
        <div class="history-item-top">
          <span class="history-item-area">${friendlyArea(entry.area)}${entry.checkOnly ? " · Conferência" : ""}</span>
          <span class="history-item-date">${formatDate(entry.createdAt)}</span>
        </div>
        <p class="history-item-result">${entry.resultText}</p>
        <p class="history-item-note">${entry.suggestionText}</p>
        <p class="history-item-tags">
          ${entry.hasResult ? '<span>Gráfico</span>' : ''}
          ${entry.hasSuggestions ? '<span>Sugestões</span>' : ''}
        </p>
        <div class="history-item-preview">${entry.miniChartHtml || entry.chartHtml || '<p class="helper-text">Sem gráfico para esta análise.</p>'}</div>
      </button>
    `).join("");

    elements.suggestionsHistoryList.querySelectorAll("[data-history-id]").forEach((button) => {
      button.addEventListener("click", function () {
        openHistoryEntry(button.dataset.historyId);
      });
    });
  }

  function showSuggestionsHistoryView() {
    if (elements.suggestionsHistoryView) {
      elements.suggestionsHistoryView.classList.remove("is-hidden");
      elements.suggestionsHistoryView.hidden = false;
    }
    if (elements.suggestionsDetailView) {
      elements.suggestionsDetailView.hidden = true;
    }
    renderHistoryList();
  }

  function showSuggestionsDetailView() {
    if (elements.suggestionsHistoryView) {
      elements.suggestionsHistoryView.classList.add("is-hidden");
      elements.suggestionsHistoryView.hidden = true;
    }
    if (elements.suggestionsDetailView) {
      elements.suggestionsDetailView.hidden = false;
    }
  }

  function clearSessionCache() {
    lastResult = emptyResult();
    activeHistoryId = null;
    updateDashboard(emptyResult());
    updateResultView(emptyResult());
  }

  function setScreen(screenName, options = {}) {
    const leavingSuggestions = activeScreen === "sugestoes"
      && screenName !== "sugestoes"
      && screenName !== "resultado";
    const leavingResultado = activeScreen === "resultado" && screenName !== "resultado" && screenName !== "sugestoes";

    if (leavingSuggestions) {
      clearSessionCache();
    }

    if (leavingResultado) {
      activeHistoryId = null;
    }

    activeScreen = screenName;

    elements.screens.forEach((screen) => {
      const isActive = screen.dataset.screen === screenName;
      screen.hidden = !isActive;
      screen.classList.toggle("is-active", isActive);
    });

    elements.screenTabs.forEach((tab) => {
      const hasTab = ["home", "logistica", "financeira", "sugestoes"].includes(screenName);
      const isActive = hasTab && tab.dataset.screen === screenName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    if (screenName === "sugestoes" && !options.keepDetail) {
      showSuggestionsHistoryView();
    }

    const activePanel = elements.screens.find((screen) => screen.dataset.screen === screenName);
    if (activePanel) {
      activePanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setThemeArea(area) {
    activeTheme = area === "financeira" ? "financeira" : "logistica";
  }

  function setCheckOnlyMode(area, enabled) {
    checkOnlyMode[area] = enabled;
    updateCheckModeUI(area);
  }

  function updateCheckModeUI(area) {
    const enabled = checkOnlyMode[area];
    const banner = area === "financeira" ? elements.finCheckModeBanner : elements.logCheckModeBanner;
    const helper = area === "financeira" ? elements.finHelperText : elements.logHelperText;

    if (banner) {
      banner.classList.toggle("is-hidden", !enabled);
    }

    if (helper) {
      helper.textContent = enabled
        ? "Modo conferência: valide um cálculo existente com foco em fórmula, dados e coerência."
        : area === "financeira"
          ? "Use esta tela para juros simples, juros compostos e montante final."
          : "Use esta tela para conferir custo total, custo unitário e perdas.";
    }
  }

  function resetFormFields(area) {
    if (area === "financeira") {
      if (elements.finQuestionInput) elements.finQuestionInput.value = "";
      if (elements.finCapital) elements.finCapital.value = "";
      if (elements.finRate) elements.finRate.value = "";
      if (elements.finPeriods) elements.finPeriods.value = "";
      if (elements.finMode) elements.finMode.value = "simple";
      setCheckOnlyMode("financeira", false);
      return;
    }

    if (elements.logQuestionInput) elements.logQuestionInput.value = "";
    if (elements.logQuantity) elements.logQuantity.value = "";
    if (elements.logUnitCost) elements.logUnitCost.value = "";
    if (elements.logFreight) elements.logFreight.value = "";
    if (elements.logLoss) elements.logLoss.value = "";
    setCheckOnlyMode("logistica", false);
  }

  function enterFormScreen(area, options = {}) {
    const preserve = options.preserve === true;
    lastSourceArea = area;
    setThemeArea(area);

    if (!preserve) {
      resetFormFields(area);
    }

    setScreen(area);
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

  function hasNumericData(area) {
    const values = getFieldValues(area);
    if (area === "financeira") {
      return values.finCapital > 0 || values.finRate > 0 || values.finPeriods > 0;
    }

    return values.logQuantity > 0 || values.logUnitCost > 0 || values.logFreight > 0 || values.logLoss > 0;
  }

  function hasEnoughData(area) {
    const values = getFieldValues(area);
    if (area === "financeira") {
      return values.finCapital > 0 && values.finRate >= 0 && values.finPeriods > 0;
    }

    return values.logQuantity > 0 && values.logUnitCost >= 0;
  }

  function computeConfidence(area, questionText, isCheckOnly) {
    let score = isCheckOnly ? 25 : 35;
    const values = getFieldValues(area);

    if (questionText.trim()) {
      score += isCheckOnly ? 35 : 20;
    }

    if (area === "financeira") {
      if (values.finCapital > 0) score += 12;
      if (values.finRate > 0) score += 12;
      if (values.finPeriods > 0) score += 12;
    } else {
      if (values.logQuantity > 0) score += 12;
      if (values.logUnitCost > 0) score += 12;
      if (values.logFreight >= 0 && hasNumericData("logistica")) score += 8;
      if (values.logLoss >= 0 && hasNumericData("logistica")) score += 8;
    }

    return Math.min(score, 100);
  }

  function buildTips(area, questionText, isCheckOnly) {
    const base = isCheckOnly ? checkGuidance[area] : guidance[area];
    const tips = [...(base.tips || guidance[area].tips)];

    if ((questionText || "").toLowerCase().includes("confer") && !isCheckOnly) {
      tips.unshift("Compare o enunciado com cada dado digitado antes de concluir.");
    }

    if (area === "financeira" && (questionText || "").toLowerCase().includes("parcel")) {
      tips.unshift("Se houver parcelas, confira se a taxa se aplica por período ou por parcela.");
    }

    return tips;
  }

  function calculateLogistics(valuesOverride) {
    const values = valuesOverride || getFieldValues("logistica");
    const baseCost = values.logQuantity * values.logUnitCost;
    const lossValue = baseCost * (values.logLoss / 100);
    const total = baseCost + values.logFreight + lossValue;
    const unitFinal = values.logQuantity > 0 ? total / values.logQuantity : 0;

    const chartHtml = createBarChart([
      { label: "Base", value: baseCost },
      { label: "Frete", value: values.logFreight },
      { label: "Perdas", value: lossValue },
      { label: "Total", value: total },
    ], { title: "Composição do custo logístico" });

    const miniChartHtml = createBarChart([
      { label: "Base", value: baseCost },
      { label: "Frete", value: values.logFreight },
      { label: "Perdas", value: lossValue },
    ], { title: "Resumo", width: 420, height: 180 });

    return {
      area: "logistica",
      resultText: `${formatCurrency(total)} no total e ${formatCurrency(unitFinal)} por item`,
      suggestionText: "A conta principal é o custo total; depois confira o custo por unidade para validar o resultado.",
      formulaText: guidance.logistica.formula,
      steps: guidance.logistica.steps,
      metrics: [
        { label: "Custo base", value: formatCurrency(baseCost) },
        { label: "Frete", value: formatCurrency(values.logFreight) },
        { label: "Perdas", value: formatCurrency(lossValue) },
        { label: "Custo unitário", value: formatCurrency(unitFinal) },
      ],
      chartHtml,
      miniChartHtml,
    };
  }

  function calculateFinance(valuesOverride) {
    const values = valuesOverride || getFieldValues("financeira");
    const capital = values.finCapital;
    const rate = values.finRate / 100;
    const periods = values.finPeriods;
    const mode = values.finMode;
    const amount = mode === "compound"
      ? capital * Math.pow(1 + rate, periods)
      : capital * (1 + rate * periods);
    const interest = amount - capital;

    const chartHtml = createFinanceChart(capital, values.finRate, periods, mode);
    const miniChartHtml = createFinanceChart(capital, values.finRate, periods, mode, { width: 420, height: 180 });

    return {
      area: "financeira",
      resultText: `${formatCurrency(amount)} de montante e ${formatCurrency(interest)} de juros`,
      suggestionText: mode === "compound"
        ? "O regime composto cresce período a período; revise a potência da taxa antes de concluir."
        : "No regime simples, a taxa incide apenas sobre o capital inicial.",
      formulaText: mode === "compound" ? "M = C x (1 + i)^t" : "M = C x (1 + i x t)",
      steps: guidance.financeira.steps,
      metrics: [
        { label: "Capital", value: formatCurrency(capital) },
        { label: "Taxa", value: formatPercent(values.finRate) },
        { label: "Períodos", value: String(periods) },
        { label: "Juros", value: formatCurrency(interest) },
      ],
      chartHtml,
      miniChartHtml,
    };
  }

  function resolveAnalysis(area) {
    const questionInput = getQuestionInput(area);
    const questionText = questionInput ? questionInput.value.trim() : "";
    const detected = getQuestionAnalysis(questionText) || area;
    const isCheckOnly = checkOnlyMode[detected] === true;
    const canCalculate = hasEnoughData(detected);

    if (isCheckOnly && !canCalculate) {
      const checkBase = checkGuidance[detected];
      return {
        area: detected,
        checkOnly: true,
        questionText,
        resultText: checkBase.resultText,
        suggestionText: questionText
          ? `${checkBase.suggestionText} Revise o enunciado antes de comparar valores.`
          : checkBase.suggestionText,
        formulaText: checkBase.formula,
        steps: checkBase.steps,
        tips: buildTips(detected, questionText, true),
        confidence: computeConfidence(detected, questionText, true),
        metrics: [],
        chartHtml: "",
        miniChartHtml: "",
      };
    }

    const result = detected === "financeira" ? calculateFinance() : calculateLogistics();
    const suggestionText = questionText
      ? `${result.suggestionText} A leitura do enunciado indica foco em ${detected === "financeira" ? "juros e montante" : "custo e conferência de valores"}.`
      : `Preencha a questão para receber sugestões mais precisas de ${detected === "financeira" ? "juros e montante" : "custo total e custo unitário"}.`;

    if (isCheckOnly) {
      return {
        ...result,
        area: detected,
        checkOnly: true,
        questionText,
        suggestionText: `${checkGuidance[detected].suggestionText} ${result.suggestionText}`,
        steps: checkGuidance[detected].steps,
        tips: buildTips(detected, questionText, true),
        confidence: computeConfidence(detected, questionText, true),
      };
    }

    return {
      ...result,
      area: detected,
      checkOnly: false,
      suggestionText,
      questionText,
      confidence: computeConfidence(detected, questionText, false),
      tips: buildTips(detected, questionText, false),
    };
  }

  function renderMetrics(container, metrics) {
    if (!container) {
      return;
    }

    container.innerHTML = metrics.map((metric) => `
      <article class="metric-card">
        <span>${metric.label}</span>
        <strong>${metric.value}</strong>
      </article>
    `).join("");
  }

  function updateDashboard(result) {
    if (elements.dashboardAreaBadge) {
      elements.dashboardAreaBadge.textContent = `${friendlyArea(result.area)}${result.checkOnly ? " · Conferência" : ""}`;
    }

    if (elements.dashboardResult) {
      elements.dashboardResult.textContent = result.resultText;
    }

    if (elements.dashboardSuggestion) {
      elements.dashboardSuggestion.textContent = result.suggestionText;
    }

    if (elements.dashboardFormula) {
      elements.dashboardFormula.textContent = result.formulaText;
    }

    if (elements.confidenceFill) {
      elements.confidenceFill.style.width = `${result.confidence}%`;
    }

    if (elements.confidenceLabel) {
      const label = result.confidence >= 85
        ? "Alta confiança"
        : result.confidence >= 60
          ? "Confiança moderada"
          : result.checkOnly
            ? "Conferência guiada"
            : "Dados incompletos";
      elements.confidenceLabel.textContent = `${label} (${result.confidence}%)`;
    }

    if (elements.stepsList) {
      elements.stepsList.innerHTML = result.steps.map((step) => `<li>${step}</li>`).join("");
    }

    if (elements.tipsList) {
      elements.tipsList.innerHTML = result.tips.map((tip) => `<li>${tip}</li>`).join("");
    }

    if (elements.dashboardMiniChart) {
      elements.dashboardMiniChart.innerHTML = result.miniChartHtml || '<p class="helper-text">Sem gráfico nesta análise. Preencha os valores numéricos para gerar o resumo visual.</p>';
    }
  }

  function updateResultView(result) {
    if (elements.resultAreaBadge) {
      elements.resultAreaBadge.textContent = `${friendlyArea(result.area)}${result.checkOnly ? " · Conferência" : ""}`;
    }

    if (elements.resultTitle) {
      if (result.checkOnly && !result.chartHtml) {
        elements.resultTitle.textContent = "Conferência de cálculo";
      } else {
        elements.resultTitle.textContent = result.area === "financeira"
          ? "Evolução do montante"
          : "Composição do custo";
      }
    }

    if (elements.resultSubtitle) {
      elements.resultSubtitle.textContent = result.checkOnly && !result.chartHtml
        ? "Nesta conferência, use a fórmula e as métricas para validar o cálculo informado no enunciado."
        : result.area === "financeira"
          ? "Gráfico da aplicação financeira com capital, taxa e períodos informados."
          : "Gráfico da composição entre custo base, frete, perdas e total final.";
    }

    if (elements.resultChart) {
      elements.resultChart.innerHTML = result.chartHtml || '<p class="helper-text">Preencha os valores numéricos para visualizar o gráfico do cálculo.</p>';
    }

    renderMetrics(elements.resultMetrics, result.metrics || []);
  }

  function storeResult(result, options = {}) {
    lastResult = { ...result };
    if (!options.skipViews) {
      updateDashboard(result);
      updateResultView(result);
    }
  }

  function refreshCharts() {
    let refreshed = null;

    if (lastResult.fieldSnapshot && hasEnoughSnapshotData(lastResult.area, lastResult.fieldSnapshot)) {
      refreshed = lastResult.area === "financeira"
        ? calculateFinance(lastResult.fieldSnapshot)
        : calculateLogistics(lastResult.fieldSnapshot);
    } else if (lastResult.chartHtml && hasEnoughData(lastResult.area)) {
      refreshed = lastResult.area === "financeira" ? calculateFinance() : calculateLogistics();
    }

    if (!refreshed) {
      return;
    }

    const nextResult = {
      ...lastResult,
      chartHtml: refreshed.chartHtml,
      miniChartHtml: refreshed.miniChartHtml,
      metrics: refreshed.metrics,
      resultText: refreshed.resultText,
    };

    storeResult(nextResult);

    if (activeHistoryId) {
      updateHistoryEntry(activeHistoryId, nextResult);
    }

    renderHistoryList();
  }

  function openHistoryEntry(id) {
    const entry = getHistoryEntry(id);
    if (!entry) {
      return;
    }

    const hydrated = hydrateHistoryEntry(entry);
    activeHistoryId = entry.id;
    lastSourceArea = hydrated.area;

    if (hydrated.chartHtml && !entry.chartHtml) {
      updateHistoryEntry(entry.id, hydrated);
    }

    storeResult(hydrated);
    setScreen("sugestoes", { keepDetail: true });
    showSuggestionsDetailView();
  }

  function openFullResultFromSuggestions() {
    const result = getActiveStoredResult();

    if (!result.chartHtml) {
      window.alert("Esta análise não possui gráfico salvo porque os valores numéricos não foram preenchidos.");
      return;
    }

    if (activeHistoryId) {
      updateHistoryEntry(activeHistoryId, {
        ...result,
        hasResult: true,
        viewedFullChart: true,
      });
    }

    lastSourceArea = result.area;
    storeResult(result);
    setScreen("resultado");
  }

  function showResult(area) {
    if (checkOnlyMode[area] && !hasEnoughData(area)) {
      window.alert("No modo conferência, preencha os valores que deseja comparar para gerar o gráfico.");
      return;
    }

    if (!hasEnoughData(area)) {
      window.alert("Preencha os campos principais antes de visualizar o resultado.");
      return;
    }

    lastSourceArea = area;
    setThemeArea(area);
    const result = resolveAnalysis(area);
    storeResult(result);
    persistAnalysisHistory(area, result, { updateExisting: false });
    setScreen("resultado");
  }

  function showSuggestions(area) {
    lastSourceArea = area;
    setThemeArea(area);
    const result = resolveAnalysis(area);
    const shouldUpdateExisting = activeScreen === "resultado"
      && Boolean(activeHistoryId && getHistoryEntry(activeHistoryId));

    persistAnalysisHistory(area, result, { updateExisting: shouldUpdateExisting });
    storeResult(result);
    setScreen("sugestoes", { keepDetail: true });
    showSuggestionsDetailView();
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

    preserveFormOnEnter = true;
    setThemeArea(example.screen);
    setScreen(example.screen);
    resetFormFields(example.screen);
    setQuestionText(example.screen, example.question);

    if (example.checkOnly) {
      setCheckOnlyMode(example.screen, true);
    } else {
      setCheckOnlyMode(example.screen, false);
      fillFields(example.fields);
    }

    preserveFormOnEnter = false;
  }

  function clearAll() {
    resetFormFields("logistica");
    resetFormFields("financeira");
    setThemeArea("logistica");
    lastSourceArea = "logistica";
    clearSessionCache();
    setScreen("home");
  }

  function goBackToForm() {
    preserveFormOnEnter = true;
    activeHistoryId = null;
    setScreen(lastSourceArea);
    preserveFormOnEnter = false;
  }

  window.addEventListener("DOMContentLoaded", function () {
    const currentTheme = readSavedTheme();
    applyTheme(currentTheme);
    persistTheme(currentTheme);
    resetFormFields("logistica");
    resetFormFields("financeira");
    setScreen("home");
    renderHistoryList();

    if (elements.themeToggle) {
      elements.themeToggle.addEventListener("click", function () {
        const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
        applyTheme(nextTheme);
        persistTheme(nextTheme);
      });
    }

    elements.screenTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        const target = tab.dataset.screen;

        if (target === "logistica" || target === "financeira") {
          enterFormScreen(target, { preserve: preserveFormOnEnter });
          return;
        }

        setScreen(target);
      });
    });

    elements.screenGoButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const target = button.dataset.targetScreen;
        if (!target) {
          return;
        }

        if (target === "logistica" || target === "financeira") {
          enterFormScreen(target, { preserve: preserveFormOnEnter });
          return;
        }

        setScreen(target);
      });
    });

    if (elements.clearLogButton) {
      elements.clearLogButton.addEventListener("click", function () {
        resetFormFields("logistica");
      });
    }

    if (elements.clearFinButton) {
      elements.clearFinButton.addEventListener("click", function () {
        resetFormFields("financeira");
      });
    }

    if (elements.showLogResult) {
      elements.showLogResult.addEventListener("click", function () {
        showResult("logistica");
      });
    }

    if (elements.showFinResult) {
      elements.showFinResult.addEventListener("click", function () {
        showResult("financeira");
      });
    }

    if (elements.analyzeLogButton) {
      elements.analyzeLogButton.addEventListener("click", function () {
        showSuggestions("logistica");
      });
    }

    if (elements.analyzeFinButton) {
      elements.analyzeFinButton.addEventListener("click", function () {
        showSuggestions("financeira");
      });
    }

    if (elements.backToFormBtn) {
      elements.backToFormBtn.addEventListener("click", goBackToForm);
    }

    if (elements.backToHistoryBtn) {
      elements.backToHistoryBtn.addEventListener("click", function () {
        clearSessionCache();
        showSuggestionsHistoryView();
      });
    }

    if (elements.clearHistoryBtn) {
      elements.clearHistoryBtn.addEventListener("click", function () {
        if (loadHistory().length === 0) {
          return;
        }

        const confirmed = window.confirm("Deseja apagar todo o histórico de gráficos e sugestões? Esta ação não pode ser desfeita.");
        if (!confirmed) {
          return;
        }

        clearHistory();
      });
    }

    if (elements.resultToSuggestionsBtn) {
      elements.resultToSuggestionsBtn.addEventListener("click", function () {
        showSuggestions(lastSourceArea);
      });
    }

    if (elements.suggestionsToResultBtn) {
      elements.suggestionsToResultBtn.addEventListener("click", openFullResultFromSuggestions);
    }

    if (elements.restartBtn) {
      elements.restartBtn.addEventListener("click", clearAll);
    }

    elements.chips.forEach((chip) => {
      chip.addEventListener("click", function () {
        applyExample(chip.dataset.example);
      });
    });
  });
})();
