const tabButtons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".panel");
const activeModuleText = byId("moduloAtivo");

// Dark Mode Toggle
(function() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) {
    return;
  }
  const THEME_KEY = "alex_site_theme";
  const LEGACY_THEME_KEYS = ["winston_theme", "alex_presentation_theme"];

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

  const currentTheme = readSavedTheme();
  const isDarkMode = currentTheme === "dark";
  
  // Aplica o tema ao carregar
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  const themeIcon = themeToggle.querySelector(".theme-icon");
  if (themeIcon) {
    themeIcon.textContent = isDarkMode ? "☀️" : "🌙";
  }

  persistTheme(isDarkMode ? "dark" : "light");
  
  // Event listener para o botão
  themeToggle.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    persistTheme(isDark ? "dark" : "light");

    if (themeIcon) {
      themeIcon.textContent = isDark ? "☀️" : "🌙";
    }

    // Recalcula o módulo ativo para redesenhar o gráfico com as cores do novo tema.
    const activePanel = document.querySelector(".panel.active");
    const panelId = activePanel ? activePanel.id : null;
    const calculator = panelId ? calculatorsByPanel[panelId] : null;

    if (calculator) {
      suppressHistorySave = true;
      try {
        calculator();
      } finally {
        suppressHistorySave = false;
      }
    }
  });
})();

const calculatorsByPanel = {
  "juros-compostos": calcularJurosCompostos,
  "juros-simples": calcularJurosSimples,
  "equacao-primeiro": resolverEquacaoPrimeiro,
  "equacao-segundo": resolverEquacaoSegundo,
  "funcao-primeiro": calcularFuncaoPrimeiro,
  "funcao-segundo": calcularFuncaoSegundo,
  "inequacao-primeiro": resolverInequacaoPrimeiro,
  "inequacao-segundo": resolverInequacaoSegundo,
  "conjuntos": calcularConjuntos,
  "dominio-imagem": gerarDominioImagem
};

const HISTORY_KEY = "winston_calculos_historico";
let historicoCalculos = [];
let suppressHistorySave = false;

function showPanel(panelId) {
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === panelId);
  });

  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === panelId);
    btn.setAttribute("aria-selected", btn.dataset.tab === panelId ? "true" : "false");
  });

  const activeButton = [...tabButtons].find((btn) => btn.dataset.tab === panelId);

  if (activeButton && activeModuleText) {
    activeModuleText.textContent = activeButton.textContent;
  }
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    showPanel(btn.dataset.tab);
  });

  btn.addEventListener("keydown", (event) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];

    if (!keys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    const buttons = [...tabButtons];
    const currentIndex = buttons.indexOf(btn);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % buttons.length;
    }

    if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = buttons.length - 1;
    }

    buttons[nextIndex].focus();
    showPanel(buttons[nextIndex].dataset.tab);
  });
});

function byId(id) {
  return document.getElementById(id);
}

function toNumber(id) {
  const field = byId(id);
  return field ? Number.parseFloat(field.value) : Number.NaN;
}

function toText(id) {
  const field = byId(id);
  return field ? field.value : "";
}

function print(targetId, message) {
  const output = byId(targetId);
  output.textContent = message;

  if (message.startsWith("Informe") || message.startsWith("Preencha")) {
    output.classList.add("error");
  } else {
    output.classList.remove("error");
  }
}

const panelByModulo = {
  "Juros Compostos": "juros-compostos",
  "Juros Simples": "juros-simples",
  "Equação 1º": "equacao-primeiro",
  "Equação 2º": "equacao-segundo",
  "Função 1º": "funcao-primeiro",
  "Função 2º": "funcao-segundo",
  "Inequação 1º": "inequacao-primeiro",
  "Inequação 2º": "inequacao-segundo",
  Conjuntos: "conjuntos",
  "Domínio e Imagem": "dominio-imagem"
};

function snapshotPanelState(panelId) {
  const panel = byId(panelId);

  if (!panel) {
    return null;
  }

  const state = {};
  panel.querySelectorAll("input[id], select[id]").forEach((field) => {
    state[field.id] = field.value;
  });

  return state;
}

function restorePanelState(panelId, formData) {
  if (!formData || typeof formData !== "object") {
    return;
  }

  Object.entries(formData).forEach(([id, value]) => {
    const field = byId(id);

    if (!field) {
      return;
    }

    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });

  const calculator = calculatorsByPanel[panelId];
  if (calculator) {
    calculator();
  }
}

function addHistoryEntry(modulo, descricao) {
  if (suppressHistorySave) {
    return;
  }

  const panelId = panelByModulo[modulo] || null;
  const formData = panelId ? snapshotPanelState(panelId) : null;

  historicoCalculos.unshift({
    modulo,
    descricao,
    quando: new Date().toLocaleString("pt-BR"),
    panelId,
    formData
  });

  historicoCalculos = historicoCalculos.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historicoCalculos));
  renderHistorico();
}

function renderHistorico() {
  const list = byId("historicoLista");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (historicoCalculos.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "history-empty";
    emptyItem.textContent = "Ainda não há contas registradas.";
    list.appendChild(emptyItem);
    return;
  }

  historicoCalculos.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const text = document.createElement("span");
    text.className = "history-text";
    text.textContent = `[${item.quando}] ${item.modulo}: ${item.descricao}`;
    li.appendChild(text);

    const recreateBtn = document.createElement("button");
    recreateBtn.type = "button";
    recreateBtn.className = "history-recreate-btn";
    recreateBtn.textContent = "Recriar";

    const canRecreate = Boolean(item.panelId && item.formData);
    recreateBtn.disabled = !canRecreate;

    if (canRecreate) {
      recreateBtn.addEventListener("click", () => {
        showPanel(item.panelId);
        restorePanelState(item.panelId, item.formData);
      });
    } else {
      recreateBtn.title = "Esse registro antigo não possui dados para recriar.";
    }

    li.appendChild(recreateBtn);
    list.appendChild(li);
  });
}

function loadHistorico() {
  const raw = localStorage.getItem(HISTORY_KEY);

  if (!raw) {
    historicoCalculos = [];
    renderHistorico();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    historicoCalculos = Array.isArray(parsed) ? parsed : [];
  } catch {
    historicoCalculos = [];
  }

  renderHistorico();
}

function limparHistorico() {
  historicoCalculos = [];
  localStorage.removeItem(HISTORY_KEY);
  renderHistorico();
}

function isInvalidNumber(value) {
  return Number.isNaN(value) || !Number.isFinite(value);
}

function isValidInterestUnit(unit) {
  return unit === "dia" || unit === "mes" || unit === "ano";
}

function money(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function periodToDays(unit) {
  if (!isValidInterestUnit(unit)) {
    return null;
  }

  if (unit === "dia") {
    return 1;
  }

  if (unit === "mes") {
    return 30;
  }

  return 360;
}

function convertPeriods(value, fromUnit, toUnit) {
  const fromDays = periodToDays(fromUnit);
  const toDays = periodToDays(toUnit);

  if (fromDays === null || toDays === null) {
    return null;
  }

  const valueInDays = value * fromDays;
  return valueInDays / toDays;
}

function isSafeResult(value) {
  return Number.isFinite(value) && Math.abs(value) < Number.MAX_VALUE;
}

function formatNumber(value, maxDecimals = 6) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals
  });
}

function renderRichOutput(targetId, summaryHtml, graphHtml) {
  const output = byId(targetId);
  output.classList.remove("error");
  output.innerHTML = `<div class="result-content">${summaryHtml}${graphHtml || ""}</div>`;
}

function toFixedNumber(value, decimals = 2) {
  return Number.parseFloat(value.toFixed(decimals));
}

function isDarkTheme() {
  return document.body.classList.contains("dark-mode");
}

function getChartPalette() {
  if (isDarkTheme()) {
    return {
      label: "#d7e3f3",
      grid: "rgba(232,238,245,0.24)",
      axis: "rgba(255,255,255,0.78)",
      curve: "#9db8ff"
    };
  }

  return {
    label: "#54627a",
    grid: "rgba(84,98,122,0.15)",
    axis: "rgba(20,33,61,0.5)",
    curve: "#1f2d4d"
  };
}

function svgHeader(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gráfico matemático" style="display:block; max-width:100%;">`;
}

function createAxisLabels(width, height, xLabel, yLabel, labelColor = "#54627a") {
  return `
    <text x="${width - 18}" y="${height - 12}" text-anchor="end" font-size="12" fill="${labelColor}">${xLabel}</text>
    <text x="18" y="18" text-anchor="start" font-size="12" fill="${labelColor}">${yLabel}</text>`;
}

function createLinePath(points, toX, toY) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${toX(point.x)} ${toY(point.y)}`).join(" ");
}

function createCircle(cx, cy, color = "#ff7a30", radius = 4) {
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}" stroke="#fff" stroke-width="2"></circle>`;
}

function criarGraficoJuros(capital, taxaPercentual, tempo, isComposto) {
  const palette = getChartPalette();
  const taxa = taxaPercentual / 100;
  const samples = Math.max(20, Math.ceil(tempo * 12));
  const xMax = Math.max(tempo, 1);
  const points = [];

  for (let index = 0; index <= samples; index += 1) {
    const x = (xMax * index) / samples;
    const y = isComposto ? capital * (1 + taxa) ** x : capital * (1 + taxa * x);
    points.push({ x, y });
  }

  const maxY = Math.max(...points.map((point) => point.y), capital) * 1.12;
  const minY = 0;
  const width = 760;
  const height = 320;
  const paddingLeft = 86;
  const paddingRight = 56;
  const paddingTop = 36;
  const paddingBottom = 46;
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  const toX = (value) => paddingLeft + (value / xMax) * graphWidth;
  const toY = (value) => paddingTop + graphHeight - ((value - minY) / (maxY - minY)) * graphHeight;

  const originY = toY(0);
  const path = createLinePath(points, toX, toY);
  const finalPoint = points[points.length - 1];
  const finalText = isComposto ? "Crescimento composto" : "Crescimento simples";

  let svg = svgHeader(width, height);
  for (let step = 0; step <= 5; step += 1) {
    const x = paddingLeft + (graphWidth * step) / 5;
    const value = (xMax * step) / 5;
    svg += `<line x1="${x}" y1="${paddingTop}" x2="${x}" y2="${height - paddingBottom}" stroke="${palette.grid}" stroke-width="1" />`;
    svg += `<text x="${x}" y="${height - 22}" text-anchor="middle" font-size="11" fill="${palette.label}">${formatNumber(value, 1)}</text>`;
  }

  for (let step = 0; step <= 4; step += 1) {
    const y = paddingTop + (graphHeight * step) / 4;
    const value = maxY - ((maxY - minY) * step) / 4;
    svg += `<line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="${palette.grid}" stroke-width="1" />`;
    svg += `<text x="${paddingLeft - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="${palette.label}">${money(value)}</text>`;
  }

  svg += `<line x1="${paddingLeft}" y1="${toY(0)}" x2="${width - paddingRight}" y2="${toY(0)}" stroke="${palette.axis}" stroke-width="2" />`;
  svg += `<line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" stroke="${palette.axis}" stroke-width="2" />`;
  svg += `<path d="${path}" fill="none" stroke="#ff7a30" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`;
  svg += createCircle(toX(0), toY(capital), "#009fb7", 5);
  svg += createCircle(toX(finalPoint.x), toY(finalPoint.y), "#ff7a30", 5);
  svg += `<text x="${width - paddingRight - 6}" y="${toY(finalPoint.y) - 12}" text-anchor="end" font-size="12" fill="${palette.label}">${money(finalPoint.y)}</text>`;
  svg += createAxisLabels(width, height, "Tempo", "Montante", palette.label);
  svg += `</svg>`;

  return `<div class="graph-block"><div class="graph-title">${finalText}</div>${svg}</div>`;
}

function criarGraficoParabola(a, b, c, options = {}) {
  const palette = getChartPalette();
  const epsilon = 1e-10;
  const delta = b * b - 4 * a * c;
  const deltaCorrigido = Math.abs(delta) < epsilon ? 0 : delta;
  const xVertices = -b / (2 * a);
  const yVertices = a * xVertices * xVertices + b * xVertices + c;
  const raiz1 = deltaCorrigido >= 0 ? (-b - Math.sqrt(deltaCorrigido)) / (2 * a) : null;
  const raiz2 = deltaCorrigido >= 0 ? (-b + Math.sqrt(deltaCorrigido)) / (2 * a) : null;
  const highlightX = typeof options.highlightX === "number" ? options.highlightX : null;
  const spanBase = Math.max(4, Math.abs(xVertices) + 3, raiz1 !== null && raiz2 !== null ? Math.abs(raiz2 - raiz1) * 1.6 + 2 : 0);
  const span = highlightX === null ? spanBase : Math.max(spanBase, Math.abs(highlightX - xVertices) + 2);
  const xMin = xVertices - span;
  const xMax = xVertices + span;
  const width = 760;
  const height = 360;
  const paddingLeft = 86;
  const paddingRight = 56;
  const paddingTop = 42;
  const paddingBottom = 52;
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;
  const sampleCount = 180;
  const points = [];

  for (let index = 0; index <= sampleCount; index += 1) {
    const x = xMin + ((xMax - xMin) * index) / sampleCount;
    const y = a * x * x + b * x + c;
    points.push({ x, y });
  }

  const minY = Math.min(0, ...points.map((point) => point.y));
  const maxY = Math.max(0, ...points.map((point) => point.y));
  const yMargin = Math.max(1, (maxY - minY) * 0.12);
  const yMin = minY - yMargin;
  const yMax = maxY + yMargin;

  const toX = (value) => paddingLeft + ((value - xMin) / (xMax - xMin)) * graphWidth;
  const toY = (value) => paddingTop + graphHeight - ((value - yMin) / (yMax - yMin)) * graphHeight;
  const zeroY = toY(0);
  const path = createLinePath(points, toX, toY);

  let svg = svgHeader(width, height);
  for (let step = 0; step <= 6; step += 1) {
    const x = paddingLeft + (graphWidth * step) / 6;
    const value = xMin + ((xMax - xMin) * step) / 6;
    svg += `<line x1="${x}" y1="${paddingTop}" x2="${x}" y2="${height - paddingBottom}" stroke="${palette.grid}" stroke-width="1" />`;
    svg += `<text x="${x}" y="${height - 20}" text-anchor="middle" font-size="11" fill="${palette.label}">${formatNumber(value, 2)}</text>`;
  }

  for (let step = 0; step <= 4; step += 1) {
    const y = paddingTop + (graphHeight * step) / 4;
    const value = yMax - ((yMax - yMin) * step) / 4;
    svg += `<line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="${palette.grid}" stroke-width="1" />`;
    svg += `<text x="${paddingLeft - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="${palette.label}">${formatNumber(value, 2)}</text>`;
  }

  if (zeroY >= paddingTop && zeroY <= height - paddingBottom) {
    svg += `<line x1="${paddingLeft}" y1="${zeroY}" x2="${width - paddingRight}" y2="${zeroY}" stroke="${palette.axis}" stroke-width="2" />`;
  }

  svg += `<line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" stroke="${palette.axis}" stroke-width="2" />`;
  svg += `<path d="${path}" fill="none" stroke="${palette.curve}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`;

  if (options.fillPositive) {
    const positiveSegments = [];
    let segment = [];

    points.forEach((point) => {
      if (point.y > 0) {
        segment.push(point);
      } else if (segment.length > 0) {
        positiveSegments.push(segment);
        segment = [];
      }
    });

    if (segment.length > 0) {
      positiveSegments.push(segment);
    }

    positiveSegments.forEach((segmentPoints) => {
      const areaPath = [`M ${toX(segmentPoints[0].x)} ${zeroY}`];
      segmentPoints.forEach((point) => {
        areaPath.push(`L ${toX(point.x)} ${toY(point.y)}`);
      });
      areaPath.push(`L ${toX(segmentPoints[segmentPoints.length - 1].x)} ${zeroY} Z`);
      svg += `<path d="${areaPath.join(" ")}" fill="rgba(255,122,48,0.18)" stroke="none" />`;
    });
  }

  if (deltaCorrigido >= 0 && raiz1 !== null && raiz2 !== null) {
    svg += createCircle(toX(raiz1), zeroY, "#b4472d", 5);
    svg += createCircle(toX(raiz2), zeroY, "#b4472d", 5);
    svg += `<text x="${toX(raiz1)}" y="${zeroY - 10}" text-anchor="middle" font-size="11" fill="#b4472d">${formatNumber(raiz1, 2)}</text>`;
    svg += `<text x="${toX(raiz2)}" y="${zeroY - 10}" text-anchor="middle" font-size="11" fill="#b4472d">${formatNumber(raiz2, 2)}</text>`;
  }

  svg += createCircle(toX(xVertices), toY(yVertices), "#009fb7", 5);
  svg += `<text x="${toX(xVertices)}" y="${toY(yVertices) - 10}" text-anchor="middle" font-size="11" fill="#009fb7">V(${formatNumber(xVertices, 2)}, ${formatNumber(yVertices, 2)})</text>`;

  if (highlightX !== null) {
    const highlightY = a * highlightX * highlightX + b * highlightX + c;
    svg += `<line x1="${toX(highlightX)}" y1="${zeroY}" x2="${toX(highlightX)}" y2="${toY(highlightY)}" stroke="#ff7a30" stroke-dasharray="6 6" stroke-width="2" />`;
    svg += createCircle(toX(highlightX), toY(highlightY), "#ff7a30", 6);
    svg += `<text x="${toX(highlightX)}" y="${toY(highlightY) - 12}" text-anchor="middle" font-size="11" fill="#ff7a30">f(${formatNumber(highlightX, 2)}) = ${formatNumber(highlightY, 2)}</text>`;
  }

  svg += createAxisLabels(width, height, "x", "f(x)", palette.label);
  svg += `</svg>`;

  const rootsText = deltaCorrigido >= 0
    ? `Raízes: ${formatNumber(raiz1, 3)} e ${formatNumber(raiz2, 3)}`
    : "Sem raízes reais";

  return `<div class="graph-block"><div class="graph-title">${rootsText}</div>${svg}</div>`;
}

function criarGraficoJurosComparativo(tipo, capital, taxaPercentual, tempo) {
  return criarGraficoJuros(capital, taxaPercentual, tempo, tipo === "composto");
}

function criarDiagramaVenn(setA, setB, operacao) {
  const chartPalette = getChartPalette();
  const a = [...setA];
  const b = [...setB];
  const intersecao = a.filter((item) => b.includes(item));
  const soA = a.filter((item) => !b.includes(item));
  const soB = b.filter((item) => !a.includes(item));
  const width = 720;
  const height = 320;
  const cx1 = 250;
  const cx2 = 470;
  const cy = 150;
  const r = 110;

  const colors = {
    uniao: { a: "rgba(255, 122, 48, 0.25)", b: "rgba(0, 159, 183, 0.25)", line: "#ff7a30" },
    intersecao: { a: "rgba(255, 122, 48, 0.12)", b: "rgba(0, 159, 183, 0.12)", line: "#14213d" },
    diferencaAB: { a: "rgba(255, 122, 48, 0.35)", b: "rgba(0, 159, 183, 0.08)", line: "#ff7a30" },
    diferencaBA: { a: "rgba(255, 122, 48, 0.08)", b: "rgba(0, 159, 183, 0.35)", line: "#009fb7" },
    simetrica: { a: "rgba(255, 122, 48, 0.28)", b: "rgba(0, 159, 183, 0.28)", line: "#6d5bd0" }
  };

  const palette = colors[operacao] || colors.uniao;
  const summary = {
    uniao: `União: ${formatSet([...new Set([...a, ...b])])}`,
    intersecao: `Interseção: ${formatSet(intersecao)}`,
    diferencaAB: `Diferença A - B: ${formatSet(soA)}`,
    diferencaBA: `Diferença B - A: ${formatSet(soB)}`,
    simetrica: `Diferença simétrica: ${formatSet([...soA, ...soB])}`
  };

  let svg = svgHeader(width, height);
  svg += `<circle cx="${cx1}" cy="${cy}" r="${r}" fill="${palette.a}" stroke="${palette.line}" stroke-width="3" />`;
  svg += `<circle cx="${cx2}" cy="${cy}" r="${r}" fill="${palette.b}" stroke="${palette.line}" stroke-width="3" />`;
  svg += `<text x="${cx1}" y="${cy - 130}" text-anchor="middle" fill="${chartPalette.label}" font-size="15" font-weight="700">A</text>`;
  svg += `<text x="${cx2}" y="${cy - 130}" text-anchor="middle" fill="${chartPalette.label}" font-size="15" font-weight="700">B</text>`;
  svg += `<text x="${(cx1 + cx2) / 2}" y="${cy + 6}" text-anchor="middle" fill="${chartPalette.label}" font-size="15" font-weight="700">A ∩ B</text>`;
  svg += `<text x="${cx1 - 60}" y="${cy + 6}" text-anchor="middle" fill="${chartPalette.label}" font-size="12">${soA.length ? soA.join(", ") : "∅"}</text>`;
  svg += `<text x="${cx2 + 60}" y="${cy + 6}" text-anchor="middle" fill="${chartPalette.label}" font-size="12">${soB.length ? soB.join(", ") : "∅"}</text>`;
  svg += `<text x="360" y="290" text-anchor="middle" fill="${chartPalette.label}" font-size="12">${intersecao.length ? intersecao.join(", ") : "∅"}</text>`;
  svg += `</svg>`;

  return `<div class="graph-block"><div class="graph-title">${summary[operacao] || summary.uniao}</div>${svg}</div>`;
}

function nomeUnidade(valor, singular, plural) {
  return Math.abs(valor) === 1 ? singular : plural;
}

function unidadePorExtenso(codigo, plural = false) {
  if (codigo === "dia") {
    return plural ? "dias" : "dia";
  }

  if (codigo === "mes") {
    return plural ? "meses" : "mês";
  }

  return plural ? "anos" : "ano";
}

function atualizarExplicacaoJuros(tipo) {
  const isComposto = tipo === "composto";
  const prefixo = isComposto ? "Composto" : "Simples";
  const capital = toNumber(`capital${prefixo}`);
  const taxaValor = toNumber(`taxa${prefixo}`);
  const tempo = toNumber(`tempo${prefixo}`);
  const taxaUnidade = toText(`taxa${prefixo}Unidade`);
  const tempoUnidade = toText(`tempo${prefixo}Unidade`);
  const saidaId = isComposto ? "explicaComposto" : "explicaSimples";

  if ([capital, taxaValor, tempo].some(isInvalidNumber) || capital < 0 || tempo < 0) {
    byId(saidaId).textContent = "Preencha os campos para visualizar o cenário antes de calcular.";
    return;
  }

  const periodos = convertPeriods(tempo, tempoUnidade, taxaUnidade);
    if (periodos === null) {
      byId(saidaId).textContent = "A unidade selecionada é inválida.";
      return;
    }
  const jurosTexto = isComposto ? "capitalização" : "acréscimo linear";
  const unidadeTaxa = unidadePorExtenso(taxaUnidade, false);
  const unidadeTempo = nomeUnidade(
    tempo,
    unidadePorExtenso(tempoUnidade, false),
    unidadePorExtenso(tempoUnidade, true)
  );

  byId(saidaId).textContent =
    `Você investe ${money(capital)} com taxa de ${formatNumber(taxaValor, 4)}% por ${unidadeTaxa}, ` +
    `durante ${formatNumber(tempo, 2)} ${unidadeTempo}. ` +
    `Isso equivale a ${formatNumber(periodos, 4)} período(s) da taxa, com ${jurosTexto}.`;
}

window.atualizarExplicacaoJuros = atualizarExplicacaoJuros;

function preencherExemplo(kind, example) {
  if (kind === "composto" && example === "investimento") {
    byId("capitalComposto").value = "2500";
    byId("taxaComposta").value = "1.2";
    byId("taxaCompostaUnidade").value = "mes";
    byId("tempoComposto").value = "12";
    byId("tempoCompostoUnidade").value = "mes";
    byId("capitalComposto").dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  if (kind === "composto" && example === "curto") {
    byId("capitalComposto").value = "1500";
    byId("taxaComposta").value = "0.15";
    byId("taxaCompostaUnidade").value = "dia";
    byId("tempoComposto").value = "45";
    byId("tempoCompostoUnidade").value = "dia";
    byId("capitalComposto").dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  if (kind === "simples" && example === "emprestimo") {
    byId("capitalSimples").value = "1800";
    byId("taxaSimples").value = "2";
    byId("taxaSimplesUnidade").value = "mes";
    byId("tempoSimples").value = "6";
    byId("tempoSimplesUnidade").value = "mes";
    atualizarExplicacaoJuros("simples");
    return;
  }

  if (kind === "simples" && example === "anual") {
    byId("capitalSimples").value = "5000";
    byId("taxaSimples").value = "10";
    byId("taxaSimplesUnidade").value = "ano";
    byId("tempoSimples").value = "1";
    byId("tempoSimplesUnidade").value = "ano";
    atualizarExplicacaoJuros("simples");
    return;
  }

  if (kind === "eq1" && example === "basico") {
    byId("eq1a").value = "3";
    byId("eq1b").value = "-9";
    return;
  }

  if (kind === "eq1" && example === "negativo") {
    byId("eq1a").value = "-2";
    byId("eq1b").value = "8";
    return;
  }

  if (kind === "eq2" && example === "duas-raizes") {
    byId("eq2a").value = "1";
    byId("eq2b").value = "-5";
    byId("eq2c").value = "6";
    return;
  }

  if (kind === "eq2" && example === "raiz-dupla") {
    byId("eq2a").value = "1";
    byId("eq2b").value = "-4";
    byId("eq2c").value = "4";
    return;
  }

  if (kind === "func1" && example === "basico") {
    byId("func1a").value = "3";
    byId("func1b").value = "-9";
    byId("func1x").value = "2";
    return;
  }

  if (kind === "func1" && example === "negativo") {
    byId("func1a").value = "-2";
    byId("func1b").value = "8";
    byId("func1x").value = "4";
    return;
  }

  if (kind === "func2" && example === "duas-raizes") {
    byId("func2a").value = "1";
    byId("func2b").value = "-5";
    byId("func2c").value = "6";
    byId("func2x").value = "2";
    return;
  }

  if (kind === "func2" && example === "raiz-dupla") {
    byId("func2a").value = "1";
    byId("func2b").value = "-4";
    byId("func2c").value = "4";
    byId("func2x").value = "3";
    return;
  }

  if (kind === "ineq1" && example === "positivo") {
    byId("ineq1a").value = "2";
    byId("ineq1b").value = "-6";
    return;
  }

  if (kind === "ineq1" && example === "negativo") {
    byId("ineq1a").value = "-3";
    byId("ineq1b").value = "9";
    return;
  }

  if (kind === "ineq2" && example === "aberta") {
    byId("ineq2a").value = "1";
    byId("ineq2b").value = "-3";
    byId("ineq2c").value = "-4";
    return;
  }

  if (kind === "ineq2" && example === "fechada") {
    byId("ineq2a").value = "-1";
    byId("ineq2b").value = "5";
    byId("ineq2c").value = "-6";
    return;
  }

  if (kind === "conjuntos" && example === "uniao") {
    byId("setA").value = "1, 2, 3";
    byId("setB").value = "3, 4, 5";
    byId("setOperacao").value = "uniao";
    return;
  }

  if (kind === "conjuntos" && example === "intersecao") {
    byId("setA").value = "a, b, c";
    byId("setB").value = "b, c, d";
    byId("setOperacao").value = "intersecao";
    return;
  }

  if (kind === "dominio" && example === "intervalo1") {
    byId("domXMin").value = "-2";
    byId("domXCompEsq").value = "<=";
    byId("domXCompDir").value = "<=";
    byId("domXMax").value = "3";
    byId("domYMin").value = "-1";
    byId("domYCompEsq").value = "<=";
    byId("domYCompDir").value = "<=";
    byId("domYMax").value = "4";
    return;
  }

  if (kind === "dominio" && example === "intervalo2") {
    byId("domXMin").value = "0";
    byId("domXCompEsq").value = "<";
    byId("domXCompDir").value = "<=";
    byId("domXMax").value = "5";
    byId("domYMin").value = "-2";
    byId("domYCompEsq").value = "<=";
    byId("domYCompDir").value = "<";
    byId("domYMax").value = "2";
  }
}

function aplicarTextoExemplo(kind, example) {
  const textos = {
    "composto:investimento": "Você investe R$ 2.500,00 com taxa de 1,2% por mês, durante 12 meses. Isso equivale a 12 período(s) da taxa, com capitalização.",
    "composto:curto": "Você investe R$ 1.500,00 com taxa de 0,15% por dia, durante 45 dias. Isso equivale a 45 período(s) da taxa, com capitalização.",
    "simples:emprestimo": "Você investe R$ 1.800,00 com taxa de 2% por mês, durante 6 meses. Isso equivale a 6 período(s) da taxa, com acréscimo linear.",
    "simples:anual": "Você investe R$ 5.000,00 com taxa de 10% por ano, durante 1 ano. Isso equivale a 1 período(s) da taxa, com acréscimo linear.",
    "eq1:basico": "Exemplo carregado: 3x - 9 = 0. Ao resolver, você encontra x = 3.",
    "eq1:negativo": "Exemplo carregado: -2x + 8 = 0. Ao resolver, você encontra x = 4.",
    "eq2:duas-raizes": "Exemplo carregado: x² - 5x + 6 = 0. Delta positivo, com duas raízes reais.",
    "eq2:raiz-dupla": "Exemplo carregado: x² - 4x + 4 = 0. Delta zero, com raiz real dupla.",
    "func1:basico": "Exemplo carregado: f(x) = 3x - 9, com x = 2.",
    "func1:negativo": "Exemplo carregado: f(x) = -2x + 8, com x = 4.",
    "func2:duas-raizes": "Exemplo carregado: f(x) = x² - 5x + 6, com x = 2.",
    "func2:raiz-dupla": "Exemplo carregado: f(x) = x² - 4x + 4, com x = 3.",
    "ineq1:positivo": "Exemplo carregado: 2x - 6 > 0. Como a é positivo, a solução fica x > 3.",
    "ineq1:negativo": "Exemplo carregado: -3x + 9 > 0. Como a é negativo, o sinal inverte e a solução fica x < 3.",
    "ineq2:aberta": "Exemplo carregado: x² - 3x - 4 > 0. A parábola abre para cima e gera solução fora das raízes.",
    "ineq2:fechada": "Exemplo carregado: -x² + 5x - 6 > 0. A parábola abre para baixo e gera solução entre as raízes.",
    "conjuntos:uniao": "Exemplo carregado para união: A={1, 2, 3} e B={3, 4, 5}.",
    "conjuntos:intersecao": "Exemplo carregado para interseção: A={a, b, c} e B={b, c, d}.",
    "dominio:intervalo1": "Exemplo carregado: domínio e imagem com limites fechados (incluem os extremos).",
    "dominio:intervalo2": "Exemplo carregado: domínio e imagem com limites mistos (abertos e fechados)."
  };

  const alvoPorTipo = {
    composto: "explicaComposto",
    simples: "explicaSimples",
    eq1: "explicaEq1",
    eq2: "explicaEq2",
    func1: "explicaFunc1",
    func2: "explicaFunc2",
    ineq1: "explicaIneq1",
    ineq2: "explicaIneq2",
    conjuntos: "explicaConjuntos",
    dominio: "explicaDominio"
  };

  const alvoId = alvoPorTipo[kind];
  const saida = byId(alvoId);
  const texto = textos[`${kind}:${example}`];

  if (saida && texto) {
    saida.textContent = texto;
  }
}

function aplicarExemplo(kind, example) {
  preencherExemplo(kind, example);
  aplicarTextoExemplo(kind, example);
}

window.aplicarExemplo = aplicarExemplo;

function calcularJurosCompostos() {
  const capital = toNumber("capitalComposto");
  const taxa = toNumber("taxaComposta") / 100;
  const tempo = toNumber("tempoComposto");
  const taxaUnidade = toText("taxaCompostaUnidade");
  const tempoUnidade = toText("tempoCompostoUnidade");

  if ([capital, taxa, tempo].some(isInvalidNumber) || capital < 0 || tempo < 0) {
    print("saidaComposto", "Informe capital e tempo válidos (maiores ou iguais a zero). ");
    return;
  }

  const periodos = convertPeriods(tempo, tempoUnidade, taxaUnidade);
  if (periodos === null) {
    print("saidaComposto", "A unidade selecionada é inválida. Reabra a tela e tente novamente.");
    return;
  }

  const montante = capital * (1 + taxa) ** periodos;
  const juros = montante - capital;

  if (!isSafeResult(montante) || !isSafeResult(juros)) {
    print("saidaComposto", "O resultado ficou grande demais para exibir com segurança.");
    return;
  }

  const resumo = `Períodos equivalentes: ${formatNumber(periodos, 4)} | Juros: ${money(juros)} | Montante: ${money(montante)}`;
  renderRichOutput("saidaComposto", `<p class="result-main">${resumo}</p>`, criarGraficoJuros(capital, taxa * 100, tempo, true));

  addHistoryEntry(
    "Juros Compostos",
    `Capital ${money(capital)}, taxa ${formatNumber(taxa * 100, 4)}%, tempo ${formatNumber(tempo, 4)} (${tempoUnidade}) -> Montante ${money(montante)}`
  );
}

function calcularJurosSimples() {
  const capital = toNumber("capitalSimples");
  const taxa = toNumber("taxaSimples") / 100;
  const tempo = toNumber("tempoSimples");
  const taxaUnidade = toText("taxaSimplesUnidade");
  const tempoUnidade = toText("tempoSimplesUnidade");

  if ([capital, taxa, tempo].some(isInvalidNumber) || capital < 0 || tempo < 0) {
    print("saidaSimples", "Informe capital e tempo válidos (maiores ou iguais a zero). ");
    return;
  }

  const periodos = convertPeriods(tempo, tempoUnidade, taxaUnidade);
  if (periodos === null) {
    print("saidaSimples", "A unidade selecionada é inválida. Reabra a tela e tente novamente.");
    return;
  }

  const juros = capital * taxa * periodos;
  const montante = capital + juros;

  if (!isSafeResult(montante) || !isSafeResult(juros)) {
    print("saidaSimples", "O resultado ficou grande demais para exibir com segurança.");
    return;
  }

  const resumo = `Períodos equivalentes: ${formatNumber(periodos, 4)} | Juros: ${money(juros)} | Montante: ${money(montante)}`;
  renderRichOutput("saidaSimples", `<p class="result-main">${resumo}</p>`, criarGraficoJuros(capital, taxa * 100, tempo, false));

  addHistoryEntry(
    "Juros Simples",
    `Capital ${money(capital)}, taxa ${formatNumber(taxa * 100, 4)}%, tempo ${formatNumber(tempo, 4)} (${tempoUnidade}) -> Montante ${money(montante)}`
  );
}

function resolverEquacaoPrimeiro() {
  const a = toNumber("eq1a");
  const b = toNumber("eq1b");
  const epsilon = 1e-10;

  if (isInvalidNumber(a) || isInvalidNumber(b) || Math.abs(a) < epsilon) {
    print("saidaEq1", "Informe a e b válidos, com a diferente de zero.");
    return;
  }

  const x = -b / a;
  print("saidaEq1", `Solução: x = ${formatNumber(x)}`);
  addHistoryEntry("Equação 1º", `a=${formatNumber(a)}, b=${formatNumber(b)} -> x=${formatNumber(x)}`);
}

function resolverEquacaoSegundo() {
  const a = toNumber("eq2a");
  const b = toNumber("eq2b");
  const c = toNumber("eq2c");
  const epsilon = 1e-10;

  if ([a, b, c].some(isInvalidNumber) || Math.abs(a) < epsilon) {
    print("saidaEq2", "Informe a, b e c válidos, com a diferente de zero.");
    return;
  }

  const delta = b * b - 4 * a * c;
  const deltaCorrigido = Math.abs(delta) < epsilon ? 0 : delta;

  if (deltaCorrigido < 0) {
    print("saidaEq2", `Delta = ${formatNumber(deltaCorrigido)}. Não há raízes reais.`);
    return;
  }

  const x1 = (-b + Math.sqrt(deltaCorrigido)) / (2 * a);
  const x2 = (-b - Math.sqrt(deltaCorrigido)) / (2 * a);

  const resumo = `Delta = ${formatNumber(deltaCorrigido)} | x1 = ${formatNumber(x1, 4)} | x2 = ${formatNumber(x2, 4)}`;
  renderRichOutput("saidaEq2", `<p class="result-main">${resumo}</p>`, criarGraficoParabola(a, b, c));

  addHistoryEntry(
    "Equação 2º",
    `a=${formatNumber(a)}, b=${formatNumber(b)}, c=${formatNumber(c)} -> x1=${formatNumber(x1, 4)}, x2=${formatNumber(x2, 4)}`
  );
}

function calcularFuncaoPrimeiro() {
  const a = toNumber("func1a");
  const b = toNumber("func1b");
  const x = toNumber("func1x");

  if ([a, b, x].some(isInvalidNumber)) {
    print("saidaFunc1", "Informe a, b e x válidos para calcular f(x).");
    return;
  }

  const fx = a * x + b;
  print("saidaFunc1", `f(${formatNumber(x, 4)}) = ${formatNumber(fx, 4)} | Função: f(x) = ${formatNumber(a, 4)}x + ${formatNumber(b, 4)}`);
  addHistoryEntry("Função 1º", `f(x) = ${formatNumber(a, 4)}x + ${formatNumber(b, 4)}, x=${formatNumber(x, 4)} -> f(x)=${formatNumber(fx, 4)}`);
}

function calcularFuncaoSegundo() {
  const a = toNumber("func2a");
  const b = toNumber("func2b");
  const c = toNumber("func2c");
  const x = toNumber("func2x");

  if ([a, b, c, x].some(isInvalidNumber)) {
    print("saidaFunc2", "Informe a, b, c e x válidos para calcular f(x).");
    return;
  }

  const fx = a * x * x + b * x + c;
  const resumo = `f(${formatNumber(x, 4)}) = ${formatNumber(fx, 4)} | Função: f(x) = ${formatNumber(a, 4)}x² + ${formatNumber(b, 4)}x + ${formatNumber(c, 4)}`;
  renderRichOutput("saidaFunc2", `<p class="result-main">${resumo}</p>`, criarGraficoParabola(a, b, c, { highlightX: x }));
  addHistoryEntry("Função 2º", `f(x) = ${formatNumber(a, 4)}x² + ${formatNumber(b, 4)}x + ${formatNumber(c, 4)}, x=${formatNumber(x, 4)} -> f(x)=${formatNumber(fx, 4)}`);
}

function resolverInequacaoPrimeiro() {
  const a = toNumber("ineq1a");
  const b = toNumber("ineq1b");
  const epsilon = 1e-10;

  if (isInvalidNumber(a) || isInvalidNumber(b) || Math.abs(a) < epsilon) {
    print("saidaIneq1", "Informe a e b válidos, com a diferente de zero.");
    return;
  }

  const limite = -b / a;
  const sinal = a > 0 ? ">" : "<";

  print("saidaIneq1", `Solução: x ${sinal} ${formatNumber(limite, 4)}`);
  addHistoryEntry("Inequação 1º", `a=${formatNumber(a)}, b=${formatNumber(b)} -> x ${sinal} ${formatNumber(limite, 4)}`);
}

function resolverInequacaoSegundo() {
  const a = toNumber("ineq2a");
  const b = toNumber("ineq2b");
  const c = toNumber("ineq2c");
  const epsilon = 1e-10;

  if ([a, b, c].some(isInvalidNumber) || Math.abs(a) < epsilon) {
    print("saidaIneq2", "Informe a, b e c válidos, com a diferente de zero.");
    return;
  }

  const delta = b * b - 4 * a * c;
  const deltaCorrigido = Math.abs(delta) < epsilon ? 0 : delta;

  if (deltaCorrigido < 0) {
    const mensagem =
      a > 0 ? "Solução: todos os valores reais." : "Solução: conjunto vazio.";

    renderRichOutput("saidaIneq2", `<p class="result-main">${mensagem}</p>`, criarGraficoParabola(a, b, c, { fillPositive: true }));

    addHistoryEntry("Inequação 2º", `a=${formatNumber(a)}, b=${formatNumber(b)}, c=${formatNumber(c)} -> ${mensagem}`);
    return;
  }

  const raiz1 = (-b - Math.sqrt(deltaCorrigido)) / (2 * a);
  const raiz2 = (-b + Math.sqrt(deltaCorrigido)) / (2 * a);

  if (deltaCorrigido === 0) {
    if (a > 0) {
      const mensagem = `Solução: x ≠ ${formatNumber(raiz1, 4)}.`;
      renderRichOutput("saidaIneq2", `<p class="result-main">${mensagem}</p>`, criarGraficoParabola(a, b, c, { fillPositive: true }));
      addHistoryEntry("Inequação 2º", `a=${formatNumber(a)}, b=${formatNumber(b)}, c=${formatNumber(c)} -> ${mensagem}`);
    } else {
      const mensagem = "Solução: conjunto vazio.";
      renderRichOutput("saidaIneq2", `<p class="result-main">${mensagem}</p>`, criarGraficoParabola(a, b, c, { fillPositive: true }));
      addHistoryEntry("Inequação 2º", `a=${formatNumber(a)}, b=${formatNumber(b)}, c=${formatNumber(c)} -> ${mensagem}`);
    }
    return;
  }

  if (a > 0) {
    const mensagem =
      `Solução: x < ${formatNumber(raiz1, 4)} ou x > ${formatNumber(raiz2, 4)}.`;

    renderRichOutput("saidaIneq2", `<p class="result-main">${mensagem}</p>`, criarGraficoParabola(a, b, c, { fillPositive: true }));

    addHistoryEntry("Inequação 2º", `a=${formatNumber(a)}, b=${formatNumber(b)}, c=${formatNumber(c)} -> ${mensagem}`);
  } else {
    const mensagem =
      `Solução: ${formatNumber(raiz1, 4)} < x < ${formatNumber(raiz2, 4)}.`;

    renderRichOutput("saidaIneq2", `<p class="result-main">${mensagem}</p>`, criarGraficoParabola(a, b, c, { fillPositive: true }));

    addHistoryEntry("Inequação 2º", `a=${formatNumber(a)}, b=${formatNumber(b)}, c=${formatNumber(c)} -> ${mensagem}`);
  }
}

function parseSetMembers(raw) {
  const parts = raw
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter((item) => item !== "");

  return [...new Set(parts)];
}

function formatSet(values) {
  return `{${values.join(", ")}}`;
}

function calcularConjuntos() {
  const a = parseSetMembers(toText("setA"));
  const b = parseSetMembers(toText("setB"));
  const operacao = toText("setOperacao");

  if (a.length === 0 || b.length === 0) {
    print("saidaConjuntos", "Informe elementos válidos para A e B.");
    return;
  }

  const setB = new Set(b);
  const setA = new Set(a);
  let resultado = [];
  let nomeOperacao = "";

  if (operacao === "uniao") {
    resultado = [...new Set([...a, ...b])];
    nomeOperacao = "A ∪ B";
  }

  if (operacao === "intersecao") {
    resultado = a.filter((item) => setB.has(item));
    nomeOperacao = "A ∩ B";
  }

  if (operacao === "diferencaAB") {
    resultado = a.filter((item) => !setB.has(item));
    nomeOperacao = "A - B";
  }

  if (operacao === "diferencaBA") {
    resultado = b.filter((item) => !setA.has(item));
    nomeOperacao = "B - A";
  }

  if (operacao === "simetrica") {
    resultado = [...a.filter((item) => !setB.has(item)), ...b.filter((item) => !setA.has(item))];
    nomeOperacao = "A △ B";
  }

  const saida = `${nomeOperacao} = ${formatSet(resultado)}`;
  renderRichOutput("saidaConjuntos", `<p class="result-main">${saida}</p>`, criarDiagramaVenn(a, b, operacao));
  addHistoryEntry("Conjuntos", `A=${formatSet(a)}, B=${formatSet(b)} -> ${saida}`);
}

function formatIntervalCondition(symbol, min, max, leftOp, rightOp) {
  const minFmt = formatNumber(min, 4);
  const maxFmt = formatNumber(max, 4);

  if (Math.abs(min - max) < 1e-10) {
    if (leftOp === "<=" && rightOp === "<=") {
      return `${symbol} = ${minFmt}`;
    }

    return "vazio";
  }

  return `${minFmt} ${leftOp} ${symbol} ${rightOp} ${maxFmt}`;
}

function criarGraficoCartesiano(xMin, xMax, yMin, yMax) {
  const palette = getChartPalette();
  const padding = 48;
  const svgWidth = 760;
  const svgHeight = 360;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const xStep = (xMax - xMin) / 6;
  const yStep = (yMax - yMin) / 6;

  const toSvgX = (x) => padding + ((x - xMin) / xRange) * graphWidth;
  const toSvgY = (y) => padding + graphHeight - ((y - yMin) / yRange) * graphHeight;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="display:block; max-width:100%; margin:10px 0;">`;

  for (let x = xMin; x <= xMax; x += xStep) {
    const sx = toSvgX(x);
    svgContent += `<line x1="${sx}" y1="${padding}" x2="${sx}" y2="${svgHeight - padding}" stroke="${palette.grid}" stroke-width="1" />`;
  }

  for (let y = yMin; y <= yMax; y += yStep) {
    const sy = toSvgY(y);
    svgContent += `<line x1="${padding}" y1="${sy}" x2="${svgWidth - padding}" y2="${sy}" stroke="${palette.grid}" stroke-width="1" />`;
  }

  const originX = toSvgX(0);
  const originY = toSvgY(0);

  if (originX >= padding && originX <= svgWidth - padding) {
    svgContent += `<line x1="${originX}" y1="${padding}" x2="${originX}" y2="${svgHeight - padding}" stroke="${palette.axis}" stroke-width="2" />`;
  }

  if (originY >= padding && originY <= svgHeight - padding) {
    svgContent += `<line x1="${padding}" y1="${originY}" x2="${svgWidth - padding}" y2="${originY}" stroke="${palette.axis}" stroke-width="2" />`;
  }

  svgContent += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${svgHeight - padding}" stroke="${palette.axis}" stroke-width="2" />`;
  svgContent += `<line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="${palette.axis}" stroke-width="2" />`;

  for (let x = xMin; x <= xMax; x += xStep) {
    const sx = toSvgX(x);
    svgContent += `<line x1="${sx}" y1="${svgHeight - padding - 3}" x2="${sx}" y2="${svgHeight - padding + 3}" stroke="${palette.axis}" stroke-width="1" />`;
    svgContent += `<text x="${sx}" y="${svgHeight - padding + 15}" text-anchor="middle" font-size="12" fill="${palette.label}">${formatNumber(x, 2)}</text>`;
  }

  for (let y = yMin; y <= yMax; y += yStep) {
    const sy = toSvgY(y);
    svgContent += `<line x1="${padding - 3}" y1="${sy}" x2="${padding + 3}" y2="${sy}" stroke="${palette.axis}" stroke-width="1" />`;
    svgContent += `<text x="${padding - 10}" y="${sy + 4}" text-anchor="end" font-size="12" fill="${palette.label}">${formatNumber(y, 2)}</text>`;
  }

  const points = [];
  let current = xMin;
  while (current <= xMax + 1e-10) {
    const x = current;
    const yVal = Math.sin(x * Math.PI / (xMax - xMin)) * (yMax - yMin) / 2 + (yMin + yMax) / 2;
    const y = Math.max(yMin, Math.min(yMax, yVal));
    points.push({ x, y });
    current += xStep / 3;
  }

  points.forEach((point) => {
    const sx = toSvgX(point.x);
    const sy = toSvgY(point.y);
    svgContent += `<circle cx="${sx}" cy="${sy}" r="4" fill="#ff7a30" stroke="#fff" stroke-width="2" data-x="${formatNumber(point.x, 2)}" data-y="${formatNumber(point.y, 2)}" title="x: ${formatNumber(point.x, 2)}, y: ${formatNumber(point.y, 2)}" />`;
  });

  svgContent += `<text x="${svgWidth / 2}" y="${svgHeight - 5}" text-anchor="middle" font-size="14" fill="${palette.label}">x</text>`;
  svgContent += `<text x="15" y="${svgHeight / 2}" text-anchor="middle" font-size="14" fill="${palette.label}" transform="rotate(-90 15 ${svgHeight / 2})">y</text>`;

  svgContent += `</svg>`;

  let tableContent = `<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
    <thead style="background: #f0f0f0;">
      <tr style="border-bottom: 2px solid #ddd;">
        <th style="padding: 8px; text-align: left;">x</th>
        <th style="padding: 8px; text-align: left;">y</th>
      </tr>
    </thead>
    <tbody>`;

  points.slice(0, 8).forEach((point) => {
    tableContent += `<tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 6px;">${formatNumber(point.x, 3)}</td>
      <td style="padding: 6px;">${formatNumber(point.y, 3)}</td>
    </tr>`;
  });

  tableContent += `</tbody></table>`;

  return `<div style="margin-top: 15px;">${svgContent}${tableContent}</div>`;
}

function gerarDominioImagem() {
  const xMin = toNumber("domXMin");
  const xMax = toNumber("domXMax");
  const yMin = toNumber("domYMin");
  const yMax = toNumber("domYMax");

  if ([xMin, xMax, yMin, yMax].some(isInvalidNumber)) {
    print("saidaDominioImagem", "Informe valores válidos para x e y.");
    return;
  }

  if (xMin > xMax || yMin > yMax) {
    print("saidaDominioImagem", "O valor mínimo não pode ser maior que o máximo.");
    return;
  }

  const xLeft = toText("domXCompEsq");
  const xRight = toText("domXCompDir");
  const yLeft = toText("domYCompEsq");
  const yRight = toText("domYCompDir");

  const xCond = formatIntervalCondition("x", xMin, xMax, xLeft, xRight);
  const yCond = formatIntervalCondition("y", yMin, yMax, yLeft, yRight);

  const dominio = xCond === "vazio" ? "D = conjunto vazio" : `D = {x ∈ R | ${xCond}}`;
  const imagem = yCond === "vazio" ? "Im = conjunto vazio" : `Im = {y ∈ R | ${yCond}}`;
  const saida = `${dominio} | ${imagem}`;

  const grafico = criarGraficoCartesiano(xMin, xMax, yMin, yMax);
  const saidaCompleta = `<div>${saida}${grafico}</div>`;

  byId("saidaDominioImagem").innerHTML = saidaCompleta;
  addHistoryEntry("Domínio e Imagem", saida);
}

function bindClick(id, handler) {
  const element = byId(id);
  if (element) {
    element.addEventListener("click", handler);
  }
}

bindClick("btnComposto", calcularJurosCompostos);
bindClick("btnSimples", calcularJurosSimples);
bindClick("btnEq1", resolverEquacaoPrimeiro);
bindClick("btnEq2", resolverEquacaoSegundo);
bindClick("btnFunc1", calcularFuncaoPrimeiro);
bindClick("btnFunc2", calcularFuncaoSegundo);
bindClick("btnIneq1", resolverInequacaoPrimeiro);
bindClick("btnIneq2", resolverInequacaoSegundo);
bindClick("btnConjuntos", calcularConjuntos);
bindClick("btnDominioImagem", gerarDominioImagem);
bindClick("btnLimparHistorico", limparHistorico);

document.querySelectorAll(".clear-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = byId(button.dataset.panel);
    const output = byId(button.dataset.output);

    panel.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });

    panel.querySelectorAll("select").forEach((select) => {
      select.selectedIndex = 0;
    });

    output.textContent = "";
    output.classList.remove("error");

    if (button.dataset.panel === "juros-compostos") {
      atualizarExplicacaoJuros("composto");
    }

    if (button.dataset.panel === "juros-simples") {
      atualizarExplicacaoJuros("simples");
    }

    if (button.dataset.panel === "funcao-primeiro" && byId("explicaFunc1")) {
      byId("explicaFunc1").textContent = "Preencha os campos para visualizar o valor da função antes de calcular.";
    }

    if (button.dataset.panel === "funcao-segundo" && byId("explicaFunc2")) {
      byId("explicaFunc2").textContent = "Preencha os campos para visualizar o valor da função antes de calcular.";
    }

    const explicacoesPadrao = {
      "equacao-primeiro": "explicaEq1",
      "equacao-segundo": "explicaEq2",
      "funcao-primeiro": "explicaFunc1",
      "funcao-segundo": "explicaFunc2",
      "inequacao-primeiro": "explicaIneq1",
      "inequacao-segundo": "explicaIneq2",
      conjuntos: "explicaConjuntos",
      "dominio-imagem": "explicaDominio"
    };

    const explicacaoId = explicacoesPadrao[button.dataset.panel];

    if (explicacaoId && byId(explicacaoId)) {
      byId(explicacaoId).textContent = "Preencha os campos para visualizar o cenário antes de calcular.";
    }
  });
});

document.querySelectorAll(".example-btn").forEach((button) => {
  button.addEventListener("click", () => {
    aplicarExemplo(button.dataset.kind, button.dataset.example);
  });
});



["capitalComposto", "taxaComposta", "tempoComposto", "taxaCompostaUnidade", "tempoCompostoUnidade"].forEach((id) => {
  const field = byId(id);
  if (!field) {
    return;
  }

  field.addEventListener("input", () => {
    atualizarExplicacaoJuros("composto");
  });

  field.addEventListener("change", () => {
    atualizarExplicacaoJuros("composto");
  });
});

["capitalSimples", "taxaSimples", "tempoSimples", "taxaSimplesUnidade", "tempoSimplesUnidade"].forEach((id) => {
  const field = byId(id);
  if (!field) {
    return;
  }

  field.addEventListener("input", () => {
    atualizarExplicacaoJuros("simples");
  });

  field.addEventListener("change", () => {
    atualizarExplicacaoJuros("simples");
  });
});

["func1a", "func1b", "func1x"].forEach((id) => {
  const field = byId(id);
  if (!field) {
    return;
  }

  field.addEventListener("input", () => {
    if (byId("explicaFunc1")) {
      byId("explicaFunc1").textContent = "Preencha os campos para visualizar o valor da função antes de calcular.";
    }
  });
});

["func2a", "func2b", "func2c", "func2x"].forEach((id) => {
  const field = byId(id);
  if (!field) {
    return;
  }

  field.addEventListener("input", () => {
    if (byId("explicaFunc2")) {
      byId("explicaFunc2").textContent = "Preencha os campos para visualizar o valor da função antes de calcular.";
    }
  });
});

document.querySelectorAll(".panel input, .panel select").forEach((field) => {
  field.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const panel = event.target.closest(".panel");
    const calculator = calculatorsByPanel[panel.id];

    if (calculator) {
      calculator();
    }
  });
});

showPanel("juros-compostos");
if (byId("capitalComposto") && byId("taxaComposta") && byId("tempoComposto") && byId("taxaCompostaUnidade") && byId("tempoCompostoUnidade")) {
  atualizarExplicacaoJuros("composto");
}
if (byId("capitalSimples") && byId("taxaSimples") && byId("tempoSimples") && byId("taxaSimplesUnidade") && byId("tempoSimplesUnidade")) {
  atualizarExplicacaoJuros("simples");
}
loadHistorico();
