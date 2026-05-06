const HISTORY_KEY = "quadratic_cases_history";
const THEME_KEY = "quadratic_theme";
const UI_STATE_KEY = "quadratic_ui_state";

const CASES = [
  { panelId: "caso-1", outputId: "output-caso-1", buttonId: "btn-caso-1", clearButtonId: "btn-clear-caso-1", explainId: "explain-caso-1", aId: "caso-1-a", bId: "caso-1-b", cId: "caso-1-c", id: "CASO 1", name: "R(q)", kind: "receita" },
  { panelId: "caso-2", outputId: "output-caso-2", buttonId: "btn-caso-2", clearButtonId: "btn-clear-caso-2", explainId: "explain-caso-2", aId: "caso-2-a", bId: "caso-2-b", cId: "caso-2-c", id: "CASO 2", name: "L(q)", kind: "lucro" },
  { panelId: "caso-3", outputId: "output-caso-3", buttonId: "btn-caso-3", clearButtonId: "btn-clear-caso-3", explainId: "explain-caso-3", aId: "caso-3-a", bId: "caso-3-b", cId: "caso-3-c", id: "CASO 3", name: "R(q)", kind: "receita" },
  { panelId: "caso-4", outputId: "output-caso-4", buttonId: "btn-caso-4", clearButtonId: "btn-clear-caso-4", explainId: "explain-caso-4", aId: "caso-4-a", bId: "caso-4-b", cId: "caso-4-c", id: "CASO 4", name: "L(q)", kind: "lucro" }
];

const CASE_EXAMPLES = {
  "caso-1": {
    exemplo: {
      values: { a: -2, b: 200, c: 0 },
      explanation: "Caso 1: receita com sapatos. Função R(q) = -2q² + 200q, vértice em (50, 5.000) e raízes em 0 e 100."
    }
  },
  "caso-2": {
    exemplo: {
      values: { a: -2, b: 160, c: -1400 },
      explanation: "Caso 2: lucro com sapatos. Função L(q) = -2q² + 160q - 1.400, com lucro máximo em 40 e equilíbrio em 10 e 70."
    }
  },
  "caso-3": {
    exemplo: {
      values: { a: -2, b: 1000, c: 0 },
      explanation: "Caso 3: receita do exercício 11. Função R(q) = -2q² + 1.000q, com máximo em 250 e receita máxima de 125.000."
    }
  },
  "caso-4": {
    exemplo: {
      values: { a: -2, b: 800, c: -35000 },
      explanation: "Caso 4: lucro do exercício 11. Função L(q) = -2q² + 800q - 35.000, com lucro máximo em 200 e valor máximo de 45.000."
    }
  }
};

let historyEntries = [];
let suppressHistory = false;
let lastCalculatedPanelId = null;

function byId(id) {
  return document.getElementById(id);
}

function formatNumber(value, maxDecimals = 4) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals
  });
}

function formatFunction(name, a, b, c) {
  const partA = `${formatNumber(a)}q²`;
  const partB = `${b >= 0 ? "+" : "-"} ${formatNumber(Math.abs(b))}q`;
  const partC = `${c >= 0 ? "+" : "-"} ${formatNumber(Math.abs(c))}`;
  return `${name} = ${partA} ${partB} ${partC}`;
}

function analyzeQuadratic(a, b, c, kind) {
  const epsilon = 1e-10;

  if (![a, b, c].every(Number.isFinite)) {
    return { valid: false, error: "Informe coeficientes numéricos válidos." };
  }

  if (Math.abs(a) < epsilon) {
    return { valid: false, error: "O coeficiente a deve ser diferente de zero." };
  }

  const qv = -b / (2 * a);
  const fv = a * qv * qv + b * qv + c;
  const delta = b * b - 4 * a * c;
  const fixedDelta = Math.abs(delta) < epsilon ? 0 : delta;
  const isMax = a < 0;
  const parabolaType = isMax ? "côncava para baixo" : "côncava para cima";

  let roots = [];
  if (fixedDelta > 0) {
    const r1 = (-b - Math.sqrt(fixedDelta)) / (2 * a);
    const r2 = (-b + Math.sqrt(fixedDelta)) / (2 * a);
    roots = [Math.min(r1, r2), Math.max(r1, r2)];
  } else if (fixedDelta === 0) {
    roots = [(-b) / (2 * a)];
  }

  let profitInterval = "";
  if (kind === "lucro") {
    if (roots.length === 2) {
      profitInterval = a < 0
        ? `${formatNumber(roots[0], 4)} < q < ${formatNumber(roots[1], 4)}`
        : `q < ${formatNumber(roots[0], 4)} ou q > ${formatNumber(roots[1], 4)}`;
    } else if (roots.length === 1) {
      profitInterval = a < 0
        ? "Não há intervalo de lucro positivo; apenas ponto de equilíbrio."
        : `Lucro positivo para todo q, exceto q = ${formatNumber(roots[0], 4)}.`;
    } else {
      profitInterval = a < 0
        ? "Não há lucro positivo para nenhum valor real de q."
        : "Lucro positivo para todos os valores reais de q.";
    }
  }

  return {
    valid: true,
    a,
    b,
    c,
    qv,
    fv,
    yIntercept: c,
    roots,
    isMax,
    parabolaType,
    extremumLabel: isMax ? "Valor máximo" : "Valor mínimo",
    profitInterval
  };
}

function buildGraphSvg(analysis) {
  const { a, b, c, qv, roots } = analysis;
  const width = 760;
  const height = 270;
  const padX = 54;
  const padY = 34;
  const graphW = width - padX * 2;
  const graphH = height - padY * 2;
  const span = Math.max(10, Math.abs(qv) + 8, roots.length === 2 ? Math.abs(roots[1] - roots[0]) + 6 : 10);
  const minX = qv - span;
  const maxX = qv + span;

  const points = [];
  for (let i = 0; i <= 180; i += 1) {
    const q = minX + ((maxX - minX) * i) / 180;
    const val = a * q * q + b * q + c;
    points.push({ q, val });
  }

  const minYRaw = Math.min(0, ...points.map((point) => point.val));
  const maxYRaw = Math.max(0, ...points.map((point) => point.val));
  const marginY = Math.max(1, (maxYRaw - minYRaw) * 0.16);
  const minY = minYRaw - marginY;
  const maxY = maxYRaw + marginY;

  const toX = (q) => padX + ((q - minX) / (maxX - minX)) * graphW;
  const toY = (val) => padY + graphH - ((val - minY) / (maxY - minY)) * graphH;

  const axisY = toY(0);
  const axisX = toX(0);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${toX(point.q)} ${toY(point.val)}`).join(" ");
  const isDarkMode = document.body.classList.contains("dark-mode");
  const tickColor = isDarkMode ? "#f4f8ff" : "#4e5f77";
  const gridColor = isDarkMode ? "rgba(244,248,255,0.18)" : "rgba(23,36,53,0.16)";
  const axisColor = isDarkMode ? "rgba(244,248,255,0.7)" : "rgba(23,36,53,0.65)";
  const curveColor = isDarkMode ? "#ff8d5e" : "#b4472d";
  const vertexColor = isDarkMode ? "#5ac98f" : "#1e7d4c";
  const rootColor = isDarkMode ? "#ffb08d" : "#9f2b1f";
  const backgroundColor = isDarkMode ? "#000000" : "#ffffff";

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico da função quadrática">`;
  svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}"/>`;

  for (let i = 0; i <= 6; i += 1) {
    const x = padX + (graphW * i) / 6;
    const q = minX + ((maxX - minX) * i) / 6;
    svg += `<line x1="${x}" y1="${padY}" x2="${x}" y2="${height - padY}" stroke="${gridColor}" stroke-width="1"/>`;
    svg += `<text x="${x}" y="${height - 10}" fill="${tickColor}" text-anchor="middle" font-size="11">${formatNumber(q, 1)}</text>`;
  }

  for (let i = 0; i <= 4; i += 1) {
    const y = padY + (graphH * i) / 4;
    const val = maxY - ((maxY - minY) * i) / 4;
    svg += `<line x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}" stroke="${gridColor}" stroke-width="1"/>`;
    svg += `<text x="${padX - 8}" y="${y + 4}" fill="${tickColor}" text-anchor="end" font-size="11">${formatNumber(val, 0)}</text>`;
  }

  if (axisY >= padY && axisY <= height - padY) {
    svg += `<line x1="${padX}" y1="${axisY}" x2="${width - padX}" y2="${axisY}" stroke="${axisColor}" stroke-width="2"/>`;
  }

  if (axisX >= padX && axisX <= width - padX) {
    svg += `<line x1="${axisX}" y1="${padY}" x2="${axisX}" y2="${height - padY}" stroke="${axisColor}" stroke-width="2"/>`;
  }

  svg += `<path d="${path}" fill="none" stroke="${curveColor}" stroke-width="3.5"/>`;
  svg += `<circle cx="${toX(qv)}" cy="${toY(analysis.fv)}" r="4.8" fill="${vertexColor}"/>`;
  svg += `<text x="${toX(qv)}" y="${toY(analysis.fv) - 9}" fill="${vertexColor}" text-anchor="middle" font-size="11">V(${formatNumber(qv, 2)}, ${formatNumber(analysis.fv, 2)})</text>`;

  if (roots.length > 0 && axisY >= padY && axisY <= height - padY) {
    roots.forEach((root) => {
      svg += `<circle cx="${toX(root)}" cy="${axisY}" r="4.2" fill="${rootColor}"/>`;
      svg += `<text x="${toX(root)}" y="${axisY - 8}" fill="${rootColor}" text-anchor="middle" font-size="10">${formatNumber(root, 2)}</text>`;
    });
  }

  svg += "</svg>";
  return svg;
}

function rootsText(roots) {
  if (roots.length === 0) {
    return "Não possui raízes reais.";
  }

  if (roots.length === 1) {
    return `Raiz dupla: q = ${formatNumber(roots[0], 4)}.`;
  }

  return `q1 = ${formatNumber(roots[0], 4)} e q2 = ${formatNumber(roots[1], 4)}.`;
}

function renderAnalysisCard(caseData, analysis) {
  if (!analysis.valid) {
    return `<article class="result-card"><p class="warning">${analysis.error}</p></article>`;
  }

  const intervalLine = caseData.kind === "lucro"
    ? `<li><strong>Intervalo de lucro (L(q) > 0):</strong> <span class="highlight">${analysis.profitInterval}</span></li>`
    : "";

  const typeLabel = caseData.kind === "lucro" ? "Tipo da parábola" : "Concavidade";

  return `
    <article class="result-card">
      <p class="formula">${formatFunction(caseData.name, analysis.a, analysis.b, analysis.c)}</p>
      <ul class="result-list">
        <li><strong>${typeLabel}:</strong> ${analysis.parabolaType} (${analysis.isMax ? "há máximo" : "há mínimo"})</li>
        <li><strong>Interseção com o eixo y:</strong> ${caseData.name}(${0}) = ${formatNumber(analysis.yIntercept, 4)}</li>
        <li><strong>Vértice:</strong> qv = ${formatNumber(analysis.qv, 4)}, f(qv) = ${formatNumber(analysis.fv, 4)}</li>
        <li><strong>${analysis.extremumLabel}:</strong> ${formatNumber(analysis.fv, 4)} (em q = ${formatNumber(analysis.qv, 4)})</li>
        <li><strong>Raízes:</strong> ${rootsText(analysis.roots)}</li>
        ${intervalLine}
      </ul>
      <div class="graph-wrap">${buildGraphSvg(analysis)}</div>
    </article>
  `;
}

function showPanel(panelId) {
  document.querySelectorAll(".case-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === panelId);
  });

  document.querySelectorAll(".tab-btn").forEach((button) => {
    const active = button.dataset.target === panelId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function getActivePanelId() {
  const activeButton = document.querySelector(".tab-btn.active");
  return activeButton ? activeButton.dataset.target : "caso-1";
}

function saveUiState() {
  const coefficients = {};

  CASES.forEach((caseData) => {
    coefficients[caseData.panelId] = {
      a: byId(caseData.aId).value,
      b: byId(caseData.bId).value,
      c: byId(caseData.cId).value
    };
  });

  const uiState = {
    activePanelId: getActivePanelId(),
    lastCalculatedPanelId,
    coefficients
  };

  localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
}

function restoreUiState() {
  const raw = localStorage.getItem(UI_STATE_KEY);
  if (!raw) {
    return false;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    localStorage.removeItem(UI_STATE_KEY);
    return false;
  }

  if (parsed && parsed.coefficients) {
    CASES.forEach((caseData) => {
      const values = parsed.coefficients[caseData.panelId];
      if (!values) {
        return;
      }

      byId(caseData.aId).value = values.a ?? "";
      byId(caseData.bId).value = values.b ?? "";
      byId(caseData.cId).value = values.c ?? "";
    });
  }

  const panelToShow = parsed && parsed.activePanelId ? parsed.activePanelId : "caso-1";
  showPanel(panelToShow);

  if (parsed && parsed.lastCalculatedPanelId) {
    const caseData = CASES.find((item) => item.panelId === parsed.lastCalculatedPanelId);
    if (caseData) {
      suppressHistory = true;
      calculateCase(caseData);
      suppressHistory = false;
      lastCalculatedPanelId = caseData.panelId;
    }
  }

  localStorage.removeItem(UI_STATE_KEY);
  return true;
}

function readCaseCoefficients(caseData) {
  return {
    a: Number.parseFloat(byId(caseData.aId).value),
    b: Number.parseFloat(byId(caseData.bId).value),
    c: Number.parseFloat(byId(caseData.cId).value)
  };
}

function clearInputValidation(caseData) {
  [caseData.aId, caseData.bId, caseData.cId].forEach((inputId) => {
    const input = byId(inputId);
    input.classList.remove("input-error");
    input.removeAttribute("aria-invalid");
  });
}

function markInvalidNumericInputs(caseData, values) {
  const fieldMap = [
    { id: caseData.aId, value: values.a },
    { id: caseData.bId, value: values.b },
    { id: caseData.cId, value: values.c }
  ];

  let focused = false;

  fieldMap.forEach((field) => {
    if (Number.isFinite(field.value)) {
      return;
    }

    const input = byId(field.id);
    input.classList.add("input-error");
    input.setAttribute("aria-invalid", "true");

    if (!focused) {
      input.focus();
      focused = true;
    }
  });
}

function saveHistoryEntry(caseData, analysis) {
  if (suppressHistory || !analysis.valid) {
    return;
  }

  const entry = {
    when: new Date().toLocaleString("pt-BR"),
    panelId: caseData.panelId,
    caseId: caseData.id,
    name: caseData.name,
    kind: caseData.kind,
    a: analysis.a,
    b: analysis.b,
    c: analysis.c,
    summary: `${analysis.extremumLabel}: ${formatNumber(analysis.fv, 4)} em q=${formatNumber(analysis.qv, 4)}`
  };

  historyEntries.unshift(entry);
  historyEntries = historyEntries.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyEntries));
  renderHistory();
}

function calculateCase(caseData) {
  clearInputValidation(caseData);
  const values = readCaseCoefficients(caseData);
  const analysis = analyzeQuadratic(values.a, values.b, values.c, caseData.kind);

  if (!analysis.valid && analysis.error.includes("numéricos")) {
    markInvalidNumericInputs(caseData, values);
  }

  byId(caseData.outputId).innerHTML = renderAnalysisCard(caseData, analysis);

  if (analysis.valid) {
    lastCalculatedPanelId = caseData.panelId;
  }

  saveHistoryEntry(caseData, analysis);
}

function clearCase(caseData) {
  byId(caseData.aId).value = "";
  byId(caseData.bId).value = "";
  byId(caseData.cId).value = "";
  byId(caseData.outputId).textContent = "Campos limpos. Informe os coeficientes e clique em calcular para gerar o resultado e o gráfico.";

  if (byId(caseData.explainId)) {
    byId(caseData.explainId).textContent = "Selecione um exemplo para preencher automaticamente e calcular.";
  }

  if (lastCalculatedPanelId === caseData.panelId) {
    lastCalculatedPanelId = null;
  }
}

function applyExample(panelId, exampleId) {
  const caseData = CASES.find((item) => item.panelId === panelId);
  const example = CASE_EXAMPLES[panelId] ? CASE_EXAMPLES[panelId][exampleId] : null;

  if (!caseData || !example) {
    return;
  }

  byId(caseData.aId).value = example.values.a;
  byId(caseData.bId).value = example.values.b;
  byId(caseData.cId).value = example.values.c;

  if (byId(caseData.explainId)) {
    byId(caseData.explainId).textContent = example.explanation;
  }

  calculateCase(caseData);
}

function renderHistory() {
  const list = byId("historyList");
  list.innerHTML = "";

  if (historyEntries.length === 0) {
    list.innerHTML = '<li class="empty-note">Nenhum cálculo registrado ainda.</li>';
    return;
  }

  historyEntries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "history-item";

    const text = document.createElement("span");
    text.className = "history-text";
    text.textContent = `[${entry.when}] ${entry.caseId} | ${formatFunction(entry.name, entry.a, entry.b, entry.c)} | ${entry.summary}`;

    const recreate = document.createElement("button");
    recreate.className = "history-recreate";
    recreate.type = "button";
    recreate.textContent = "Recriar";

    recreate.addEventListener("click", () => {
      const caseData = CASES.find((itemData) => itemData.panelId === entry.panelId);
      if (!caseData) {
        return;
      }

      byId(caseData.aId).value = entry.a;
      byId(caseData.bId).value = entry.b;
      byId(caseData.cId).value = entry.c;
      showPanel(caseData.panelId);

      suppressHistory = true;
      calculateCase(caseData);
      suppressHistory = false;
    });

    item.appendChild(text);
    item.appendChild(recreate);
    list.appendChild(item);
  });
}

function loadHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) {
    historyEntries = [];
    renderHistory();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    historyEntries = Array.isArray(parsed) ? parsed : [];
  } catch {
    historyEntries = [];
  }

  renderHistory();
}

function clearHistory() {
  historyEntries = [];
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function setupTheme() {
  const toggle = byId("themeToggle");
  const savedTheme = localStorage.getItem(THEME_KEY);
  const shouldUseDark = savedTheme === "dark";

  if (shouldUseDark) {
    document.body.classList.add("dark-mode");
    toggle.textContent = "Modo claro";
  }

  toggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    saveUiState();
    window.location.reload();
  });
}

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      showPanel(button.dataset.target);
    });
  });
}

function initCaseButtons() {
  CASES.forEach((caseData) => {
    byId(caseData.buttonId).addEventListener("click", () => {
      calculateCase(caseData);
    });

    byId(caseData.clearButtonId).addEventListener("click", () => {
      clearCase(caseData);
    });
  });
}

function initExampleButtons() {
  document.querySelectorAll(".example-btn").forEach((button) => {
    button.addEventListener("click", () => {
      applyExample(button.dataset.case, button.dataset.example);
    });
  });
}

setupTheme();
initTabs();
initCaseButtons();
initExampleButtons();
loadHistory();
byId("btnClearHistory").addEventListener("click", clearHistory);

if (!restoreUiState()) {
  showPanel("caso-1");
}
