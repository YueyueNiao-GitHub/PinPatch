const STORAGE_KEY = "agentation-mock-annotations-v3";
const DELIVERY_STORAGE_KEY = "agentation-mock-delivery-v1";

const STYLE_SNAPSHOT_FIELDS = [
  { property: "color", label: "color" },
  { property: "backgroundColor", label: "background-color" },
  { property: "borderColor", label: "border-color" },
  { property: "fontSize", label: "font-size" },
  { property: "fontWeight", label: "font-weight" },
  { property: "fontFamily", label: "font-family" },
  { property: "lineHeight", label: "line-height" },
  { property: "letterSpacing", label: "letter-spacing" },
  { property: "textAlign", label: "text-align" },
  { property: "padding", label: "padding" },
  { property: "margin", label: "margin" },
  { property: "border", label: "border" },
  { property: "borderRadius", label: "border-radius" },
  { property: "display", label: "display" },
  { property: "flexDirection", label: "flex-direction" },
  { property: "opacity", label: "opacity" },
];

const state = {
  toolbarExpanded: false,
  annotationActive: false,
  annotationsVisible: true,
  pending: null,
  editingId: null,
  hoverTarget: null,
  selectedId: null,
  panelOpen: false,
  panelMode: "list",
  annotations: [],
  outputPreview: "",
  contextOpenId: null,
  connectionOpen: false,
  deliveryMode: "copy",
  servicePaired: false,
  binding: null,
  pairingError: "",
};

const AGENT_OPTIONS = [
  { value: "codeflicker", label: "CodeFlicker" },
  { value: "codex", label: "Codex" },
  { value: "claude", label: "Claude Code" },
];

const PROJECT_OPTIONS = [
  { value: "pinpatch", label: "PinPatch", path: "~/Documents/PinPatch" },
  { value: "design-system", label: "Design System", path: "~/Documents/design-system" },
  { value: "agent-workbench", label: "Agent Workbench", path: "~/Documents/agent-workbench" },
];

const animatedMarkerIds = new Set();

const QUICK_STYLE_FIELDS = [
  { property: "color", cssProperty: "color", label: "文本颜色", type: "color" },
  { property: "backgroundColor", cssProperty: "background-color", label: "背景", type: "color" },
  { property: "opacity", cssProperty: "opacity", label: "Opacity", type: "number", step: "0.05", min: "0", max: "1" },
  { property: "fontFamily", cssProperty: "font-family", label: "字体", type: "font" },
  { property: "fontSize", cssProperty: "font-size", label: "字号", type: "length" },
  { property: "fontWeight", cssProperty: "font-weight", label: "字重", type: "number", step: "10", min: "100", max: "900" },
  { property: "borderRadius", cssProperty: "border-radius", label: "圆角", type: "length" },
  { property: "borderColor", cssProperty: "border-color", label: "边框颜色", type: "color" },
  { property: "borderWidth", cssProperty: "border-width", label: "边框宽度", type: "length" },
  { property: "width", cssProperty: "width", label: "宽度", type: "length" },
  { property: "height", cssProperty: "height", label: "高度", type: "length" },
  { property: "paddingTop", cssProperty: "padding-top", label: "上内边距", type: "length" },
  { property: "paddingRight", cssProperty: "padding-right", label: "右内边距", type: "length" },
  { property: "paddingBottom", cssProperty: "padding-bottom", label: "下内边距", type: "length" },
  { property: "paddingLeft", cssProperty: "padding-left", label: "左内边距", type: "length" },
  { property: "marginTop", cssProperty: "margin-top", label: "上外边距", type: "length" },
  { property: "marginRight", cssProperty: "margin-right", label: "右外边距", type: "length" },
  { property: "marginBottom", cssProperty: "margin-bottom", label: "下外边距", type: "length" },
  { property: "marginLeft", cssProperty: "margin-left", label: "左外边距", type: "length" },
  { property: "flexDirection", cssProperty: "flex-direction", label: "布局方向", type: "choice" },
  { property: "justifyContent", cssProperty: "justify-content", label: "分布", type: "choice" },
  { property: "alignItems", cssProperty: "align-items", label: "对齐", type: "choice" },
];

const PADDING_PROPS = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"];
const MARGIN_PROPS = ["marginTop", "marginRight", "marginBottom", "marginLeft"];
const SPACING_GROUPS = {
  padding: { label: "内边距", linkedKey: "paddingLinked", props: PADDING_PROPS },
  margin: { label: "外边距", linkedKey: "marginLinked", props: MARGIN_PROPS },
};
const COMMENT_PLACEHOLDER = "这里需要怎么改？";
const QUICK_PLACEHOLDER = "描述这些更改…";
const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif" },
  { label: "System", value: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Serif", value: "Georgia, \"Times New Roman\", serif" },
  { label: "Mono", value: "\"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace" },
];
const CHOICE_OPTIONS = {
  flexDirection: [
    { label: "垂直", value: "column" },
    { label: "水平", value: "row" },
    { label: "反向垂直", value: "column-reverse" },
    { label: "反向水平", value: "row-reverse" },
  ],
  justifyContent: [
    { label: "开始", value: "flex-start" },
    { label: "居中", value: "center" },
    { label: "结束", value: "flex-end" },
    { label: "两端", value: "space-between" },
    { label: "均分", value: "space-around" },
  ],
  alignItems: [
    { label: "拉伸", value: "stretch" },
    { label: "开始", value: "flex-start" },
    { label: "居中", value: "center" },
    { label: "结束", value: "flex-end" },
    { label: "基线", value: "baseline" },
  ],
};

const els = {};
const inertScopes = new Map();
let modalReturnFocus = null;
let popupReturnFocus = null;
let hoverFrame = 0;
let hoverPoint = null;
let copyFeedbackTimer = 0;
let panelTransitionToken = 0;
let panelHideTimer = 0;

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function getFocusableElements(container) {
  return $all(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    container,
  ).filter((element) => !element.hidden && element.getClientRects().length > 0);
}

function trapFocusWithin(container, event) {
  if (event.key !== "Tab") return false;
  const focusable = getFocusableElements(container);
  if (!focusable.length) {
    event.preventDefault();
    container.focus?.();
    return true;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
    return true;
  }
  if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}

function setInertScope(name, elements, active) {
  if (active) {
    if (inertScopes.has(name)) return;
    const records = [...new Set(elements.filter(Boolean))].map((element) => ({
      element,
      inert: element.inert,
    }));
    records.forEach(({ element }) => {
      element.inert = true;
    });
    inertScopes.set(name, records);
    return;
  }
  const records = inertScopes.get(name) || [];
  records.forEach(({ element, inert }) => {
    element.inert = inert;
  });
  inertScopes.delete(name);
}

function setModalBackgroundInert(active) {
  setInertScope(
    "demo-modal",
    $all("body > *").filter((element) => ![els.modal, els.modalOverlay, els.toast].includes(element)),
    active,
  );
}

function setPopupBackgroundInert(active) {
  const bodySiblings = $all("body > *").filter((element) => ![els.popup.closest(".annotation-root"), els.toast].includes(element));
  const rootSiblings = $all(":scope > *", els.popup.closest(".annotation-root"))
    .filter((element) => ![els.popup, els.popupActionTooltip, els.toolbar].includes(element));
  setInertScope("annotation-popup", [...bodySiblings, ...rootSiblings], active);
}

function restoreFocus(target) {
  if (target?.isConnected && typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }
}

function initElements() {
  Object.assign(els, {
    toolbar: $("#agent-toolbar"),
    toolbarToggle: $("#toolbar-toggle"),
    annotateToggle: $("#annotate-toggle"),
    visibilityToggle: $("#visibility-toggle"),
    panelToggle: $("#panel-toggle"),
    connectionToggle: $("#connection-toggle"),
    copyOutput: $("#copy-output"),
    clearAnnotations: $("#clear-annotations"),
    countBadge: $("#count-badge"),
    highlight: $("#annotation-highlight"),
    tooltip: $("#annotation-tooltip"),
    markers: $("#annotation-markers"),
    popup: $("#annotation-popup"),
    popupActionTooltip: $("#popup-action-tooltip"),
    panel: $("#comment-panel"),
    panelTitle: $("#panel-title"),
    panelBody: $("#comment-panel-body"),
    closePanel: $("#close-panel"),
    connectionPanel: $("#connection-panel"),
    connectionBody: $("#connection-panel-body"),
    closeConnection: $("#close-connection"),
    toast: $("#toast"),
    modal: $("#demo-modal"),
    modalOverlay: $("#modal-overlay"),
    shadowHost: $("#shadow-modal-host"),
  });
}

function assignNodeIds() {
  let index = 1;
  $all("body *").forEach((node) => {
    if (isInternal(node)) return;
    if (node.matches("script, style, link, meta")) return;
    if (!node.dataset.nodeId) {
      node.dataset.nodeId = `node-${index++}`;
    }
  });
}

function loadAnnotations() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(saved) && saved.length) {
      state.annotations = saved.map((annotation) => repairTransientAnnotation({
        ...annotation,
        status: annotation.status === "resolved" ? "resolved" : "pending",
        thread: (annotation.thread || []).filter((item) => item.role !== "agent"),
      }));
      persist();
      return;
    }
  } catch {
    state.annotations = [];
  }

  state.annotations = createSeedAnnotations();
  persist();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.annotations));
}

function loadDeliverySettings() {
  state.deliveryMode = "copy";
  state.servicePaired = false;
  state.binding = null;
  persistDeliverySettings();
}

function persistDeliverySettings() {
  localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify({
    deliveryMode: state.deliveryMode,
    servicePaired: state.servicePaired,
    binding: state.binding,
  }));
}

function agentLabel(value = state.binding?.agent) {
  return AGENT_OPTIONS.find((option) => option.value === value)?.label || "Agent";
}

function currentPageLabel() {
  if (location.protocol === "file:") return location.pathname.split("/").pop() || "本地 HTML";
  return `${location.hostname}${location.port ? `:${location.port}` : ""}`;
}

function deliveryTargetLabel() {
  if (state.deliveryMode !== "agent" || !state.binding) return "复制模式";
  return `${state.binding.projectLabel} · ${agentLabel()}`;
}

function agentDeliveryReady() {
  return state.deliveryMode === "agent" && Boolean(state.binding);
}

function renderConnectionPanel() {
  els.connectionPanel.hidden = !state.connectionOpen;
  if (!state.connectionOpen) return;

  const modeSelector = `
    <div class="delivery-segmented" aria-label="交付方式">
      <button class="delivery-mode-button" type="button" data-delivery-mode="copy" aria-pressed="${state.deliveryMode === "copy"}">
        <i class="ri-file-copy-line" aria-hidden="true"></i>
        <span>复制留言</span>
      </button>
      <button class="delivery-mode-button" type="button" data-delivery-mode="agent" aria-pressed="${state.deliveryMode === "agent"}">
        <i class="ri-links-line" aria-hidden="true"></i>
        <span>MCP 直连</span>
      </button>
    </div>
  `;

  if (state.deliveryMode === "copy") {
    els.connectionBody.innerHTML = `${modeSelector}
      <div class="delivery-status"><strong>复制模式</strong><span class="delivery-status-value">可用</span></div>
      <div class="delivery-copy-summary">
        <div class="delivery-summary-row"><span>交付方式</span><strong>复制单条或全部</strong></div>
        <div class="delivery-summary-row"><span>留言内容</span><strong>页面与元素上下文</strong></div>
        <div class="delivery-summary-row"><span>适用 Agent</span><strong>任意编码 Agent</strong></div>
      </div>
    `;
    bindConnectionActions();
    return;
  }

  if (!state.servicePaired) {
    els.connectionBody.innerHTML = `${modeSelector}
      <div class="delivery-status"><strong>本地服务</strong><span class="delivery-status-value offline">未配对</span></div>
      <div class="connection-form">
        <div class="connection-field">
          <label for="connection-code">6 位配对码</label>
          <div class="connection-pair-row">
            <input id="connection-code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000" aria-describedby="connection-code-hint">
            <button class="panel-button primary" type="button" data-connection-action="pair">配对</button>
          </div>
          <p class="connection-hint" id="connection-code-hint">由 PinPatch MCP 本地服务生成</p>
          ${state.pairingError ? `<p class="connection-error" role="alert">${escapeHtml(state.pairingError)}</p>` : ""}
        </div>
      </div>
    `;
    bindConnectionActions();
    return;
  }

  if (!state.binding) {
    els.connectionBody.innerHTML = `${modeSelector}
      <div class="delivery-status"><strong>本地服务</strong><span class="delivery-status-value">已连接</span></div>
      <div class="connection-form">
        <div class="connection-field">
          <div class="connection-field-label" id="connection-agent-label">选择 Agent</div>
          <div class="agent-selector" role="radiogroup" aria-labelledby="connection-agent-label">
            ${AGENT_OPTIONS.map((option, index) => `
              <label class="selector-option agent-option">
                <input type="radio" name="connection-agent" value="${option.value}" ${index === 0 ? "checked" : ""}>
                <span class="selector-option-ui">
                  <i class="ri-terminal-box-line selector-leading-icon" aria-hidden="true"></i>
                  <span class="selector-option-copy"><strong>${option.label}</strong></span>
                  <i class="ri-check-line selector-check" aria-hidden="true"></i>
                </span>
              </label>
            `).join("")}
          </div>
        </div>
        <div class="connection-field">
          <div class="connection-field-label" id="connection-project-label">选择项目</div>
          <div class="project-selector" role="radiogroup" aria-labelledby="connection-project-label">
            ${PROJECT_OPTIONS.map((option, index) => `
              <label class="selector-option project-option">
                <input type="radio" name="connection-project" value="${option.value}" ${index === 0 ? "checked" : ""}>
                <span class="selector-option-ui">
                  <i class="ri-folder-3-line selector-leading-icon" aria-hidden="true"></i>
                  <span class="selector-option-copy">
                    <strong>${option.label}</strong>
                    <small>${option.path}</small>
                  </span>
                  <i class="ri-check-line selector-check" aria-hidden="true"></i>
                </span>
              </label>
            `).join("")}
          </div>
        </div>
      </div>
      <div class="connection-actions">
        <button class="panel-button primary" type="button" data-connection-action="bind">绑定当前页面</button>
      </div>
    `;
    bindConnectionActions();
    return;
  }

  els.connectionBody.innerHTML = `${modeSelector}
    <div class="delivery-status"><strong>Agent 通道</strong><span class="delivery-status-value">在线</span></div>
    <div class="connection-bound-summary">
      <div class="delivery-summary-row"><span>Agent</span><strong>${escapeHtml(agentLabel())}</strong></div>
      <div class="delivery-summary-row"><span>项目</span><strong title="${escapeHtml(state.binding.projectPath)}">${escapeHtml(state.binding.projectLabel)}</strong></div>
      <div class="delivery-summary-row"><span>当前页面</span><strong>${escapeHtml(currentPageLabel())}</strong></div>
    </div>
    <div class="connection-actions">
      <button class="panel-button" type="button" data-connection-action="switch">更换</button>
      <button class="panel-button danger" type="button" data-connection-action="disconnect">断开</button>
    </div>
  `;
  bindConnectionActions();
}

function bindConnectionActions() {
  $all("[data-delivery-mode]", els.connectionBody).forEach((button) => {
    button.addEventListener("click", () => {
      state.deliveryMode = button.dataset.deliveryMode;
      state.pairingError = "";
      persistDeliverySettings();
      render();
    });
  });

  $all("[data-connection-action]", els.connectionBody).forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.connectionAction;
      if (action === "pair") {
        const input = $("#connection-code", els.connectionBody);
        const code = input?.value.trim() || "";
        if (!/^\d{6}$/.test(code)) {
          state.pairingError = "请输入完整的 6 位配对码";
          render();
          return;
        }
        state.servicePaired = true;
        state.pairingError = "";
        persistDeliverySettings();
        showToast("本地服务已配对");
      }
      if (action === "bind") {
        const agent = $("input[name='connection-agent']:checked", els.connectionBody)?.value;
        const projectValue = $("input[name='connection-project']:checked", els.connectionBody)?.value;
        const project = PROJECT_OPTIONS.find((option) => option.value === projectValue);
        if (!agent || !project) return;
        state.binding = {
          agent,
          projectId: project.value,
          projectLabel: project.label,
          projectPath: project.path,
        };
        state.deliveryMode = "agent";
        persistDeliverySettings();
        showToast(`当前页面已绑定 ${project.label} · ${agentLabel(agent)}`);
      }
      if (action === "switch") {
        state.binding = null;
        persistDeliverySettings();
      }
      if (action === "disconnect") {
        state.binding = null;
        state.deliveryMode = "copy";
        persistDeliverySettings();
        showToast("Agent 已断开，继续使用复制模式");
      }
      render();
    });
  });

  const codeInput = $("#connection-code", els.connectionBody);
  codeInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    $("[data-connection-action='pair']", els.connectionBody)?.click();
  });
}

function createSeedAnnotations() {
  const seeds = [
    {
      selector: '[data-label="导出按钮"]',
      comment: "这个动作现在像次级操作，但它其实是交付给智能体的关键入口。建议强化视觉层级。",
      status: "pending",
      sourceFile: "src/app/DashboardHeader.tsx:22",
      thread: [
        {
          role: "human",
          content: "这个动作现在像次级操作，但它其实是交付给智能体的关键入口。建议强化视觉层级。",
          timestamp: Date.now() - 1000 * 60 * 9,
        },
      ],
    },
    {
      selector: '[data-label="指标卡片组"]',
      comment: "选中态是清楚的，但其他卡片的悬停反馈太弱，容易让画布显得不可操作。",
      status: "resolved",
      sourceFile: "src/components/Metrics.tsx:31",
      thread: [
        {
          role: "human",
          content: "选中态是清楚的，但其他卡片的悬停反馈太弱，容易让画布显得不可操作。",
          timestamp: Date.now() - 1000 * 60 * 7,
        },
        {
          role: "system",
          content: "用户已检查页面效果，并将这条标注标记为已解决。",
          timestamp: Date.now() - 1000 * 60 * 6,
        },
      ],
    },
  ];

  return seeds
    .map((seed, index) => {
      const target = document.querySelector(seed.selector);
      if (!target) return null;
      return annotationFromElement(target, {
        id: `ann_seed_${index + 1}`,
        comment: seed.comment,
        status: seed.status,
        thread: seed.thread,
        sourceFile: seed.sourceFile,
      });
    })
    .filter(Boolean);
}

function annotationFromElement(element, overrides = {}, clientPoint) {
  const rect = element.getBoundingClientRect();
  const point = clientPoint || {
    x: rect.left + rect.width / 2,
    y: rect.top + Math.min(rect.height / 2, 22),
  };
  const selectedText = getSelectedText();
  const sourceFile = overrides.sourceFile || element.dataset.source || inferSourceFile(element);
  const elementName = identifyElement(element);
  const selector = readableSelector(element);
  const path = buildElementPath(element);

  return {
    id: overrides.id || `ann_${Date.now()}_${Math.round(Math.random() * 10000)}`,
    x: (point.x / window.innerWidth) * 100,
    y: point.y + window.scrollY,
    element: elementName,
    selector,
    elementPath: path,
    sourceFile,
    comment: overrides.comment || "",
    status: overrides.status || "pending",
    selectedText,
    boundingBox: {
      x: rect.left,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    },
    url: window.location.pathname + window.location.hash,
    createdAt: new Date().toISOString(),
    thread: overrides.thread || [],
    targetNodeId: element.dataset.nodeId,
    component: inferComponent(element),
    changeSet: overrides.changeSet || null,
    styleSnapshot: overrides.styleSnapshot || collectStyleSnapshot(element),
  };
}

function identifyElement(element) {
  if (element.dataset.label) return element.dataset.label;
  const aria = element.getAttribute("aria-label");
  if (aria) return `${element.tagName.toLowerCase()} [${aria}]`;
  const tag = element.tagName.toLowerCase();
  const text = (element.innerText || element.textContent || "").trim().replace(/\s+/g, " ");

  if (tag === "button") return text ? `按钮 "${truncate(text, 28)}"` : "按钮";
  if (tag === "input") return `输入框 "${element.getAttribute("placeholder") || element.value || "文本"}"`;
  if (/h[1-6]/.test(tag)) return text ? `${tag} "${truncate(text, 36)}"` : tag;
  if (tag === "p") return text ? `段落 "${truncate(text, 42)}"` : "段落";
  if (tag === "article" && text) return `卡片 "${truncate(text, 28)}"`;
  const meaningfulClasses = Array.from(element.classList).filter((name) => name !== "annotation-candidate");
  if (meaningfulClasses.length) return meaningfulClasses.slice(0, 2).join(" ");
  return tag === "div" ? "容器" : tag;
}

function inferComponent(element) {
  const label = element.dataset.label || identifyElement(element);
  const labelMap = {
    "演示浏览器": "DemoBrowser",
    "侧边导航": "SideNav",
    "仪表盘标题": "DashboardTitle",
    "导出按钮": "ExportButton",
    "指标卡片组": "MetricsRow",
    "收入指标": "MetricCard",
    "活跃智能体指标": "MetricCard",
    "解决率指标": "MetricCard",
    "反馈表格": "FeedbackTable",
    "主按钮": "PrimaryButton",
    "次按钮": "SecondaryButton",
    "弹窗触发按钮": "ModalTrigger",
    "隔离弹窗触发按钮": "ShadowModalTrigger",
    "反馈输入框": "FeedbackInput",
    "示例卡片": "ExampleCard",
    "动态进度条": "ProgressBar",
    "隔离弹窗": "ShadowModal",
  };
  if (labelMap[label]) return `<${labelMap[label]}>`;
  const clean = label
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  return `<${clean || "Component"}>`;
}

function inferSourceFile(element) {
  const tag = element.tagName.toLowerCase();
  if (tag === "button") return "src/components/Button.tsx:14";
  if (tag === "input") return "src/components/Input.tsx:9";
  if (element.classList.contains("metric-card")) return "src/components/Metrics.tsx:31";
  if (element.classList.contains("demo-card")) return "src/components/ExampleCard.tsx:5";
  return "src/app/page.tsx:1";
}

function readableSelector(element) {
  if (element.id) return `#${cssEscape(element.id)}`;
  if (element.dataset.label) return `[data-label="${element.dataset.label.replace(/"/g, '\\"')}"]`;
  if (element.classList.length) {
    const classes = Array.from(element.classList)
      .filter((name) => name !== "annotation-candidate" && !/^selected|active|green|blue|purple$/.test(name))
      .slice(0, 2)
      .map((name) => `.${cssEscape(name)}`)
      .join("");
    if (classes) return `${element.tagName.toLowerCase()}${classes}`;
  }
  return buildElementPath(element, 3);
}

function cssEscape(value) {
  if (window.CSS && CSS.escape) return CSS.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function getTargetByNodeId(nodeId) {
  return nodeId ? document.querySelector(`[data-node-id="${nodeId}"]`) : null;
}

function repairTransientAnnotation(annotation) {
  const hasTransientData = annotation.element === "annotation-candidate"
    || annotation.selector?.includes("annotation-candidate")
    || annotation.elementPath?.includes("annotation-candidate");
  if (!hasTransientData) return annotation;
  const target = getTargetByNodeId(annotation.targetNodeId);
  if (!target) return annotation;
  target.classList.remove("annotation-candidate");
  return {
    ...annotation,
    element: identifyElement(target),
    selector: readableSelector(target),
    elementPath: buildElementPath(target),
    component: inferComponent(target),
  };
}

function collectQuickDraft(element) {
  const computed = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const originalStyles = Object.fromEntries(
    QUICK_STYLE_FIELDS.map((field) => {
      if (field.property === "width") return [field.property, `${roundNumber(rect.width)}px`];
      if (field.property === "height") return [field.property, `${roundNumber(rect.height)}px`];
      return [field.property, computed[field.property] || computed.getPropertyValue(field.cssProperty) || ""];
    }),
  );
  const inlineStyles = Object.fromEntries(QUICK_STYLE_FIELDS.map((field) => [field.property, element.style[field.property] || ""]));
  const text = getDirectText(element);
  const values = { ...originalStyles };

  return {
    originalStyles,
    values,
    inlineStyles,
    originalDisplay: computed.display,
    inlineDisplay: element.style.display || "",
    text,
    textValue: text?.value || "",
    paddingLinked: new Set(PADDING_PROPS.map((property) => values[property])).size === 1,
    marginLinked: new Set(MARGIN_PROPS.map((property) => values[property])).size === 1,
  };
}

function collectStyleSnapshot(element) {
  const computed = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const items = STYLE_SNAPSHOT_FIELDS.flatMap((field) => {
    if (field.flexOnly && !["flex", "inline-flex"].includes(computed.display)) return [];
    const value = formatStyleColorsAsHex(computed[field.property] || "");
    return value ? [{ label: field.label, value }] : [];
  });
  items.splice(9, 0,
    { label: "width", value: `${roundNumber(rect.width)}px` },
    { label: "height", value: `${roundNumber(rect.height)}px` },
  );
  return items;
}

function getAnnotationStyleSnapshot(annotation) {
  if (Array.isArray(annotation.styleSnapshot) && annotation.styleSnapshot.length) {
    return annotation.styleSnapshot;
  }
  const target = getAnnotationTarget(annotation);
  if (target) return collectStyleSnapshot(target);
  return [
    { label: "width", value: `${roundNumber(annotation.boundingBox?.width || 0)}px` },
    { label: "height", value: `${roundNumber(annotation.boundingBox?.height || 0)}px` },
  ];
}

function getDirectText(element) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return { value: element.value, kind: "value" };
  }
  const textNodes = Array.from(element.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
  const text = textNodes.map((node) => node.textContent || "").join("").trim().replace(/\s+/g, " ");
  if (!text || element.children.length > 0) return null;
  return { value: text, kind: "textContent" };
}

function ensureQuickDraft(annotation) {
  if (annotation.quickDraft) return annotation.quickDraft;
  const target = getTargetByNodeId(annotation.targetNodeId) || getAnnotationTarget(annotation);
  if (!target) return null;
  annotation.quickDraft = collectQuickDraft(target);
  return annotation.quickDraft;
}

function quickField(property) {
  return QUICK_STYLE_FIELDS.find((field) => field.property === property);
}

function trimNumber(value) {
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return String(value || "").trim();
  return Number.parseFloat(number.toFixed(2)).toString();
}

function clampNumber(value, min, max) {
  let next = value;
  if (min !== undefined && min !== "") next = Math.max(Number.parseFloat(min), next);
  if (max !== undefined && max !== "") next = Math.min(Number.parseFloat(max), next);
  return next;
}

function parseQuickValueToken(value, field) {
  const raw = String(value || "").trim();
  if (field?.type === "length") {
    const px = /^(-?\d+(?:\.\d+)?)px$/i.exec(raw);
    if (px) return { value: trimNumber(px[1]), unit: "px" };
    if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { value: trimNumber(raw), unit: "px" };
  }
  return { value: raw, unit: "" };
}

function normalizeHexColor(value) {
  const match = String(value || "").trim().match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  return match ? `#${match[1].toUpperCase()}` : null;
}

function normalizeQuickValue(value, field, unit = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (field.type === "color") return normalizeHexColor(trimmed) || trimmed;
  if (field.type === "length" && /^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimNumber(trimmed)}${unit || "px"}`;
  if (field.type === "number") {
    const number = Number.parseFloat(trimmed);
    if (!Number.isFinite(number)) return trimmed;
    return trimNumber(clampNumber(number, field.min, field.max));
  }
  return trimmed;
}

function setQuickControlValue(control, property, rawValue) {
  if (property === "text") {
    control.value = state.pending?.quickDraft?.textValue || "";
    return;
  }
  const field = quickField(property);
  if (!field) return;
  if (field.type === "color") {
    control.value = colorToHex(rawValue) || "#000000";
    return;
  }
  if (field.type === "length") {
    const token = parseQuickValueToken(rawValue, field);
    control.value = token.value;
    control.dataset.quickUnit = token.unit || "px";
    return;
  }
  control.value = rawValue || "";
}

function getFontOptions(currentValue) {
  const options = [...FONT_OPTIONS];
  if (currentValue && !options.some((option) => option.value === currentValue)) {
    return [{ label: currentValue, value: currentValue }, ...options];
  }
  return options;
}

function fontLabelForValue(value) {
  return getFontOptions(value).find((option) => option.value === value)?.label || value || "选择字体";
}

function choiceLabelForValue(property, value) {
  if (value === "normal") {
    if (property === "justifyContent") return "开始";
    if (property === "alignItems") return "拉伸";
  }
  const options = CHOICE_OPTIONS[property] || [];
  return options.find((option) => option.value === value)?.label || value || "默认";
}

function hasLayoutChanges(draft) {
  return ["flexDirection", "justifyContent", "alignItems"].some((property) => {
    return (draft.values[property] || "") !== (draft.originalStyles[property] || "");
  });
}

function readQuickControls() {
  if (!state.pending?.quickDraft) return;
  const draft = state.pending.quickDraft;
  $all("[data-quick-prop]", els.popup).forEach((control) => {
    const property = control.dataset.quickProp;
    if (property === "text") {
      draft.textValue = control.value;
      return;
    }
    const field = quickField(property);
    if (!field) return;
    draft.values[property] = normalizeQuickValue(control.value, field, control.dataset.quickUnit);
  });
}

function applyQuickPreview() {
  if (!state.pending?.quickDraft) return;
  const target = getTargetByNodeId(state.pending.targetNodeId) || getAnnotationTarget(state.pending);
  if (!target) return;
  const draft = state.pending.quickDraft;

  QUICK_STYLE_FIELDS.forEach((field) => {
    const value = draft.values[field.property];
    target.style[field.property] = value === draft.originalStyles[field.property] ? draft.inlineStyles[field.property] : value;
  });
  if (hasLayoutChanges(draft) && !["flex", "inline-flex"].includes(draft.originalDisplay)) {
    target.style.display = "flex";
  } else {
    target.style.display = draft.inlineDisplay || "";
  }

  if (draft.text) setElementText(target, draft.textValue, draft.text.kind);
}

function resetQuickPreview(annotation = state.pending) {
  if (!annotation?.quickDraft) return;
  const target = getTargetByNodeId(annotation.targetNodeId) || getAnnotationTarget(annotation);
  if (!target) return;
  const draft = annotation.quickDraft;
  QUICK_STYLE_FIELDS.forEach((field) => {
    target.style[field.property] = draft.inlineStyles[field.property] || "";
  });
  target.style.display = draft.inlineDisplay || "";
  if (draft.text) setElementText(target, draft.text.value, draft.text.kind);
}

function resetQuickControls() {
  if (!state.pending?.quickDraft) return;
  const draft = state.pending.quickDraft;
  draft.values = { ...draft.originalStyles };
  draft.textValue = draft.text?.value || "";
  draft.paddingLinked = new Set(PADDING_PROPS.map((property) => draft.originalStyles[property])).size === 1;
  draft.marginLinked = new Set(MARGIN_PROPS.map((property) => draft.originalStyles[property])).size === 1;
  $all("[data-quick-prop]", els.popup).forEach((control) => {
    const property = control.dataset.quickProp;
    setQuickControlValue(control, property, property === "text" ? draft.textValue : draft.values[property] || "");
  });
  $all("[data-color-for]", els.popup).forEach((control) => {
    const property = control.dataset.colorFor;
    updateColorTrigger(control, draft.values[property] || "");
  });
  refreshQuickDisplayControls();
  resetQuickPreview();
}

function refreshQuickDisplayControls() {
  const draft = state.pending?.quickDraft;
  if (!draft) return;
  const fontTrigger = $("[data-font-trigger]", els.popup);
  const fontValue = $("[data-font-value]", els.popup);
  if (fontTrigger && fontValue) {
    const value = draft.values.fontFamily || "";
    const label = fontLabelForValue(value);
    fontValue.textContent = label;
    fontTrigger.setAttribute("aria-label", `字体：${label}`);
    fontTrigger.title = value;
  }
  $all("[data-choice-trigger]", els.popup).forEach((trigger) => {
    const property = trigger.dataset.choiceTrigger;
    const value = draft.values[property] || "";
    const label = $("[data-choice-value]", trigger);
    const displayValue = choiceLabelForValue(property, value);
    if (label) label.textContent = displayValue;
    const field = quickField(property);
    if (field) trigger.setAttribute("aria-label", `${field.label}：${displayValue}`);
    trigger.title = value;
  });
  Object.values(SPACING_GROUPS).forEach((group) => {
    const link = $(`[data-spacing-link="${group.linkedKey}"]`, els.popup);
    if (!link) return;
    const linked = Boolean(draft[group.linkedKey]);
    link.classList.toggle("active", linked);
    link.setAttribute("aria-pressed", linked ? "true" : "false");
    const icon = $("i", link);
    if (icon) icon.className = linked ? "ri-link" : "ri-link-unlink";
  });
}

function setElementText(element, value, kind) {
  if (kind === "value" && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    element.value = value;
    return;
  }
  element.textContent = value;
}

function buildChangeSet(annotation) {
  const draft = annotation.quickDraft;
  if (!draft) return null;
  const properties = QUICK_STYLE_FIELDS.flatMap((field) => {
    const from = draft.originalStyles[field.property] || "";
    const to = draft.values[field.property] || "";
    return from === to ? [] : [{
      property: field.cssProperty,
      cssProperty: field.cssProperty,
      label: field.label,
      from,
      to,
      previousValue: from,
      value: to,
    }];
  });
  if (hasLayoutChanges(draft) && !["flex", "inline-flex"].includes(draft.originalDisplay)) {
    properties.unshift({
      property: "display",
      cssProperty: "display",
      label: "布局模式",
      from: draft.originalDisplay || "默认",
      to: "flex",
      previousValue: draft.originalDisplay || "",
      value: "flex",
    });
  }
  const text = draft.text && draft.textValue !== draft.text.value
    ? { label: "文本", from: draft.text.value, to: draft.textValue, previousValue: draft.text.value, value: draft.textValue, kind: draft.text.kind }
    : null;
  if (!properties.length && !text) return null;
  return {
    mode: "quick-tweak",
    previewOnly: true,
    properties,
    declarations: properties.map((item) => ({
      property: item.cssProperty,
      previousValue: item.previousValue,
      value: item.value,
    })),
    text,
    summary: summarizeChangeSet({ properties, text }),
  };
}

function summarizeChangeSet(changeSet) {
  const items = [];
  if (changeSet.text) items.push(`文本改为“${truncate(changeSet.text.to, 18)}”`);
  changeSet.properties.slice(0, 3).forEach((item) => items.push(`${item.label} ${item.from || "空"} -> ${item.to || "空"}`));
  const extra = changeSet.properties.length + (changeSet.text ? 1 : 0) - items.length;
  return `${items.join("；")}${extra > 0 ? `；另有 ${extra} 项` : ""}`;
}

function hasQuickChanges(annotation = state.pending) {
  return Boolean(annotation && buildChangeSet(annotation));
}

function roundNumber(value) {
  return Number.parseFloat(value.toFixed(2)).toString();
}

function colorToHex(value, fallback = null) {
  const color = parseColorValue(value);
  return color ? rgbaToHex(color, color.a < 1) : fallback;
}

function parseColorValue(value) {
  const raw = String(value || "").trim();
  if (raw.toLowerCase() === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  const normalizedHex = normalizeHexColor(raw);
  if (normalizedHex) {
    let hex = normalizedHex.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = hex.split("").map((part) => part + part).join("");
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgbMatch = raw.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const tokens = rgbMatch[1].replace(/,/g, " ").split(/[\s/]+/).filter(Boolean);
    const parts = tokens.slice(0, 3).map(Number.parseFloat);
    if (parts.length === 3 && parts.every(Number.isFinite)) {
      const alphaToken = tokens[3];
      const alpha = alphaToken === undefined
        ? 1
        : clampAlpha(Number.parseFloat(alphaToken) / (alphaToken.endsWith("%") ? 100 : 1));
      return {
        r: clampColorChannel(parts[0]),
        g: clampColorChannel(parts[1]),
        b: clampColorChannel(parts[2]),
        a: alpha,
      };
    }
  }

  const hslMatch = raw.match(/^hsla?\(\s*([-\d.]+)(?:deg)?(?:\s*,\s*|\s+)([\d.]+)%(?:\s*,\s*|\s+)([\d.]+)%(?:(?:\s*,\s*|\s*\/\s*)([\d.]+)(%)?)?\s*\)$/i);
  if (hslMatch) {
    const alpha = hslMatch[4] === undefined ? 1 : clampAlpha(Number.parseFloat(hslMatch[4]) / (hslMatch[5] ? 100 : 1));
    return { ...hslToRgb(Number.parseFloat(hslMatch[1]), Number.parseFloat(hslMatch[2]), Number.parseFloat(hslMatch[3])), a: alpha };
  }
  return null;
}

function rgbaToHex(color, includeAlpha = false) {
  const channels = [color.r, color.g, color.b].map((part) => clampColorChannel(part).toString(16).padStart(2, "0"));
  if (includeAlpha) channels.push(Math.round(clampAlpha(color.a) * 255).toString(16).padStart(2, "0"));
  return `#${channels.join("").toUpperCase()}`;
}

function rgbaToCss(color) {
  return `rgba(${clampColorChannel(color.r)}, ${clampColorChannel(color.g)}, ${clampColorChannel(color.b)}, ${trimNumber(clampAlpha(color.a))})`;
}

function clampColorChannel(value) {
  return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}

function clampAlpha(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function rgbToHsv({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === red) h = 60 * (((green - blue) / delta) % 6);
    else if (max === green) h = 60 * ((blue - red) / delta + 2);
    else h = 60 * ((red - green) / delta + 4);
  }
  return { h: (h + 360) % 360, s: max ? delta / max : 0, v: max };
}

function hsvToRgb(h, s, v) {
  const chroma = v * s;
  const segment = ((h % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const values = segment < 1 ? [chroma, x, 0]
    : segment < 2 ? [x, chroma, 0]
      : segment < 3 ? [0, chroma, x]
        : segment < 4 ? [0, x, chroma]
          : segment < 5 ? [x, 0, chroma]
            : [chroma, 0, x];
  const match = v - chroma;
  return { r: (values[0] + match) * 255, g: (values[1] + match) * 255, b: (values[2] + match) * 255 };
}

function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (!delta) return { h: 0, s: 0, l: lightness * 100 };
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = max === red ? ((green - blue) / delta) % 6 : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  return { h: hue, s: saturation * 100, l: lightness * 100 };
}

function hslToRgb(h, s, l) {
  const saturation = Math.max(0, Math.min(100, s)) / 100;
  const lightness = Math.max(0, Math.min(100, l)) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = ((h % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const values = segment < 1 ? [chroma, x, 0]
    : segment < 2 ? [x, chroma, 0]
      : segment < 3 ? [0, chroma, x]
        : segment < 4 ? [0, x, chroma]
          : segment < 5 ? [x, 0, chroma]
            : [chroma, 0, x];
  const match = lightness - chroma / 2;
  return { r: (values[0] + match) * 255, g: (values[1] + match) * 255, b: (values[2] + match) * 255 };
}

function formatPickerColor(color, format) {
  if (format === "rgb") return color.a < 1
    ? `rgba(${clampColorChannel(color.r)}, ${clampColorChannel(color.g)}, ${clampColorChannel(color.b)}, ${trimNumber(color.a)})`
    : `rgb(${clampColorChannel(color.r)}, ${clampColorChannel(color.g)}, ${clampColorChannel(color.b)})`;
  if (format === "hsl") {
    const hsl = rgbToHsl(color);
    return color.a < 1
      ? `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${trimNumber(color.a)})`
      : `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
  }
  return rgbaToHex(color, color.a < 1);
}

function formatStyleColorsAsHex(value) {
  return String(value || "").replace(/(?:rgba?|hsla?)\([^)]*\)/gi, (color) => colorToHex(color, color));
}

function buildElementPath(element, maxDepth = 4) {
  const parts = [];
  let current = element;
  let depth = 0;

  while (current && current !== document.body && depth < maxDepth) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      part += `#${current.id}`;
    } else if (current.classList.length) {
      part += "." + Array.from(current.classList).slice(0, 1).join(".");
    }
    parts.unshift(part);
    current = current.parentElement;
    depth += 1;
  }

  return parts.join(" > ");
}

function getSelectedText() {
  const selection = window.getSelection();
  const text = selection ? selection.toString().trim().replace(/\s+/g, " ") : "";
  return text ? truncate(text, 500) : "";
}

function truncate(text, length) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function isInternal(node) {
  if (!node || node.nodeType !== 1) return false;
  return Boolean(node.closest("[data-feedback-toolbar], .toast, script, style"));
}

function isAnnotatable(node) {
  if (!node || node.nodeType !== 1) return false;
  if (isInternal(node)) return false;
  if (node === document.documentElement || node === document.body) return false;
  const rect = node.getBoundingClientRect();
  return rect.width >= 8 && rect.height >= 8;
}

function deepElementFromPoint(x, y) {
  let element = document.elementFromPoint(x, y);
  while (element && element.shadowRoot) {
    const inner = element.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === element) break;
    element = inner;
  }
  return element;
}

function render() {
  document.body.classList.toggle("annotation-active", state.annotationActive);
  els.toolbar.classList.toggle("expanded", state.toolbarExpanded);
  els.toolbar.classList.toggle("collapsed", !state.toolbarExpanded);
  els.toolbar.classList.remove("editing");
  els.toolbar.dataset.state = state.toolbarExpanded ? "expanded" : "collapsed";
  const toolbarLabel = state.toolbarExpanded ? "收起工具条" : "展开工具条";
  els.toolbarToggle.dataset.tooltip = toolbarLabel;
  els.toolbarToggle.setAttribute("aria-label", state.toolbarExpanded ? "收起可视化反馈工具条" : "展开可视化反馈工具条");
  els.toolbarToggle.setAttribute("aria-expanded", String(state.toolbarExpanded));
  els.annotateToggle.classList.toggle("active", state.annotationActive);
  const annotateLabel = state.annotationActive
    ? "退出标注状态（也可按“ESC”退出）"
    : "进入标注状态（可按“ESC”退出）";
  els.annotateToggle.dataset.tooltip = annotateLabel;
  els.annotateToggle.setAttribute("aria-label", annotateLabel.replace(/[“”]/g, ""));
  const visibilityLabel = state.annotationsVisible ? "隐藏全部标注" : "显示全部标注";
  const visibilityIcon = $("i", els.visibilityToggle);
  els.visibilityToggle.dataset.tooltip = visibilityLabel;
  els.visibilityToggle.setAttribute("aria-label", visibilityLabel);
  els.visibilityToggle.setAttribute("aria-pressed", String(state.annotationsVisible));
  if (visibilityIcon) {
    visibilityIcon.className = state.annotationsVisible ? "ri-eye-line" : "ri-eye-off-line";
  }
  const panelLabel = state.panelOpen ? "关闭评论记录面板" : "打开评论记录面板";
  els.panelToggle.dataset.tooltip = panelLabel;
  els.panelToggle.setAttribute("aria-label", panelLabel);
  els.panelToggle.setAttribute("aria-expanded", String(state.panelOpen));
  const connectionBound = state.deliveryMode === "agent" && Boolean(state.binding);
  const connectionLabel = connectionBound
    ? `${deliveryTargetLabel()} 已绑定`
    : state.deliveryMode === "agent"
      ? "完成 Agent 绑定"
      : "复制模式，设置交付方式";
  els.connectionToggle.classList.toggle("active", state.connectionOpen);
  els.connectionToggle.dataset.connected = String(connectionBound);
  els.connectionToggle.dataset.mode = state.deliveryMode;
  els.connectionToggle.dataset.tooltip = connectionLabel;
  els.connectionToggle.setAttribute("aria-label", connectionLabel);
  els.connectionToggle.setAttribute("aria-expanded", String(state.connectionOpen));
  renderConnectionPanel();
  renderMarkers();
  renderBadge();
  renderPanel();
}

function renderBadge() {
  const activeCount = state.annotations.filter((a) => a.status !== "resolved").length;
  els.countBadge.hidden = activeCount === 0;
  els.countBadge.textContent = String(activeCount);
}

function renderMarkers() {
  els.markers.innerHTML = "";
  els.markers.hidden = !state.annotationsVisible;
  if (!state.annotationsVisible) return;

  state.annotations.forEach((annotation, index) => {
    const marker = document.createElement("button");
    marker.type = "button";
    const entering = !animatedMarkerIds.has(annotation.id);
    marker.className = `annotation-marker ${annotation.status || "pending"}${annotation.id === state.selectedId ? " selected" : ""}${entering ? " entering" : ""}`;
    if (entering) animatedMarkerIds.add(annotation.id);
    marker.style.left = `${annotation.x}%`;
    marker.style.top = `${annotation.y - window.scrollY}px`;
    marker.dataset.id = annotation.id;
    marker.setAttribute("aria-label", `编辑第 ${index + 1} 条标注`);

    const markerNumber = document.createElement("span");
    markerNumber.className = "marker-number";
    markerNumber.textContent = String(index + 1);
    marker.appendChild(markerNumber);

    const editIcon = document.createElement("i");
    editIcon.className = "ri-edit-line marker-edit-icon";
    editIcon.setAttribute("aria-hidden", "true");
    marker.appendChild(editIcon);

    const tooltip = document.createElement("span");
    tooltip.className = "marker-tooltip";
    tooltip.innerHTML = `<em>${escapeHtml(annotation.element)}</em><strong>${escapeHtml(annotation.comment)}</strong>`;
    marker.appendChild(tooltip);

    marker.addEventListener("mouseenter", () => {
      clearHoverTarget();
      els.tooltip.hidden = true;
      showStoredOutline(annotation);
    });
    marker.addEventListener("mouseleave", () => {
      if (!state.pending) hideHighlight();
    });
    marker.addEventListener("click", (event) => {
      event.stopPropagation();
      openAnnotationEditor(annotation, event.clientX, event.clientY);
    });

    els.markers.appendChild(marker);
  });
}

function showStoredOutline(annotation) {
  const target = getAnnotationTarget(annotation);
  const rect = target ? target.getBoundingClientRect() : {
    left: annotation.boundingBox.x,
    top: annotation.boundingBox.y - window.scrollY,
    width: annotation.boundingBox.width,
    height: annotation.boundingBox.height,
  };
  positionHighlight(rect, annotation.status === "resolved");
}

function getAnnotationTarget(annotation) {
  if (annotation.targetNodeId) {
    const node = document.querySelector(`[data-node-id="${annotation.targetNodeId}"]`);
    if (node) return node;
  }
  try {
    return document.querySelector(annotation.selector);
  } catch {
    return null;
  }
}

function positionHighlight(rect, resolved = false) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return;
  Object.assign(els.highlight.style, {
    left: `${Math.round(rect.left)}px`,
    top: `${Math.round(rect.top)}px`,
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`,
  });
  els.highlight.classList.toggle("resolved", resolved);
  els.highlight.hidden = false;
}

function hideHighlight() {
  els.highlight.hidden = true;
  els.tooltip.hidden = true;
}

function setHoverTarget(target = null) {
  if (state.hoverTarget && state.hoverTarget !== target) {
    state.hoverTarget.classList.remove("annotation-candidate");
  }
  state.hoverTarget = target;
  if (target) target.classList.add("annotation-candidate");
}

function clearHoverTarget() {
  setHoverTarget(null);
}

function updateHover(event) {
  hoverPoint = { x: event.clientX, y: event.clientY };
  if (hoverFrame) return;
  hoverFrame = requestAnimationFrame(processHover);
}

function processHover() {
  hoverFrame = 0;
  if (!hoverPoint || !state.annotationActive || state.pending) {
    clearHoverTarget();
    hideHighlight();
    return;
  }
  const { x, y } = hoverPoint;
  const target = deepElementFromPoint(x, y);
  if (!isAnnotatable(target)) {
    clearHoverTarget();
    hideHighlight();
    return;
  }

  if (state.hoverTarget !== target) {
    setHoverTarget(target);
    positionHighlight(target.getBoundingClientRect());
    const component = document.createElement("div");
    component.className = "tooltip-react";
    component.textContent = inferComponent(target);
    const name = document.createElement("div");
    name.className = "tooltip-name";
    name.textContent = identifyElement(target);
    els.tooltip.replaceChildren(component, name);
  }
  els.tooltip.style.left = `${Math.max(80, Math.min(x, window.innerWidth - 80))}px`;
  els.tooltip.style.top = `${Math.max(34, y - 12)}px`;
  els.tooltip.hidden = false;
}

function beginAnnotation(event) {
  const target = deepElementFromPoint(event.clientX, event.clientY);
  if (!isAnnotatable(target)) return;

  clearHoverTarget();
  const annotation = annotationFromElement(target, {}, { x: event.clientX, y: event.clientY });
  state.editingId = null;
  state.pending = annotation;
  state.panelOpen = false;
  hideHighlight();
  showPendingPopup(annotation, event.clientX, event.clientY);
  showStoredOutline(annotation);
  render();
}

function openAnnotationEditor(annotation, x, y) {
  const target = getAnnotationTarget(annotation);
  const pending = {
    ...annotation,
    boundingBox: { ...annotation.boundingBox },
    thread: (annotation.thread || []).map((item) => ({ ...item })),
    styleSnapshot: (annotation.styleSnapshot || []).map((item) => ({ ...item })),
    quickDraft: target ? collectQuickDraft(target) : null,
  };
  state.editingId = annotation.id;
  state.pending = pending;
  state.selectedId = annotation.id;
  state.panelOpen = false;
  state.contextOpenId = null;
  hideHighlight();
  showPendingPopup(pending, x, y);
  showStoredOutline(pending);
  render();
}

function showPendingPopup(annotation, x, y) {
  if (els.popup.hidden) popupReturnFocus = document.activeElement;
  ensureQuickDraft(annotation);
  const editing = state.editingId === annotation.id;
  const popupWidth = 286;
  const left = Math.max(popupWidth / 2 + 10, Math.min(x, window.innerWidth - popupWidth / 2 - 10));
  const top = Math.max(44, Math.min(y + 14, window.innerHeight - 220));
  hidePopupActionTooltip();
  els.popup._exitAnimation?.cancel();
  els.popup._exitAnimation = null;
  els.popup.style.removeProperty("opacity");
  els.popup.style.removeProperty("pointer-events");
  els.popup.style.removeProperty("transform");
  els.popup.hidden = false;
  setPopupBackgroundInert(true);
  els.popup.classList.remove("shake", "quick-open", "dragging", "dragged");
  els.popup.style.left = `${left}px`;
  els.popup.style.top = `${top}px`;
  els.popup.innerHTML = `
    <div class="popup-header">
      <span class="popup-element" id="annotation-popup-title">${escapeHtml(annotation.element)}</span>
      <div class="popup-header-actions">
        <button type="button" class="popup-tool-button popup-style-trigger" data-popup-tooltip="显示样式详情" aria-label="显示样式详情" aria-expanded="false">
          <i class="ri-palette-line" aria-hidden="true"></i>
        </button>
        <button type="button" class="popup-tool-button popup-config-toggle" data-popup-tooltip="显示可视化配置" aria-label="显示可视化配置" aria-expanded="false">
          <i class="ri-equalizer-3-line" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    ${annotation.selectedText ? `<div class="popup-quote">"${escapeHtml(annotation.selectedText)}"</div>` : ""}
    ${renderPopupStyleSnapshot(annotation)}
    <textarea class="popup-textarea" name="annotation-comment" aria-label="${editing ? "编辑标注内容" : "标注内容"}" autocomplete="off" placeholder="${COMMENT_PLACEHOLDER}"></textarea>
    ${renderQuickEditor(annotation)}
    <div class="popup-actions">
      ${editing ? `
        <button type="button" class="popup-delete" aria-label="删除标注">
          <i class="ri-delete-bin-6-line" aria-hidden="true"></i>
        </button>
      ` : ""}
      <button type="button" class="quick-reset" hidden>重置预览</button>
      <div class="popup-primary-actions">
        <button type="button" class="popup-cancel">取消</button>
        <button type="button" class="popup-submit">${editing ? "保存" : "添加"}</button>
      </div>
    </div>
  `;

  const textarea = $(".popup-textarea", els.popup);
  const cancel = $(".popup-cancel", els.popup);
  const submit = $(".popup-submit", els.popup);
  const quickToggle = $(".popup-config-toggle", els.popup);
  const quickEditor = $(".quick-editor", els.popup);
  const quickReset = $(".quick-reset", els.popup);
  const deleteButton = $(".popup-delete", els.popup);
  const styleToggle = $(".popup-style-trigger", els.popup);
  const styleBody = $(".popup-style-body", els.popup);

  textarea.value = annotation.comment || "";

  cancel.addEventListener("click", cancelPending);
  submit.addEventListener("click", addPending);
  deleteButton?.addEventListener("click", deleteEditingAnnotation);
  styleToggle?.addEventListener("click", () => {
    closeQuickColorPickers();
    const open = styleToggle.getAttribute("aria-expanded") !== "true";
    const closingSection = open && !quickEditor.hidden ? quickEditor : (open ? null : styleBody);
    if (open && !quickEditor.hidden) {
      els.popup.classList.remove("quick-open");
      quickToggle.classList.remove("active");
      quickToggle.setAttribute("aria-expanded", "false");
      quickToggle.setAttribute("aria-label", "显示可视化配置");
      quickToggle.dataset.popupTooltip = "显示可视化配置";
      textarea.placeholder = COMMENT_PLACEHOLDER;
      if (quickReset) quickReset.hidden = true;
    }
    styleToggle.classList.toggle("active", open);
    styleToggle.setAttribute("aria-expanded", String(open));
    styleToggle.setAttribute("aria-label", open ? "隐藏样式详情" : "显示样式详情");
    styleToggle.dataset.popupTooltip = open ? "隐藏样式详情" : "显示样式详情";
    hidePopupActionTooltip();
    transitionPopupSections(open ? styleBody : null, closingSection)
      .then(() => {
        if (styleToggle.getAttribute("aria-expanded") === String(open)) {
          refreshPopupActionTooltip(styleToggle);
        }
      });
  });
  quickToggle?.addEventListener("click", () => {
    closeQuickColorPickers();
    const open = quickToggle.getAttribute("aria-expanded") !== "true";
    const closingSection = open && !styleBody.hidden ? styleBody : (open ? null : quickEditor);
    if (open && !styleBody.hidden) {
      styleToggle.classList.remove("active");
      styleToggle.setAttribute("aria-expanded", "false");
      styleToggle.setAttribute("aria-label", "显示样式详情");
      styleToggle.dataset.popupTooltip = "显示样式详情";
    }
    els.popup.classList.toggle("quick-open", open);
    quickToggle.classList.toggle("active", open);
    quickToggle.setAttribute("aria-expanded", String(open));
    quickToggle.setAttribute("aria-label", open ? "隐藏可视化配置" : "显示可视化配置");
    quickToggle.dataset.popupTooltip = open ? "隐藏可视化配置" : "显示可视化配置";
    textarea.placeholder = open ? QUICK_PLACEHOLDER : COMMENT_PLACEHOLDER;
    if (quickReset) quickReset.hidden = !open;
    if (open) refreshQuickDisplayControls();
    hidePopupActionTooltip();
    transitionPopupSections(open ? quickEditor : null, closingSection)
      .then(() => {
        if (quickToggle.getAttribute("aria-expanded") === String(open)) {
          refreshPopupActionTooltip(quickToggle);
        }
      });
  });
  quickReset?.addEventListener("click", () => {
    resetQuickControls();
    showToast("已重置预览");
  });
  bindQuickControls();
  bindPopupDrag();
  bindPopupActionTooltips();
  quickEditor?.addEventListener("scroll", () => {
    hidePopupActionTooltip();
    closeQuickMenus();
    closeQuickColorPickers();
  }, { passive: true });
  styleBody?.addEventListener("scroll", hidePopupActionTooltip, { passive: true });
  textarea.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape") cancelPending();
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      addPending();
    }
  });

  requestAnimationFrame(() => {
    fitPopupToViewport();
    requestAnimationFrame(() => textarea.focus({ preventScroll: true }));
    if (editing) textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  });
}

function renderPopupStyleSnapshot(annotation) {
  const items = getAnnotationStyleSnapshot(annotation).map((item) => ({
    ...item,
    value: formatStyleColorsAsHex(item.value),
  }));
  const bodyId = `popup-style-snapshot-${annotation.id}`;
  return `
    <div class="popup-style-body" id="${escapeAttribute(bodyId)}" aria-label="样式详情" hidden>
      <dl class="popup-style-list">
        ${items.map((item) => `
          <div class="popup-style-row">
            <dt>${escapeHtml(item.label)}</dt>
            <dd>${escapeHtml(item.value)}</dd>
          </div>
        `).join("")}
      </dl>
    </div>
  `;
}

function bindPopupActionTooltips() {
  $all("[data-popup-tooltip]", els.popup).forEach((button) => {
    button.addEventListener("mouseenter", () => showPopupActionTooltip(button));
    button.addEventListener("mouseleave", hidePopupActionTooltip);
    button.addEventListener("focus", () => showPopupActionTooltip(button));
    button.addEventListener("blur", hidePopupActionTooltip);
  });
  els.popup.onscroll = hidePopupActionTooltip;
}

function showPopupActionTooltip(button) {
  if (!button || !els.popupActionTooltip) return;
  const rect = button.getBoundingClientRect();
  const popupTop = els.popup.getBoundingClientRect().top;
  els.popupActionTooltip.textContent = button.dataset.popupTooltip || "";
  els.popupActionTooltip.style.left = `${Math.max(70, Math.min(rect.left + rect.width / 2, window.innerWidth - 70))}px`;
  els.popupActionTooltip.style.top = `${Math.max(34, popupTop - 8)}px`;
  els.popupActionTooltip.hidden = false;
}

function hidePopupActionTooltip() {
  if (els.popupActionTooltip) els.popupActionTooltip.hidden = true;
}

function refreshPopupActionTooltip(button) {
  const hoveredButton = $("[data-popup-tooltip]:hover", els.popup);
  const target = hoveredButton || (document.activeElement === button ? button : null);
  if (target) requestAnimationFrame(() => showPopupActionTooltip(target));
}

const POPUP_SECTION_MOTION_PROPERTIES = [
  "height",
  "marginTop",
  "marginBottom",
  "paddingTop",
  "paddingBottom",
  "opacity",
];

function readPopupSectionFrame(section) {
  const style = getComputedStyle(section);
  return {
    height: `${section.getBoundingClientRect().height}px`,
    marginTop: style.marginTop,
    marginBottom: style.marginBottom,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    opacity: style.opacity,
  };
}

function collapsedPopupSectionFrame() {
  return {
    height: "0px",
    marginTop: "0px",
    marginBottom: "0px",
    paddingTop: "0px",
    paddingBottom: "0px",
    opacity: "0",
  };
}

function applyPopupSectionFrame(section, frame) {
  POPUP_SECTION_MOTION_PROPERTIES.forEach((property) => {
    section.style[property] = frame[property];
  });
}

function clearPopupSectionMotionStyles(section) {
  POPUP_SECTION_MOTION_PROPERTIES.forEach((property) => {
    section.style.removeProperty(property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`));
  });
  section.style.removeProperty("flex");
  section.style.removeProperty("overflow");
  if (!section.getAttribute("style")) section.removeAttribute("style");
}

function freezePopupSection(section) {
  const animation = section?._sectionAnimation;
  if (!section || !animation) return;
  const frame = readPopupSectionFrame(section);
  section._sectionAnimation = null;
  animation.cancel();
  section.hidden = false;
  section.style.flex = "0 0 auto";
  section.style.overflow = "hidden";
  applyPopupSectionFrame(section, frame);
}

function freezePopupLayout() {
  const animation = els.popup._sectionLayoutAnimation;
  if (!animation) return;
  const visualTop = els.popup.getBoundingClientRect().top;
  els.popup._sectionLayoutAnimation = null;
  animation.cancel();
  els.popup.style.top = `${visualTop}px`;
}

function savePopupSectionPresentation(section) {
  return {
    hidden: section.hidden,
    style: section.getAttribute("style"),
  };
}

function restorePopupSectionPresentation(section, presentation) {
  section.hidden = presentation.hidden;
  if (presentation.style === null) section.removeAttribute("style");
  else section.setAttribute("style", presentation.style);
}

function measurePopupSectionTarget(openingSection, closingSection) {
  const sections = Array.from(new Set([openingSection, closingSection].filter(Boolean)));
  const presentations = new Map(sections.map((section) => [section, savePopupSectionPresentation(section)]));

  if (closingSection && closingSection !== openingSection) {
    clearPopupSectionMotionStyles(closingSection);
    closingSection.hidden = true;
  }
  if (openingSection) {
    clearPopupSectionMotionStyles(openingSection);
    openingSection.hidden = false;
  }

  const openingFrame = openingSection ? readPopupSectionFrame(openingSection) : null;
  const popupHeight = els.popup.getBoundingClientRect().height;
  const currentTop = Number.parseFloat(els.popup.style.top) || els.popup.getBoundingClientRect().top;
  const targetTop = Math.max(44, Math.min(currentTop, window.innerHeight - popupHeight - 12));

  sections.forEach((section) => restorePopupSectionPresentation(section, presentations.get(section)));
  return { openingFrame, targetTop };
}

function animatePopupSection(section, open, targetFrame, duration, easing) {
  if (!section) return null;
  const wasHidden = section.hidden;
  const startFrame = wasHidden ? collapsedPopupSectionFrame() : readPopupSectionFrame(section);
  const endFrame = open ? targetFrame : collapsedPopupSectionFrame();

  section.hidden = false;
  section.style.flex = "0 0 auto";
  section.style.overflow = "hidden";
  applyPopupSectionFrame(section, startFrame);

  const animation = section.animate([startFrame, endFrame], {
    duration,
    easing,
    fill: "forwards",
  });
  section._sectionAnimation = animation;
  animation.finished.catch(() => {}).then(() => {
    if (section._sectionAnimation !== animation) return;
    section._sectionAnimation = null;
    section.hidden = !open;
    clearPopupSectionMotionStyles(section);
    animation.cancel();
  });
  return animation;
}

function transitionPopupSections(openingSection, closingSection) {
  freezePopupLayout();
  [openingSection, closingSection].filter(Boolean).forEach(freezePopupSection);
  const transitionId = Symbol("popup-section-transition");
  els.popup._sectionTransitionId = transitionId;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof els.popup.animate !== "function") {
    if (closingSection && closingSection !== openingSection) {
      closingSection.hidden = true;
      clearPopupSectionMotionStyles(closingSection);
    }
    if (openingSection) {
      openingSection.hidden = false;
      clearPopupSectionMotionStyles(openingSection);
    }
    if (els.popup._sectionTransitionId === transitionId) fitPopupToViewport();
    return Promise.resolve();
  }

  const currentTop = els.popup.getBoundingClientRect().top;
  const { openingFrame, targetTop } = measurePopupSectionTarget(openingSection, closingSection);
  const opening = Boolean(openingSection);
  const switching = Boolean(openingSection && closingSection && openingSection !== closingSection);
  const duration = opening || switching ? 240 : 170;
  const easing = opening || switching
    ? "cubic-bezier(0.3, 0, 0.2, 1)"
    : "cubic-bezier(0.3, 0, 0.2, 1)";

  const animations = [];
  const openingAnimation = animatePopupSection(openingSection, true, openingFrame, duration, easing);
  const closingAnimation = animatePopupSection(closingSection, false, null, duration, easing);
  if (openingAnimation) animations.push(openingAnimation);
  if (closingAnimation && closingAnimation !== openingAnimation) animations.push(closingAnimation);

  els.popup.style.top = `${targetTop}px`;
  const offsetY = currentTop - targetTop;
  if (Math.abs(offsetY) > 0.5) {
    const layoutAnimation = els.popup.animate([
      { transform: `translateX(-50%) translateY(${offsetY}px)` },
      { transform: "translateX(-50%) translateY(0)" },
    ], {
      duration,
      easing,
      fill: "forwards",
    });
    els.popup._sectionLayoutAnimation = layoutAnimation;
    animations.push(layoutAnimation);
    layoutAnimation.finished.catch(() => {}).then(() => {
      if (els.popup._sectionLayoutAnimation !== layoutAnimation) return;
      els.popup._sectionLayoutAnimation = null;
      layoutAnimation.cancel();
    });
  }

  return Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
    if (els.popup._sectionTransitionId !== transitionId) return;
    fitPopupToViewport();
  });
}

function fitPopupToViewport() {
  if (els.popup.hidden) return;
  const rect = els.popup.getBoundingClientRect();
  const actualWidth = Math.min(rect.width || 286, window.innerWidth - 24);
  const actualHeight = Math.min(rect.height, window.innerHeight - 56);
  const currentLeft = Number.parseFloat(els.popup.style.left) || window.innerWidth / 2;
  const left = Math.max(actualWidth / 2 + 12, Math.min(currentLeft, window.innerWidth - actualWidth / 2 - 12));
  const currentTop = Number.parseFloat(els.popup.style.top) || 44;
  const top = Math.max(44, Math.min(currentTop, window.innerHeight - actualHeight - 12));
  els.popup.style.left = `${left}px`;
  els.popup.style.top = `${top}px`;
}

function bindPopupDrag() {
  const handle = $(".quick-drag-handle", els.popup);
  if (!handle) return;

  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    hidePopupActionTooltip();
    closeQuickMenus();
    closeQuickColorPickers();
    const rect = els.popup.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = rect.left;
    const startTop = rect.top;
    els.popup.classList.add("dragging", "dragged");
    document.body.classList.add("popup-dragging");
    handle.setPointerCapture?.(event.pointerId);

    const onMove = (moveEvent) => {
      const nextLeft = Math.max(8, Math.min(startLeft + moveEvent.clientX - startX, window.innerWidth - rect.width - 8));
      const nextTop = Math.max(44, Math.min(startTop + moveEvent.clientY - startY, window.innerHeight - rect.height - 8));
      els.popup.style.left = `${nextLeft + rect.width / 2}px`;
      els.popup.style.top = `${nextTop}px`;
    };
    const onEnd = () => {
      els.popup.classList.remove("dragging");
      document.body.classList.remove("popup-dragging");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd, { once: true });
    window.addEventListener("pointercancel", onEnd, { once: true });
  });
}

function renderQuickEditor(annotation) {
  const draft = annotation.quickDraft;
  if (!draft) return "";
  const target = getTargetByNodeId(annotation.targetNodeId) || getAnnotationTarget(annotation);
  const targetTag = target?.tagName.toLowerCase() || (annotation.component || annotation.element || "元素").replace(/[<>]/g, "");
  const textControl = draft.text ? `
    <label class="quick-row quick-row-text">
      <span class="quick-row-label">文本</span>
      <input class="quick-control-input" type="text" name="quick-text" autocomplete="off" data-quick-prop="text" value="${escapeAttribute(draft.textValue)}" />
    </label>
  ` : `
    <div class="quick-row quick-row-muted">
      <span class="quick-row-label">文本</span>
      <em>当前元素没有可安全替换的直接文本</em>
    </div>
  `;

  return `
    <div class="quick-editor" hidden>
      <div class="quick-selected-element">
        <span class="quick-selected-tag">${escapeHtml(targetTag)}</span>
        <button class="quick-drag-handle" type="button" data-popup-tooltip="拖动面板" aria-label="拖动标注面板">
          <i class="ri-draggable" aria-hidden="true"></i>
        </button>
      </div>
      ${textControl}
      <div class="quick-control-stack">
        ${renderQuickColorField("color", draft)}
        ${renderQuickColorField("backgroundColor", draft)}
        ${renderQuickField("opacity", draft)}
        ${renderQuickField("fontFamily", draft)}
        ${renderQuickField("fontSize", draft)}
        ${renderQuickField("fontWeight", draft)}
        ${renderQuickField("borderRadius", draft)}
        ${renderQuickColorField("borderColor", draft)}
        ${renderQuickField("borderWidth", draft)}
        ${renderQuickField("width", draft)}
        ${renderQuickField("height", draft)}
      </div>
      ${renderSpacingGroup("padding", draft)}
      ${renderSpacingGroup("margin", draft)}
      <div class="quick-layout-stack">
        ${renderQuickField("flexDirection", draft)}
        ${renderQuickField("justifyContent", draft)}
        ${renderQuickField("alignItems", draft)}
      </div>
    </div>
  `;
}

function renderQuickColorField(property, draft) {
  const field = quickField(property);
  const value = draft.values[property] || "";
  const color = parseColorValue(value) || { r: 0, g: 0, b: 0, a: 1 };
  const hexValue = rgbaToHex(color, color.a < 1);
  return `
    <div class="quick-row quick-row-color">
      <span class="quick-row-label">${escapeHtml(field.label)}</span>
      <div class="quick-color-control">
        <button class="quick-color-swatch" type="button" data-color-for="${property}" data-color-trigger aria-label="选择${escapeAttribute(field.label)}" aria-haspopup="dialog" aria-expanded="false">
          <span class="quick-color-chip" style="background:${escapeAttribute(rgbaToCss(color))}"></span>
        </button>
        <input class="quick-control-input quick-color-value" type="text" name="quick-${property}" autocomplete="off" data-quick-prop="${property}" value="${escapeAttribute(hexValue)}" aria-label="${escapeAttribute(field.label)} HEX 数值" spellcheck="false" />
        <div class="quick-color-picker" data-color-picker="${property}" popover="manual" role="dialog" aria-label="${escapeAttribute(field.label)}颜色选择器">
          <div class="quick-color-sv" data-color-sv aria-label="调整饱和度和明度">
            <span class="quick-color-sv-thumb" data-color-sv-thumb></span>
          </div>
          <label class="quick-color-slider-row hue">
            <span>色相</span>
            <input type="range" min="0" max="360" step="1" data-color-hue aria-label="色相" />
          </label>
          <label class="quick-color-slider-row alpha">
            <span>透明度</span>
            <span class="quick-alpha-track">
              <input type="range" min="0" max="100" step="1" data-color-alpha aria-label="透明度" />
            </span>
          </label>
          <div class="quick-color-format-row">
            <div class="quick-color-format-select" data-color-format-select>
              <button type="button" data-color-format-trigger aria-label="切换颜色格式" aria-expanded="false">
                <span data-color-format-label>HEX</span>
                <i class="ri-arrow-down-s-line" aria-hidden="true"></i>
              </button>
              <div class="quick-color-format-menu" data-color-format-menu hidden>
                <button type="button" class="selected" data-color-format-option="hex">HEX</button>
                <button type="button" data-color-format-option="rgb">RGB</button>
                <button type="button" data-color-format-option="hsl">HSL</button>
              </div>
            </div>
            <input type="text" name="color-format-value" autocomplete="off" data-color-format-value aria-label="颜色格式数值" spellcheck="false" />
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderQuickField(property, draft) {
  const field = quickField(property);
  if (field.type === "font") return renderQuickFontField(property, draft);
  if (field.type === "choice") return renderQuickChoiceField(property, draft);
  if (field.type === "length" || field.type === "number") return renderQuickTokenField(property, draft);

  const value = draft.values[property] || "";
  return `
    <label class="quick-row">
      <span class="quick-row-label">${escapeHtml(field.label)}</span>
      <input class="quick-control-input" type="text" name="quick-${property}" autocomplete="off" data-quick-prop="${property}" value="${escapeAttribute(value)}" />
    </label>
  `;
}

function renderQuickChoiceField(property, draft) {
  const field = quickField(property);
  const value = draft.values[property] || "";
  const options = CHOICE_OPTIONS[property] || [];
  return `
    <label class="quick-row quick-row-choice">
      <span class="quick-row-label">${escapeHtml(field.label)}</span>
      <div class="quick-select" data-choice-select>
        <input type="hidden" data-quick-prop="${property}" value="${escapeAttribute(value)}" />
        <button type="button" class="quick-select-trigger" data-choice-trigger="${property}" aria-label="${escapeAttribute(field.label)}：${escapeAttribute(choiceLabelForValue(property, value))}" aria-expanded="false">
          <span data-choice-value>${escapeHtml(choiceLabelForValue(property, value))}</span>
          <i class="ri-arrow-down-s-line" aria-hidden="true"></i>
        </button>
        <div class="quick-select-menu" data-choice-menu popover="manual">
          ${options.map((option) => `
            <button type="button" class="quick-select-option${option.value === value ? " selected" : ""}" data-choice-prop="${property}" data-choice-option="${escapeAttribute(option.value)}">
              ${escapeHtml(option.label)}
            </button>
          `).join("")}
        </div>
      </div>
    </label>
  `;
}

function renderQuickFontField(property, draft) {
  const field = quickField(property);
  const value = draft.values[property] || "";
  const options = getFontOptions(value);
  return `
    <label class="quick-row quick-row-font">
      <span class="quick-row-label">${escapeHtml(field.label)}</span>
      <div class="quick-select" data-font-select>
        <input type="hidden" data-quick-prop="${property}" value="${escapeAttribute(value)}" />
        <button type="button" class="quick-select-trigger" data-font-trigger aria-label="${escapeAttribute(field.label)}：${escapeAttribute(fontLabelForValue(value))}" aria-expanded="false">
          <span data-font-value>${escapeHtml(fontLabelForValue(value))}</span>
          <i class="ri-arrow-down-s-line" aria-hidden="true"></i>
        </button>
        <div class="quick-select-menu" data-font-menu popover="manual">
          ${options.map((option) => `
            <button type="button" class="quick-select-option${option.value === value ? " selected" : ""}" data-font-option="${escapeAttribute(option.value)}">
              ${escapeHtml(option.label)}
            </button>
          `).join("")}
        </div>
      </div>
    </label>
  `;
}

function renderQuickTokenField(property, draft) {
  const field = quickField(property);
  const value = draft.values[property] || "";
  const token = parseQuickValueToken(value, field);
  const inputType = field.type === "number" ? "number" : "text";
  const numberAttrs = field.type === "number" ? ` step="${field.step || 1}" min="${field.min || ""}" max="${field.max || ""}"` : ` inputmode="decimal"`;
  return `
    <label class="quick-row quick-row-token">
      <span class="quick-row-label quick-scrub-label" data-scrub-for="${property}">${escapeHtml(field.label)}</span>
      <div class="quick-token-control" data-scrub-for="${property}">
        <input class="quick-control-input" type="${inputType}" name="quick-${property}" autocomplete="off"${numberAttrs} data-quick-prop="${property}" data-quick-unit="${escapeAttribute(token.unit)}" value="${escapeAttribute(token.value)}" />
        ${token.unit ? `<span class="quick-unit">${escapeHtml(token.unit)}</span>` : ""}
      </div>
    </label>
  `;
}

function renderSpacingGroup(kind, draft) {
  const group = SPACING_GROUPS[kind];
  if (!group) return "";
  return `
    <div class="quick-padding-group quick-spacing-group" data-spacing-kind="${kind}">
      <div class="quick-padding-head quick-spacing-head">
        <span class="quick-row-label quick-scrub-label" data-scrub-for="${group.props[0]}">${escapeHtml(group.label)}</span>
        <button type="button" class="quick-link-button${draft[group.linkedKey] ? " active" : ""}" data-popup-tooltip="联动四边${escapeAttribute(group.label)}" data-spacing-link="${group.linkedKey}" data-spacing-kind="${kind}" aria-label="联动四边${escapeAttribute(group.label)}" aria-pressed="${draft[group.linkedKey] ? "true" : "false"}">
          <i class="${draft[group.linkedKey] ? "ri-link" : "ri-link-unlink"}" aria-hidden="true"></i>
        </button>
      </div>
      <div class="quick-padding-controls quick-spacing-controls">
        ${group.props.map((property) => renderQuickMiniField(property, draft, group.label)).join("")}
      </div>
    </div>
  `;
}

function renderQuickMiniField(property, draft, groupLabel = "间距") {
  const value = draft.values[property] || "";
  const field = quickField(property);
  const token = parseQuickValueToken(value, field);
  const label = {
    paddingTop: "上",
    paddingRight: "右",
    paddingBottom: "下",
    paddingLeft: "左",
    marginTop: "上",
    marginRight: "右",
    marginBottom: "下",
    marginLeft: "左",
  }[property];
  return `
    <label class="quick-mini-field" data-scrub-for="${property}">
      <span>${label}</span>
      <div class="quick-token-control compact">
        <input class="quick-control-input" type="text" name="quick-${property}" autocomplete="off" inputmode="decimal" aria-label="${label}${groupLabel}" data-quick-prop="${property}" data-quick-unit="${escapeAttribute(token.unit || "px")}" value="${escapeAttribute(token.value)}" />
        <em>${escapeHtml(token.unit || "px")}</em>
      </div>
    </label>
  `;
}

function bindQuickControls() {
  $all("[data-color-trigger]", els.popup).forEach(bindQuickColorPicker);
  $all("[data-quick-prop]", els.popup).forEach((control) => {
    control.addEventListener("input", () => {
      syncLinkedSpacing(control);
      syncColorSwatch(control);
      readQuickControls();
      applyQuickPreview();
      refreshQuickDisplayControls();
    });
    control.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Escape") cancelPending();
      if (event.key === "Enter" && quickField(control.dataset.quickProp)?.type === "color") {
        event.preventDefault();
        normalizeQuickColorControl(control);
        control.blur();
        return;
      }
      handleQuickNumberKeydown(event, control);
    });
    control.addEventListener("blur", () => normalizeQuickColorControl(control));
  });
  $all("[data-font-trigger]", els.popup).forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const select = trigger.closest("[data-font-select]");
      const menu = $("[data-font-menu]", select);
      toggleQuickMenu(trigger, menu);
    });
  });
  $all("[data-font-option]", els.popup).forEach((option) => {
    option.addEventListener("click", () => {
      const select = option.closest("[data-font-select]");
      const input = $("[data-quick-prop='fontFamily']", select);
      if (input) input.value = option.dataset.fontOption || "";
      $all("[data-font-option]", select).forEach((item) => item.classList.toggle("selected", item === option));
      readQuickControls();
      applyQuickPreview();
      refreshQuickDisplayControls();
      closeQuickMenus();
    });
  });
  $all("[data-choice-trigger]", els.popup).forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const select = trigger.closest("[data-choice-select]");
      const menu = $("[data-choice-menu]", select);
      toggleQuickMenu(trigger, menu);
    });
  });
  $all("[data-choice-option]", els.popup).forEach((option) => {
    option.addEventListener("click", () => {
      const property = option.dataset.choiceProp;
      const select = option.closest("[data-choice-select]");
      const input = $(`[data-quick-prop="${property}"]`, select);
      if (input) input.value = option.dataset.choiceOption || "";
      $all("[data-choice-option]", select).forEach((item) => item.classList.toggle("selected", item === option));
      readQuickControls();
      applyQuickPreview();
      refreshQuickDisplayControls();
      closeQuickMenus();
    });
  });
  $all("[data-spacing-link]", els.popup).forEach((link) => link.addEventListener("click", () => {
    const draft = state.pending?.quickDraft;
    if (!draft) return;
    const group = SPACING_GROUPS[link.dataset.spacingKind];
    if (!group) return;
    draft[group.linkedKey] = !draft[group.linkedKey];
    if (draft[group.linkedKey]) {
      const first = $(`[data-quick-prop="${group.props[0]}"]`, els.popup);
      if (first) syncLinkedSpacing(first, true);
      readQuickControls();
      applyQuickPreview();
    }
    refreshQuickDisplayControls();
  }));
  bindQuickScrubControls();
  $(".quick-editor", els.popup)?.addEventListener("click", (event) => {
    if (!event.target.closest("[data-font-select], [data-choice-select]")) closeQuickMenus();
    if (!event.target.closest("[data-color-picker], [data-color-trigger]")) closeQuickColorPickers();
  });
}

function closeQuickMenus() {
  $all("[data-font-menu], [data-choice-menu]", els.popup).forEach((menu) => {
    if (menu.matches?.(":popover-open")) menu.hidePopover();
    menu.classList.remove("is-open");
  });
  $all("[data-font-trigger]", els.popup).forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
  });
  $all("[data-choice-trigger]", els.popup).forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
  });
}

function toggleQuickMenu(trigger, menu) {
  const open = !menu.classList.contains("is-open");
  closeQuickColorPickers();
  closeQuickMenus();
  if (!open) return;
  menu.classList.add("is-open");
  menu.showPopover?.();
  trigger.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => positionQuickMenu(trigger, menu));
}

function positionQuickMenu(trigger, menu) {
  if (!menu?.classList.contains("is-open")) return;
  const triggerRect = trigger.getBoundingClientRect();
  const actionsRect = $(".popup-actions", els.popup)?.getBoundingClientRect();
  const viewportPadding = 8;
  const gap = 6;
  const width = Math.min(triggerRect.width, window.innerWidth - viewportPadding * 2);
  const left = Math.max(viewportPadding, Math.min(triggerRect.left, window.innerWidth - width - viewportPadding));

  menu.style.width = `${width}px`;
  menu.style.left = `${left}px`;
  menu.style.top = "0px";
  menu.style.maxHeight = "220px";

  const desiredHeight = Math.min(menu.scrollHeight + 2, 220);
  const bottomBoundary = Math.min(window.innerHeight - viewportPadding, (actionsRect?.top || window.innerHeight) - gap);
  const spaceBelow = bottomBoundary - triggerRect.bottom - gap;
  const spaceAbove = triggerRect.top - viewportPadding - gap;
  const placeAbove = spaceBelow < Math.min(desiredHeight, 120) && spaceAbove > spaceBelow;
  const availableHeight = placeAbove ? spaceAbove : Math.max(spaceBelow, 80);
  const maxHeight = Math.max(80, Math.min(desiredHeight, availableHeight));
  const height = Math.min(desiredHeight, maxHeight);
  const top = placeAbove
    ? Math.max(viewportPadding, triggerRect.top - gap - height)
    : Math.min(triggerRect.bottom + gap, window.innerHeight - viewportPadding - height);

  menu.style.maxHeight = `${maxHeight}px`;
  menu.style.top = `${top}px`;
  menu.style.transformOrigin = placeAbove ? "100% 100%" : "100% 0%";
  menu.style.setProperty("--motion-enter-y", placeAbove ? "4px" : "-4px");
}

function bindQuickColorPicker(trigger) {
  const property = trigger.dataset.colorFor;
  const picker = $(`[data-color-picker="${property}"]`, els.popup);
  if (!picker) return;

  trigger.addEventListener("click", () => toggleQuickColorPicker(trigger, picker));

  const surface = $("[data-color-sv]", picker);
  surface?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    surface.setPointerCapture?.(event.pointerId);
    const update = (pointerEvent) => {
      const rect = surface.getBoundingClientRect();
      const state = picker._colorState;
      if (!state || !rect.width || !rect.height) return;
      state.s = Math.max(0, Math.min(1, (pointerEvent.clientX - rect.left) / rect.width));
      state.v = Math.max(0, Math.min(1, 1 - (pointerEvent.clientY - rect.top) / rect.height));
      applyColorPickerState(picker);
    };
    const stop = () => {
      window.removeEventListener("pointermove", update);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    update(event);
    window.addEventListener("pointermove", update);
    window.addEventListener("pointerup", stop, { once: true });
    window.addEventListener("pointercancel", stop, { once: true });
  });

  $("[data-color-hue]", picker)?.addEventListener("input", (event) => {
    if (!picker._colorState) return;
    picker._colorState.h = Number.parseFloat(event.currentTarget.value) || 0;
    applyColorPickerState(picker);
  });
  $("[data-color-alpha]", picker)?.addEventListener("input", (event) => {
    if (!picker._colorState) return;
    picker._colorState.a = (Number.parseFloat(event.currentTarget.value) || 0) / 100;
    applyColorPickerState(picker);
  });
  const formatTrigger = $("[data-color-format-trigger]", picker);
  const formatMenu = $("[data-color-format-menu]", picker);
  formatTrigger?.addEventListener("click", () => {
    const open = formatMenu.hidden;
    formatMenu.hidden = !open;
    formatTrigger.setAttribute("aria-expanded", String(open));
  });
  $all("[data-color-format-option]", picker).forEach((option) => {
    option.addEventListener("click", () => {
      picker.dataset.colorFormat = option.dataset.colorFormatOption;
      closeColorFormatMenu(picker);
      renderColorPickerState(picker);
    });
  });
  picker.addEventListener("click", (event) => {
    if (!event.target.closest("[data-color-format-select]")) closeColorFormatMenu(picker);
  });
  const formatValue = $("[data-color-format-value]", picker);
  const commitFormatValue = () => {
    const color = parseColorValue(formatValue?.value);
    if (!color) return;
    setColorPickerState(picker, color);
    applyColorPickerState(picker);
  };
  formatValue?.addEventListener("change", commitFormatValue);
  formatValue?.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key !== "Enter") return;
    event.preventDefault();
    commitFormatValue();
  });
}

function toggleQuickColorPicker(trigger, picker) {
  const open = !picker.classList.contains("is-open");
  closeQuickColorPickers();
  closeQuickMenus();
  if (!open) return;
  const property = trigger.dataset.colorFor;
  const input = $(`[data-quick-prop="${property}"]`, els.popup);
  const color = parseColorValue(input?.value) || { r: 0, g: 0, b: 0, a: 1 };
  setColorPickerState(picker, color);
  picker.classList.add("is-open");
  picker.showPopover?.();
  trigger.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => positionQuickColorPicker(trigger, picker));
}

function closeQuickColorPickers() {
  let closed = false;
  $all("[data-color-picker]", els.popup).forEach((picker) => {
    if (!picker.classList.contains("is-open")) return;
    closeColorFormatMenu(picker);
    if (picker.matches?.(":popover-open")) picker.hidePopover();
    picker.classList.remove("is-open");
    const trigger = $(`[data-color-for="${picker.dataset.colorPicker}"]`, els.popup);
    trigger?.setAttribute("aria-expanded", "false");
    closed = true;
  });
  return closed;
}

function closeColorFormatMenu(picker) {
  const menu = $("[data-color-format-menu]", picker);
  const trigger = $("[data-color-format-trigger]", picker);
  if (menu) menu.hidden = true;
  trigger?.setAttribute("aria-expanded", "false");
}

function positionQuickColorPicker(trigger, picker) {
  if (!picker.classList.contains("is-open")) return;
  const triggerRect = trigger.getBoundingClientRect();
  const pickerRect = picker.getBoundingClientRect();
  const padding = 8;
  const gap = 8;
  const width = pickerRect.width || 248;
  const height = pickerRect.height || 260;
  const left = Math.max(padding, Math.min(triggerRect.left - 4, window.innerWidth - width - padding));
  const spaceBelow = window.innerHeight - triggerRect.bottom - gap - padding;
  const spaceAbove = triggerRect.top - gap - padding;
  const placeAbove = spaceBelow < height && spaceAbove > spaceBelow;
  const top = placeAbove
    ? Math.max(padding, triggerRect.top - height - gap)
    : Math.min(triggerRect.bottom + gap, window.innerHeight - height - padding);
  picker.style.left = `${left}px`;
  picker.style.top = `${Math.max(padding, top)}px`;
  picker.style.transformOrigin = placeAbove ? "24px 100%" : "24px 0%";
  picker.style.setProperty("--motion-enter-y", placeAbove ? "5px" : "-5px");
}

function setColorPickerState(picker, color) {
  const hsv = rgbToHsv(color);
  picker._colorState = { ...hsv, a: clampAlpha(color.a) };
  renderColorPickerState(picker);
}

function getColorPickerColor(picker) {
  const state = picker._colorState || { h: 0, s: 0, v: 0, a: 1 };
  return { ...hsvToRgb(state.h, state.s, state.v), a: state.a };
}

function renderColorPickerState(picker) {
  if (!picker._colorState) return;
  const state = picker._colorState;
  const color = getColorPickerColor(picker);
  picker.style.setProperty("--picker-hue", `${state.h}`);
  picker.style.setProperty("--picker-rgb", `${clampColorChannel(color.r)}, ${clampColorChannel(color.g)}, ${clampColorChannel(color.b)}`);
  const thumb = $("[data-color-sv-thumb]", picker);
  if (thumb) {
    thumb.style.left = `${state.s * 100}%`;
    thumb.style.top = `${(1 - state.v) * 100}%`;
  }
  const hue = $("[data-color-hue]", picker);
  if (hue) hue.value = String(Math.round(state.h));
  const alpha = $("[data-color-alpha]", picker);
  if (alpha) alpha.value = String(Math.round(state.a * 100));
  const format = picker.dataset.colorFormat || "hex";
  const formatLabel = $("[data-color-format-label]", picker);
  if (formatLabel) formatLabel.textContent = format.toUpperCase();
  $all("[data-color-format-option]", picker).forEach((option) => {
    option.classList.toggle("selected", option.dataset.colorFormatOption === format);
  });
  const formatValue = $("[data-color-format-value]", picker);
  if (formatValue && document.activeElement !== formatValue) formatValue.value = formatPickerColor(color, format);
}

function applyColorPickerState(picker) {
  const color = getColorPickerColor(picker);
  const property = picker.dataset.colorPicker;
  const input = $(`[data-quick-prop="${property}"]`, els.popup);
  const trigger = $(`[data-color-for="${property}"]`, els.popup);
  if (input) input.value = rgbaToHex(color, color.a < 1);
  if (trigger) updateColorTrigger(trigger, color);
  readQuickControls();
  applyQuickPreview();
  renderColorPickerState(picker);
}

function updateColorTrigger(trigger, value) {
  const color = typeof value === "string" ? parseColorValue(value) : value;
  if (!color) return;
  const chip = $(".quick-color-chip", trigger);
  if (chip) chip.style.background = rgbaToCss(color);
  trigger.title = rgbaToHex(color, color.a < 1);
}

function syncColorSwatch(control) {
  const property = control.dataset.quickProp;
  const field = quickField(property);
  if (field?.type !== "color") return;
  const trigger = $(`[data-color-for="${property}"]`, els.popup);
  if (!trigger) return;
  const color = parseColorValue(control.value);
  if (!color) return;
  updateColorTrigger(trigger, color);
  const picker = $(`[data-color-picker="${property}"]`, els.popup);
  if (picker?.classList.contains("is-open")) setColorPickerState(picker, color);
}

function normalizeQuickColorControl(control) {
  const field = quickField(control.dataset.quickProp);
  if (field?.type !== "color") return;
  const normalized = normalizeHexColor(control.value);
  const color = parseColorValue(normalized || control.value);
  if (!color) return;
  control.value = rgbaToHex(color, color.a < 1);
  syncColorSwatch(control);
}

function syncLinkedSpacing(sourceControl, force = false) {
  const draft = state.pending?.quickDraft;
  const property = sourceControl.dataset.quickProp;
  if (!draft) return;
  const group = Object.values(SPACING_GROUPS).find((group) => group.props.includes(property));
  if (!group) return;
  if (!draft[group.linkedKey] && !force) return;
  group.props.forEach((spacingProperty) => {
    const control = $(`[data-quick-prop="${spacingProperty}"]`, els.popup);
    if (!control || control === sourceControl) return;
    control.value = sourceControl.value;
    control.dataset.quickUnit = sourceControl.dataset.quickUnit || "px";
  });
}

function handleQuickNumberKeydown(event, control) {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  const property = control.dataset.quickProp;
  const field = quickField(property);
  if (!field || (field.type !== "length" && field.type !== "number")) return;
  event.preventDefault();
  const direction = event.key === "ArrowUp" ? 1 : -1;
  const step = quickKeyboardStep(property, field, event.shiftKey);
  setQuickNumericControl(control, Number.parseFloat(control.value || "0") + direction * step, field);
}

function quickKeyboardStep(property, field, boosted = false) {
  if (property === "opacity") return boosted ? 0.1 : 0.01;
  if (property === "fontWeight") return boosted ? 100 : 10;
  return boosted ? 10 : 1;
}

function quickScrubStep(property) {
  if (property === "opacity") return 0.005;
  if (property === "fontWeight") return 2;
  return 0.5;
}

function setQuickNumericControl(control, value, field) {
  const next = clampNumber(value, field.min, field.max);
  control.value = trimNumber(next);
  syncLinkedSpacing(control);
  readQuickControls();
  applyQuickPreview();
}

function bindQuickScrubControls() {
  $all("[data-scrub-for]", els.popup).forEach((handle) => {
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target.closest("input, button, [data-font-select]")) return;
      const property = handle.dataset.scrubFor;
      const field = quickField(property);
      if (!field || (field.type !== "length" && field.type !== "number")) return;
      const control = $(`[data-quick-prop="${property}"]`, els.popup);
      if (!control) return;

      event.preventDefault();
      const startX = event.clientX;
      const startValue = Number.parseFloat(control.value || "0") || 0;
      const step = quickScrubStep(property);
      document.body.classList.add("quick-scrubbing");

      const onMove = (moveEvent) => {
        const next = startValue + (moveEvent.clientX - startX) * step;
        setQuickNumericControl(control, next, field);
      };
      const onEnd = () => {
        document.body.classList.remove("quick-scrubbing");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd, { once: true });
    });
  });
}

function shakePopup() {
  els.popup.classList.remove("shake");
  void els.popup.offsetWidth;
  els.popup.classList.add("shake");
}

function finishPendingPopupClose() {
  els.popup.hidden = true;
  els.popup._exitAnimation = null;
  els.popup.style.removeProperty("opacity");
  els.popup.style.removeProperty("pointer-events");
  els.popup.style.removeProperty("transform");
  setPopupBackgroundInert(false);
  const returnTarget = popupReturnFocus;
  popupReturnFocus = null;
  restoreFocus(returnTarget);
}

function hidePendingPopup() {
  closeQuickMenus();
  closeQuickColorPickers();
  if (els.popup.hidden) return;
  els.popup._exitAnimation?.cancel();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof els.popup.animate !== "function") {
    finishPendingPopupClose();
    return;
  }
  els.popup.style.pointerEvents = "none";
  const animation = els.popup.animate([
    { opacity: 1, transform: "translateX(-50%) translateY(0) scale(1)" },
    { opacity: 0, transform: "translateX(-50%) translateY(3px) scale(0.985)" },
  ], {
    duration: 130,
    easing: "cubic-bezier(0.4, 0, 1, 1)",
    fill: "forwards",
  });
  els.popup._exitAnimation = animation;
  animation.finished.catch(() => {}).then(() => {
    if (els.popup._exitAnimation !== animation) return;
    finishPendingPopupClose();
  });
}

function cancelPending() {
  resetQuickPreview();
  hidePopupActionTooltip();
  state.pending = null;
  state.editingId = null;
  clearHoverTarget();
  hidePendingPopup();
  els.popup.classList.remove("quick-open");
  hideHighlight();
  render();
}

function deleteEditingAnnotation() {
  const id = state.editingId;
  if (!id) return;
  const index = state.annotations.findIndex((annotation) => annotation.id === id);
  const deleted = state.annotations[index];
  if (!deleted) return;
  resetQuickPreview();
  state.annotations = state.annotations.filter((annotation) => annotation.id !== id);
  state.pending = null;
  state.editingId = null;
  if (state.selectedId === id) state.selectedId = null;
  state.contextOpenId = null;
  state.panelMode = "list";
  clearHoverTarget();
  hidePopupActionTooltip();
  hidePendingPopup();
  els.popup.classList.remove("quick-open");
  hideHighlight();
  persist();
  render();
  showToast("已删除标注", {
    actionLabel: "撤销",
    onAction: () => restoreDeletedAnnotation(deleted, index),
  });
}

async function addPending() {
  if (!state.pending) return;
  const textarea = $(".popup-textarea", els.popup);
  const comment = textarea.value.trim();
  readQuickControls();
  applyQuickPreview();
  const changeSet = buildChangeSet(state.pending);
  if (!comment && !changeSet) {
    shakePopup();
    return;
  }
  const finalComment = comment || `快捷调整：${changeSet.summary}`;
  const target = getTargetByNodeId(state.pending.targetNodeId) || getAnnotationTarget(state.pending);
  const editingId = state.editingId;

  if (editingId) {
    const index = state.annotations.findIndex((annotation) => annotation.id === editingId);
    const existing = state.annotations[index];
    if (!existing) return cancelPending();
    const thread = (existing.thread || []).map((item) => ({ ...item }));
    const firstHumanIndex = thread.findIndex((item) => item.role === "human");
    if (firstHumanIndex >= 0) {
      thread[firstHumanIndex] = { ...thread[firstHumanIndex], content: finalComment, editedAt: Date.now() };
    } else {
      thread.unshift({ role: "human", content: finalComment, timestamp: Date.now() });
    }
    const updatedAnnotation = {
      ...existing,
      ...state.pending,
      comment: finalComment,
      changeSet: changeSet || existing.changeSet,
      styleSnapshot: target ? collectStyleSnapshot(target) : state.pending.styleSnapshot,
      thread,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    delete updatedAnnotation.quickDraft;
    state.annotations[index] = updatedAnnotation;
    state.pending = null;
    state.editingId = null;
    state.selectedId = updatedAnnotation.id;
    state.panelOpen = false;
    hidePopupActionTooltip();
    hidePendingPopup();
    els.popup.classList.remove("quick-open");
    hideHighlight();
    persist();
    render();
    const copied = await copyAnnotation(updatedAnnotation.id, false);
    showToast(copied
      ? "标注已更新，结构化信息已复制"
      : "标注已更新，自动复制失败");
    return;
  }

  const newAnnotation = {
    ...state.pending,
    comment: finalComment,
    changeSet,
    styleSnapshot: target ? collectStyleSnapshot(target) : state.pending.styleSnapshot,
    thread: [
      {
        role: "human",
        content: finalComment,
        timestamp: Date.now(),
      },
    ],
    createdAt: new Date().toISOString(),
  };
  delete newAnnotation.quickDraft;

  state.annotations.push(newAnnotation);
  state.pending = null;
  state.editingId = null;
  state.selectedId = newAnnotation.id;
  state.panelOpen = false;
  state.panelMode = "detail";
  hidePopupActionTooltip();
  hidePendingPopup();
  els.popup.classList.remove("quick-open");
  hideHighlight();
  window.getSelection()?.removeAllRanges();
  persist();
  render();
  const copied = await copyAnnotation(newAnnotation.id, false);
  showToast(copied
    ? "标注已添加，结构化信息已复制"
    : "标注已添加，自动复制失败");
}

function selectAnnotation(id, openPanel = false) {
  if (state.selectedId !== id) {
    state.contextOpenId = null;
  }
  state.selectedId = id;
  state.panelMode = "detail";
  if (openPanel) state.panelOpen = true;
  const annotation = findAnnotation(id);
  if (annotation) {
    showStoredOutline(annotation);
    const target = getAnnotationTarget(annotation);
    if (target) target.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  render();
}

function findAnnotation(id) {
  return state.annotations.find((annotation) => annotation.id === id);
}

function restoreDeletedAnnotation(annotation, index) {
  if (findAnnotation(annotation.id)) return;
  state.annotations.splice(Math.min(index, state.annotations.length), 0, annotation);
  state.selectedId = annotation.id;
  state.panelMode = "detail";
  persist();
  render();
  showToast("已恢复标注");
}

function statusLabel(status) {
  return {
    pending: "待处理",
    processing: "处理中",
    ready: "待验证",
    acknowledged: "待验证",
    resolved: "已解决",
    dismissed: "已忽略",
  }[status] || status;
}

function messageRoleLabel(role) {
  return {
    agent: "智能体",
    system: "系统",
    human: "用户",
  }[role] || "用户";
}

function renderPanel() {
  if (!state.panelOpen) {
    hideCommentPanel();
    return;
  }
  showCommentPanel();

  if (state.panelMode === "output") {
    els.panelTitle.textContent = "全部标注结构化信息";
    els.panelBody.innerHTML = `
      <div class="detail-card">
        <button class="detail-back" type="button" data-action="list"><i class="ri-arrow-left-line" aria-hidden="true"></i>返回评论列表</button>
        <textarea class="output-box" name="annotation-output" aria-label="全部标注结构化信息" readonly>${escapeHtml(state.outputPreview)}</textarea>
        <div class="panel-actions">
          <button class="panel-button primary" type="button" data-action="copy-again">再次复制全部</button>
        </div>
      </div>
    `;
    bindPanelActions();
    return;
  }

  if (state.panelMode === "detail" && state.selectedId) {
    const annotation = findAnnotation(state.selectedId);
    if (annotation) {
      renderDetail(annotation);
      return;
    }
  }

  renderList();
}

function showCommentPanel() {
  if (!els.panel.hidden && els.panel.classList.contains("is-open") && !els.panel.classList.contains("is-closing")) return;
  panelTransitionToken += 1;
  window.clearTimeout(panelHideTimer);
  els.panel.style.removeProperty("opacity");
  els.panel.style.removeProperty("pointer-events");
  els.panel.style.removeProperty("transform");
  els.panel.hidden = false;
  els.panel.classList.remove("is-closing");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.panel.classList.add("is-open");
    return;
  }
  const token = panelTransitionToken;
  requestAnimationFrame(() => {
    if (token !== panelTransitionToken || !state.panelOpen) return;
    els.panel.classList.add("is-open");
  });
}

function hideCommentPanel() {
  if (els.panel.hidden || els.panel.classList.contains("is-closing")) return;
  panelTransitionToken += 1;
  window.clearTimeout(panelHideTimer);
  els.panel.classList.remove("is-open");
  els.panel.classList.add("is-closing");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishCommentPanelClose(panelTransitionToken);
    return;
  }
  const token = panelTransitionToken;
  panelHideTimer = window.setTimeout(() => finishCommentPanelClose(token), 170);
}

function finishCommentPanelClose(token) {
  if (token !== panelTransitionToken || state.panelOpen) return;
  els.panel.hidden = true;
  els.panel.classList.remove("is-open", "is-closing");
  panelHideTimer = 0;
}

function renderList() {
  els.panelTitle.textContent = "评论记录";
  if (!state.annotations.length) {
    els.panelBody.innerHTML = `
      <div class="empty-state">
        还没有标注。打开标注模式，悬停界面元素，点击后写下一条聚焦评论。
      </div>
    `;
    return;
  }

  const sendableCount = state.annotations.filter((annotation) => annotation.status === "pending").length;
  const flowNote = "支持单条或批量复制，适配任意 Agent。";
  const primaryLabel = `复制 ${sendableCount} 条待处理留言`;
  els.panelBody.innerHTML = `
    <div class="agent-flow-note">
      <i class="ri-file-copy-line" aria-hidden="true"></i>
      <span>${escapeHtml(flowNote)}</span>
    </div>
    <div class="annotation-list">
      ${state.annotations
        .map((annotation, index) => `
          <button class="annotation-list-item${annotation.id === state.selectedId ? " selected" : ""}" type="button" data-id="${annotation.id}">
            <div class="item-topline">
              <span class="item-name">${index + 1}. ${escapeHtml(annotation.element)}</span>
              <span class="status ${annotation.status}">${escapeHtml(statusLabel(annotation.status))}</span>
            </div>
            <p class="item-comment">${escapeHtml(annotation.comment)}</p>
            ${annotation.changeSet ? `<div class="item-change"><i class="ri-equalizer-3-line" aria-hidden="true"></i>${escapeHtml(annotation.changeSet.summary)}</div>` : ""}
            <div class="item-meta">${escapeHtml(annotation.selector)} | ${escapeHtml(annotation.sourceFile)}</div>
          </button>
        `)
        .join("")}
    </div>
    <div class="panel-actions panel-sticky-actions">
      <button class="panel-button primary" type="button" data-action="send-all" ${sendableCount ? "" : "disabled"}>
        ${sendableCount ? escapeHtml(primaryLabel) : "暂无待处理留言"}
      </button>
      <button class="panel-button" type="button" data-action="copy">复制全部留言（含已解决）</button>
    </div>
  `;

  $all(".annotation-list-item", els.panelBody).forEach((button) => {
    button.addEventListener("click", () => selectAnnotation(button.dataset.id, true));
  });
  bindPanelActions();
}

function renderDetail(annotation) {
  const contextOpen = state.contextOpenId === annotation.id;
  els.panelTitle.textContent = "评论记录";
  els.panelBody.innerHTML = `
    <div class="detail-card">
      <button class="detail-back" type="button" data-action="list"><i class="ri-arrow-left-line" aria-hidden="true"></i>返回全部评论</button>
      <div>
        <div class="detail-topline">
          <span class="item-name">${escapeHtml(annotation.element)}</span>
          <span class="status ${annotation.status}">${escapeHtml(statusLabel(annotation.status))}</span>
        </div>
        <div class="detail-meta">${escapeHtml(annotation.selector)} | ${escapeHtml(annotation.sourceFile)}</div>
      </div>
      ${renderChangeSet(annotation)}
      <div class="thread">
        ${annotation.thread
          .map((message) => `
            <article class="thread-message ${message.role}">
              <div class="message-role">
                <span>${messageRoleLabel(message.role)}</span>
                <span>${formatTime(message.timestamp)}</span>
              </div>
              <div class="message-content">${escapeHtml(message.content)}</div>
            </article>
          `)
          .join("")}
      </div>
      <div class="detail-main-actions">
        ${annotation.status === "pending" ? `
          <button class="panel-button primary" type="button" data-action="send-one">
            复制此留言
          </button>
          <button class="panel-button blue" type="button" data-action="resolve">标记解决</button>
        ` : ""}
        ${annotation.status === "resolved" ? `<button class="panel-button blue" type="button" data-action="resolve">重新打开</button>` : ""}
        ${annotation.status !== "pending" ? `<button class="panel-button" type="button" data-action="copy-one">复制结构化信息</button>` : ""}
        <button class="panel-button" type="button" data-action="toggle-context" aria-expanded="${contextOpen}">
          补充上下文
        </button>
        <button class="panel-button danger" type="button" data-action="delete">删除</button>
      </div>
      <div class="context-box" ${contextOpen ? "" : "hidden"}>
        <textarea name="annotation-reply" aria-label="补充标注上下文" autocomplete="off" placeholder="补充约束、验收标准，或回答智能体的追问…" id="reply-text"></textarea>
        <div class="panel-actions">
          <button class="panel-button primary" type="button" data-action="reply">添加补充</button>
        </div>
      </div>
    </div>
  `;
  bindPanelActions();
}

function renderChangeSet(annotation) {
  if (!annotation.changeSet) return "";
  const items = [];
  if (annotation.changeSet.text) {
    items.push(`
      <li>
        <span>文本</span>
        <strong>${escapeHtml(annotation.changeSet.text.from || "空")} -> ${escapeHtml(annotation.changeSet.text.to || "空")}</strong>
      </li>
    `);
  }
  annotation.changeSet.properties.forEach((item) => {
    items.push(`
      <li>
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.from || "空")} -> ${escapeHtml(item.to || "空")}</strong>
      </li>
    `);
  });
  return `
    <div class="change-card">
      <div class="change-card-title">
        <i class="ri-equalizer-3-line" aria-hidden="true"></i>
        <span>快捷修改</span>
        <em>仅预览 / mock 记录</em>
      </div>
      <ul>${items.join("")}</ul>
    </div>
  `;
}

function bindPanelActions() {
  $all("[data-action]", els.panelBody).forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "list") {
        state.panelMode = "list";
        state.selectedId = null;
        state.contextOpenId = null;
        hideHighlight();
      }
      if (action === "toggle-context") {
        state.contextOpenId = state.contextOpenId === state.selectedId ? null : state.selectedId;
      }
      if (action === "copy") copyMarkdown();
      if (action === "copy-again") copyMarkdown(false);
      if (action === "copy-one") copyAnnotation(state.selectedId);
      if (action === "send-all") sendAnnotations();
      if (action === "send-one") sendAnnotations(state.selectedId);
      if (action === "reply") addReply();
      if (action === "resolve") toggleResolve();
      if (action === "delete") deleteSelected();
      render();
    });
  });
}

function addReply() {
  const annotation = findAnnotation(state.selectedId);
  const textarea = $("#reply-text");
  const text = textarea?.value.trim();
  if (!annotation || !text) return;
  annotation.thread.push({ role: "human", content: text, timestamp: Date.now() });
  const needsResend = annotation.status !== "pending";
  if (needsResend) annotation.status = "pending";
  state.contextOpenId = null;
  persist();
  showToast(needsResend ? "已补充上下文，请再次复制" : "已补充上下文");
}

function toggleResolve() {
  const annotation = findAnnotation(state.selectedId);
  if (!annotation) return;
  annotation.status = annotation.status === "resolved" ? "pending" : "resolved";
  annotation.thread.push({
    role: "system",
    content: annotation.status === "resolved"
      ? "用户已验证结果并将这条标注标记为已解决。"
      : "这条标注已重新打开，可以补充后再次复制给 Agent。",
    timestamp: Date.now(),
  });
  persist();
  showToast(annotation.status === "resolved" ? "已标记解决" : "已重新打开");
}

function deleteSelected() {
  if (!state.selectedId) return;
  const id = state.selectedId;
  const index = state.annotations.findIndex((annotation) => annotation.id === id);
  const deleted = state.annotations[index];
  if (!deleted) return;
  state.annotations = state.annotations.filter((annotation) => annotation.id !== id);
  state.selectedId = null;
  state.contextOpenId = null;
  state.panelMode = "list";
  persist();
  hideHighlight();
  showToast("已删除标注", {
    actionLabel: "撤销",
    onAction: () => restoreDeletedAnnotation(deleted, index),
  });
}

async function sendAnnotations(id = null) {
  const targets = id
    ? state.annotations.filter((annotation) => annotation.id === id && annotation.status === "pending")
    : state.annotations.filter((annotation) => annotation.status === "pending");
  if (!targets.length) {
    showToast("没有待发送的标注");
    return;
  }

  if (!agentDeliveryReady()) {
    const markdown = generateAnnotationsMarkdown(targets);
    const copied = await writeClipboard(markdown);
    state.panelOpen = true;
    showToast(copied
      ? `${targets.length} 条留言已复制，可粘贴给任意 Agent`
      : "复制失败，请使用结构化信息预览");
    render();
    return;
  }

  const targetIds = targets.map((annotation) => annotation.id);
  targets.forEach((annotation) => {
    annotation.status = "processing";
    annotation.thread.push({
      role: "agent",
      content: `${agentLabel()} 已在 ${state.binding.projectLabel} 项目接收任务，正在通过 ${annotation.selector} 定位目标，并检查 ${annotation.sourceFile}。`,
      timestamp: Date.now(),
    });
  });
  persist();
  state.panelOpen = true;
  showToast(`已发送 ${targets.length} 条给 ${agentLabel()}`);
  render();

  window.setTimeout(() => completeAgentWork(targetIds), 900);
}

function completeAgentWork(ids) {
  let completed = 0;
  ids.forEach((id) => {
    const annotation = findAnnotation(id);
    if (!annotation || annotation.status !== "processing") return;
    annotation.status = "ready";
    const result = annotation.changeSet
      ? `${agentLabel()} 已完成模拟处理：${annotation.changeSet.summary}。请回到页面验证实际效果。`
      : `${agentLabel()} 已完成模拟处理，并生成了针对 ${annotation.element} 的局部修改摘要。请回到页面验证实际效果。`;
    annotation.thread.push({
      role: "agent",
      content: result,
      timestamp: Date.now(),
    });
    completed += 1;
  });
  if (!completed) return;
  persist();
  render();
  showToast(`${completed} 条标注已进入待验证`);
}

async function copyMarkdown(openPreview = true) {
  const markdown = generateMarkdown();
  state.outputPreview = markdown;

  const copied = await writeClipboard(markdown);
  if (copied) {
    showCopySuccessFeedback();
    showToast("已复制全部标注信息");
  } else {
    resetCopySuccessFeedback();
    showToast("已打开全部标注预览，可从面板复制");
  }

  if (openPreview) {
    state.panelOpen = true;
    state.panelMode = "output";
  }
  render();
}

function showCopySuccessFeedback() {
  window.clearTimeout(copyFeedbackTimer);
  els.copyOutput.classList.add("copy-succeeded");
  els.copyOutput.dataset.tooltip = "已复制全部标注信息";
  els.copyOutput.setAttribute("aria-label", "已复制全部标注信息");
  copyFeedbackTimer = window.setTimeout(resetCopySuccessFeedback, 1000);
}

function resetCopySuccessFeedback() {
  window.clearTimeout(copyFeedbackTimer);
  copyFeedbackTimer = 0;
  els.copyOutput.classList.remove("copy-succeeded");
  els.copyOutput.dataset.tooltip = "复制全部标注信息";
  els.copyOutput.setAttribute("aria-label", "复制全部标注信息");
}

async function copyAnnotation(id, announce = true) {
  const annotation = findAnnotation(id);
  if (!annotation) {
    if (announce) showToast("没有可复制的标注");
    return false;
  }
  const copied = await writeClipboard(generateAnnotationMarkdown(annotation));
  if (announce) {
    showToast(copied ? "此标注已复制，可粘贴给 Agent" : "复制失败，请重试");
  }
  return copied;
}

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the local selection fallback.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  Object.assign(textarea.style, {
    position: "fixed",
    top: "-9999px",
    opacity: "0",
  });
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
}

function appendAnnotationMarkdown(lines, annotation, index = 1) {
  lines.push(`### ${index}. ${annotation.element}`);
  lines.push(`**状态：** ${statusLabel(annotation.status)}`);
  lines.push(`**位置：** ${annotation.elementPath}`);
  lines.push(`**选择器：** \`${annotation.selector}\``);
  lines.push(`**源码：** ${annotation.sourceFile}`);
  lines.push(`**组件：** ${annotation.component}`);
  lines.push(`**视觉边界：** ${Math.round(annotation.boundingBox.x)}px, ${Math.round(annotation.boundingBox.y)}px (${Math.round(annotation.boundingBox.width)}x${Math.round(annotation.boundingBox.height)}px)`);
  if (annotation.selectedText) lines.push(`**选中文本：** "${annotation.selectedText}"`);
  lines.push(`**反馈：** ${annotation.comment}`);
  if (annotation.changeSet) {
    lines.push("**快捷修改：**");
    if (annotation.changeSet.text) {
      lines.push(`- 文本：${annotation.changeSet.text.from || "空"} -> ${annotation.changeSet.text.to || "空"}`);
    }
    annotation.changeSet.properties.forEach((item) => {
      lines.push(`- ${item.cssProperty}：${item.from || "空"} -> ${item.to || "空"}`);
    });
    lines.push("- 约束：这是页面预览生成的修改意图，请在代码里做局部实现，不要直接照搬 inline style。");
  }
  if (annotation.thread.length > 1) {
    lines.push("**线程：**");
    annotation.thread.forEach((message) => {
      lines.push(`- ${messageRoleLabel(message.role)}：${message.content}`);
    });
  }
  lines.push("");
}

function generateAnnotationMarkdown(annotation) {
  const lines = [
    `## 单条页面反馈：${window.location.pathname}${window.location.hash}`,
    `**视口：** ${window.innerWidth}x${window.innerHeight}`,
    "",
  ];
  appendAnnotationMarkdown(lines, annotation, 1);
  return lines.join("\n").trim();
}

function generateAnnotationsMarkdown(annotations) {
  if (annotations.length === 1) return generateAnnotationMarkdown(annotations[0]);
  const lines = [
    `## 页面反馈：${window.location.pathname}${window.location.hash}`,
    `**视口：** ${window.innerWidth}x${window.innerHeight}`,
    "",
  ];
  annotations.forEach((annotation, index) => appendAnnotationMarkdown(lines, annotation, index + 1));
  return lines.join("\n").trim();
}

function generateMarkdown() {
  const viewport = `${window.innerWidth}x${window.innerHeight}`;
  if (!state.annotations.length) {
    return `## 页面反馈：${window.location.pathname}\n\n暂无标注。`;
  }

  const lines = [
    `## 页面反馈：${window.location.pathname}${window.location.hash}`,
    `**视口：** ${viewport}`,
    "",
  ];

  state.annotations.forEach((annotation, index) => {
    appendAnnotationMarkdown(lines, annotation, index + 1);
  });

  return lines.join("\n").trim();
}

function clearToastAction() {
  showToast.onAction = null;
}

function showToast(message, { actionLabel = "", onAction = null } = {}) {
  els.toast._enterAnimation?.cancel();
  els.toast._enterAnimation = null;
  els.toast._exitAnimation?.cancel();
  els.toast._exitAnimation = null;
  els.toast.style.removeProperty("opacity");
  els.toast.style.removeProperty("transform");
  clearToastAction();
  const label = document.createElement("span");
  label.className = "toast-message";
  label.textContent = message;
  els.toast.replaceChildren(label);
  if (actionLabel && typeof onAction === "function") {
    const action = document.createElement("button");
    action.type = "button";
    action.className = "toast-action";
    action.textContent = actionLabel;
    showToast.onAction = onAction;
    action.addEventListener("click", () => {
      const callback = showToast.onAction;
      hideToast(true);
      callback?.();
    });
    els.toast.appendChild(action);
  }
  els.toast.hidden = false;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && typeof els.toast.animate === "function") {
    const animation = els.toast.animate([
      { opacity: 0, transform: "translateX(-50%) translateY(8px)" },
      { opacity: 1, transform: "translateX(-50%) translateY(0)" },
    ], {
      duration: 180,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    });
    els.toast._enterAnimation = animation;
    animation.finished.catch(() => {}).then(() => {
      if (els.toast._enterAnimation !== animation) return;
      animation.cancel();
      els.toast._enterAnimation = null;
      els.toast.style.removeProperty("opacity");
      els.toast.style.removeProperty("transform");
    });
  }
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    hideToast();
  }, onAction ? 5000 : 1800);
}

function hideToast(immediate = false) {
  if (els.toast.hidden) return;
  clearTimeout(showToast.timer);
  els.toast._enterAnimation?.cancel();
  els.toast._enterAnimation = null;
  if (immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof els.toast.animate !== "function") {
    els.toast.hidden = true;
    clearToastAction();
    return;
  }
  const animation = els.toast.animate([
    { opacity: 1, transform: "translateX(-50%) translateY(0)" },
    { opacity: 0, transform: "translateX(-50%) translateY(4px)" },
  ], {
    duration: 120,
    easing: "cubic-bezier(0.4, 0, 1, 1)",
    fill: "forwards",
  });
  els.toast._exitAnimation = animation;
  animation.finished.catch(() => {}).then(() => {
    if (els.toast._exitAnimation !== animation) return;
    animation.cancel();
    els.toast.hidden = true;
    els.toast._exitAnimation = null;
    els.toast.style.removeProperty("opacity");
    els.toast.style.removeProperty("transform");
    clearToastAction();
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function formatTime(value) {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function wireEvents() {
  els.toolbarToggle.addEventListener("click", () => {
    const nextExpanded = !state.toolbarExpanded;
    if (state.pending) cancelPending();
    state.toolbarExpanded = nextExpanded;
    if (state.toolbarExpanded) {
      state.annotationActive = true;
    } else {
      state.annotationActive = false;
      state.connectionOpen = false;
      clearHoverTarget();
      cancelPending();
      hideHighlight();
    }
    render();
  });

  els.annotateToggle.addEventListener("click", () => {
    state.annotationActive = !state.annotationActive;
    if (!state.annotationActive) {
      clearHoverTarget();
      cancelPending();
      hideHighlight();
    }
    render();
  });

  els.visibilityToggle.addEventListener("click", () => {
    state.annotationsVisible = !state.annotationsVisible;
    hideHighlight();
    render();
  });

  els.panelToggle.addEventListener("click", () => {
    if (state.pending) cancelPending();
    state.panelOpen = !state.panelOpen;
    if (state.panelOpen) state.connectionOpen = false;
    state.panelMode = state.selectedId ? "detail" : "list";
    render();
  });

  els.connectionToggle.addEventListener("click", () => {
    if (state.pending) cancelPending();
    state.connectionOpen = !state.connectionOpen;
    if (state.connectionOpen) state.panelOpen = false;
    render();
  });

  els.copyOutput.addEventListener("click", () => copyMarkdown());
  els.clearAnnotations.addEventListener("click", () => {
    if (!state.annotations.length) return showToast("没有可清空的标注");
    const cleared = [...state.annotations];
    state.annotations = [];
    state.selectedId = null;
    state.panelMode = "list";
    persist();
    hideHighlight();
    showToast("已清空全部标注", {
      actionLabel: "撤销",
      onAction: () => {
        const currentIds = new Set(state.annotations.map((annotation) => annotation.id));
        state.annotations = [
          ...cleared.filter((annotation) => !currentIds.has(annotation.id)),
          ...state.annotations,
        ];
        persist();
        render();
        showToast("已恢复全部标注");
      },
    });
    render();
  });

  els.closePanel.addEventListener("click", () => {
    state.panelOpen = false;
    state.contextOpenId = null;
    render();
  });

  els.closeConnection.addEventListener("click", () => {
    state.connectionOpen = false;
    render();
  });

  document.addEventListener("mousemove", updateHover, true);
  document.addEventListener("click", (event) => {
    const target = event.target;
    const clickedPanel = target.closest("#comment-panel");
    const clickedConnection = target.closest("#connection-panel");
    const clickedToolbar = target.closest("#agent-toolbar");
    const clickedMarker = target.closest(".annotation-marker");
    const clickedPopup = target.closest("#annotation-popup");
    const clickedToast = target.closest(".toast");

    if (state.connectionOpen && !clickedConnection && !clickedToolbar && !clickedToast) {
      state.connectionOpen = false;
      render();
      if (state.annotationActive) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }

    if (state.panelOpen && !clickedPanel && !clickedToolbar && !clickedMarker && !clickedPopup && !clickedToast) {
      state.panelOpen = false;
      state.contextOpenId = null;
      render();
      if (state.annotationActive) {
        event.preventDefault();
        event.stopPropagation();
        hideHighlight();
      }
      return;
    }

    if (!state.annotationActive) return;
    if (target.closest("[data-feedback-toolbar], .toast")) return;
    event.preventDefault();
    event.stopPropagation();
    if (state.pending) {
      shakePopup();
      return;
    }
    beginAnnotation(event);
  }, true);

  document.addEventListener("keydown", (event) => {
    if (!els.modal.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        toggleModal(false);
        return;
      }
      if (trapFocusWithin(els.modal, event)) return;
    }
    if (!els.popup.hidden && trapFocusWithin(els.popup, event)) return;
    if (event.key === "Escape") {
      if (closeQuickColorPickers()) {
        event.preventDefault();
        return;
      }
      if (state.pending) cancelPending();
      else if (state.connectionOpen) {
        state.connectionOpen = false;
        render();
      }
      else if (state.panelOpen) {
        state.panelOpen = false;
        state.contextOpenId = null;
        render();
      } else if (state.annotationActive) {
        state.annotationActive = false;
        clearHoverTarget();
        hideHighlight();
        render();
      }
    }
    if (event.key.toLowerCase() === "c" && state.annotationActive && !state.pending) {
      copyMarkdown();
    }
  });

  window.addEventListener("scroll", () => {
    if (state.pending) {
      showStoredOutline(state.pending);
    } else if (state.hoverTarget && state.annotationActive) {
      positionHighlight(state.hoverTarget.getBoundingClientRect());
    }
    renderMarkers();
  }, { passive: true });

  window.addEventListener("resize", () => {
    if (state.pending) {
      showStoredOutline(state.pending);
      requestAnimationFrame(fitPopupToViewport);
    }
    renderMarkers();
    hidePopupActionTooltip();
    closeQuickMenus();
    closeQuickColorPickers();
  }, { passive: true });

  $(".mobile-nav-toggle")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const links = $(".mobile-nav-links");
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    links.hidden = expanded;
  });

  $all("[data-copy-command]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyCommand);
        showToast("安装命令已复制");
      } catch {
        showToast(button.dataset.copyCommand);
      }
    });
  });

  $("#open-modal")?.addEventListener("click", () => toggleModal(true));
  $("#close-modal")?.addEventListener("click", () => toggleModal(false));
  $("#cancel-modal")?.addEventListener("click", () => toggleModal(false));
  $("#confirm-modal")?.addEventListener("click", () => toggleModal(false));
  els.modalOverlay.addEventListener("click", () => toggleModal(false));

  $("#open-shadow-modal")?.addEventListener("click", () => toggleShadowModal(true));
}

function toggleModal(open) {
  (els.modal._exitAnimations || []).forEach((animation) => animation.cancel());
  els.modal._exitAnimations = [];
  [els.modal, els.modalOverlay].forEach((element) => {
    element.style.removeProperty("opacity");
    element.style.removeProperty("pointer-events");
    element.style.removeProperty("transform");
  });
  if (open) {
    modalReturnFocus = document.activeElement;
    els.modal.hidden = false;
    els.modalOverlay.hidden = false;
    setModalBackgroundInert(true);
    assignNodeIds();
    requestAnimationFrame(() => $("#close-modal")?.focus({ preventScroll: true }));
    return;
  }
  if (els.modal.hidden) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof els.modal.animate !== "function") {
    finishModalClose();
    return;
  }
  els.modal.style.pointerEvents = "none";
  els.modalOverlay.style.pointerEvents = "none";
  const contentAnimation = els.modal.animate([
    { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
    { opacity: 0, transform: "translate(-50%, -50%) scale(0.985)" },
  ], { duration: 150, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" });
  const overlayAnimation = els.modalOverlay.animate([
    { opacity: 1 },
    { opacity: 0 },
  ], { duration: 130, easing: "ease", fill: "forwards" });
  const animations = [contentAnimation, overlayAnimation];
  els.modal._exitAnimations = animations;
  Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
    if (els.modal._exitAnimations !== animations) return;
    finishModalClose();
  });
}

function finishModalClose() {
  els.modal.hidden = true;
  els.modalOverlay.hidden = true;
  els.modal._exitAnimations = [];
  [els.modal, els.modalOverlay].forEach((element) => {
    element.style.removeProperty("opacity");
    element.style.removeProperty("pointer-events");
    element.style.removeProperty("transform");
  });
  setModalBackgroundInert(false);
  const returnTarget = modalReturnFocus;
  modalReturnFocus = null;
  restoreFocus(returnTarget);
}

function toggleShadowModal(open) {
  els.shadowHost.hidden = !open;
  if (!open) {
    els.shadowHost.innerHTML = "";
    return;
  }

  const root = els.shadowHost.shadowRoot || els.shadowHost.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      .overlay { position: fixed; inset: 0; background: rgba(255,255,255,.7); backdrop-filter: blur(4px); }
      .modal { position: fixed; inset: 50% auto auto 50%; transform: translate(-50%,-50%); width: min(390px, calc(100vw - 32px)); padding: 24px; border-radius: 16px; background: #fff; box-shadow: 0 18px 50px rgba(0,0,0,.14), 0 0 0 1px rgba(0,0,0,.06); font-family: system-ui, sans-serif; }
      h3 { margin: 0 0 12px; font-size: 16px; }
      p { margin: 0 0 14px; color: rgba(0,0,0,.62); font-size: 14px; line-height: 1.5; }
      button { min-height: 34px; padding: 0 14px; border: 0; border-radius: 8px; background: #6e56cf; color: #fff; font-weight: 650; cursor: pointer; }
    </style>
    <div class="overlay"></div>
    <section class="modal" data-label="隔离弹窗" data-source="src/components/ShadowDemo.tsx:16">
      <h3>隔离弹窗</h3>
      <p>这个弹窗渲染在隔离 DOM 容器里。打开标注模式后，原型仍然允许你直接点击它并创建评论。</p>
      <button type="button">知道了</button>
    </section>
  `;
  root.querySelector(".overlay").addEventListener("click", () => toggleShadowModal(false));
  root.querySelector("button").addEventListener("click", () => toggleShadowModal(false));
}

function initNavSpy() {
  const links = $all(".nav-link");
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  }, { rootMargin: "-20% 0px -70% 0px", threshold: [0.1, 0.25, 0.5] });

  sections.forEach((section) => observer.observe(section));
}

function init() {
  initElements();
  assignNodeIds();
  loadDeliverySettings();
  loadAnnotations();
  wireEvents();
  initNavSpy();
  render();
}

document.addEventListener("DOMContentLoaded", init);
