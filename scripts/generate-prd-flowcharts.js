const fs = require("fs");
const path = require("path");

const outDir = path.resolve(__dirname, "../assets/prd-flowcharts");
fs.mkdirSync(outDir, { recursive: true });

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars = 10) {
  const parts = [];
  let line = "";
  for (const char of text) {
    const next = line + char;
    const asciiPenalty = /[A-Za-z0-9/]/.test(char) ? 0.55 : 1;
    const currentLen = Array.from(next).reduce((sum, c) => sum + (/[A-Za-z0-9/]/.test(c) ? 0.55 : 1), 0);
    if (currentLen > maxChars && line) {
      parts.push(line);
      line = char;
    } else {
      line = next;
    }
  }
  if (line) parts.push(line);
  return parts;
}

function markerDefs() {
  return `
  <defs>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto" markerUnits="strokeWidth">
      <path d="M2,2 L10,6 L2,10 Z" fill="#344054"/>
    </marker>
  </defs>`;
}

function nodeSvg(node) {
  const lines = wrapText(node.label, node.maxChars || 10);
  const isDecision = node.type === "decision";
  const fill = node.fill || "#ffffff";
  const stroke = node.stroke || "#98A2B3";
  const textY = node.y - ((lines.length - 1) * 11);
  const text = lines.map((line, i) => `<text x="${node.x}" y="${textY + i * 24}" text-anchor="middle" class="label">${escapeXml(line)}</text>`).join("");
  if (isDecision) {
    const points = [
      `${node.x},${node.y - node.h / 2}`,
      `${node.x + node.w / 2},${node.y}`,
      `${node.x},${node.y + node.h / 2}`,
      `${node.x - node.w / 2},${node.y}`
    ].join(" ");
    return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${text}`;
  }
  return `<rect x="${node.x - node.w / 2}" y="${node.y - node.h / 2}" width="${node.w}" height="${node.h}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${text}`;
}

function edgeSvg(edge, nodes) {
  const from = nodes[edge.from];
  const to = nodes[edge.to];
  let x1 = from.x;
  let y1 = from.y;
  let x2 = to.x;
  let y2 = to.y;
  if (Math.abs(to.x - from.x) >= Math.abs(to.y - from.y)) {
    x1 = from.x + Math.sign(to.x - from.x) * from.w / 2;
    x2 = to.x - Math.sign(to.x - from.x) * to.w / 2;
  } else {
    y1 = from.y + Math.sign(to.y - from.y) * from.h / 2;
    y2 = to.y - Math.sign(to.y - from.y) * to.h / 2;
  }
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const label = edge.label ? `<text x="${midX}" y="${midY - 10}" text-anchor="middle" class="edge-label">${escapeXml(edge.label)}</text>` : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#344054" stroke-width="2.2" marker-end="url(#arrow)"/>${label}`;
}

function renderFlow({ title, subtitle, width, height, nodes, edges, filename }) {
  const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${markerDefs()}
  <style>
    .title { font: 700 28px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; fill: #101828; }
    .subtitle { font: 400 15px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; fill: #667085; }
    .label { font: 600 16px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; fill: #182230; dominant-baseline: middle; }
    .edge-label { font: 600 14px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; fill: #475467; paint-order: stroke; stroke: #F8FAFC; stroke-width: 5px; }
  </style>
  <rect x="0" y="0" width="${width}" height="${height}" fill="#F8FAFC"/>
  <text x="48" y="54" class="title">${escapeXml(title)}</text>
  <text x="48" y="82" class="subtitle">${escapeXml(subtitle)}</text>
  ${edges.map((edge) => edgeSvg(edge, nodeMap)).join("\n  ")}
  ${nodes.map(nodeSvg).join("\n  ")}
</svg>`;
  fs.writeFileSync(path.join(outDir, filename), svg);
}

renderFlow({
  title: "当前流程：自然语言描述导致反复返工",
  subtitle: "用户看得见页面问题，但 AI 缺少目标元素和页面现场上下文",
  width: 1480,
  height: 520,
  filename: "01-current-flow.svg",
  nodes: [
    { id: "A", label: "AI 生成前端代码", x: 130, y: 210, w: 160, h: 76, fill: "#EEF4FF", stroke: "#84ADFF" },
    { id: "B", label: "用户打开 localhost 页面", x: 330, y: 210, w: 180, h: 76 },
    { id: "C", label: "发现样式/文案/状态问题", x: 550, y: 210, w: 200, h: 76, fill: "#FFF6ED", stroke: "#FDB022" },
    { id: "D", label: "用户用自然语言描述问题", x: 790, y: 210, w: 210, h: 76 },
    { id: "E", label: "AI 在代码库中猜目标位置", x: 1040, y: 210, w: 220, h: 76, fill: "#FEF3F2", stroke: "#F97066" },
    { id: "F", label: "是否改对？", x: 1250, y: 210, w: 130, h: 100, type: "decision", fill: "#FFFAEB", stroke: "#F79009" },
    { id: "G", label: "补充描述/截图/复制类名", x: 790, y: 380, w: 230, h: 76, fill: "#FEF3F2", stroke: "#F97066" },
    { id: "H", label: "用户预览并继续开发", x: 1390, y: 210, w: 160, h: 76, fill: "#ECFDF3", stroke: "#32D583" }
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "E" },
    { from: "E", to: "F" },
    { from: "F", to: "G", label: "否" },
    { from: "G", to: "D" },
    { from: "F", to: "H", label: "是" }
  ]
});

renderFlow({
  title: "目标流程：页面标注转成智能体上下文",
  subtitle: "Chrome 插件负责指物、采集现场、生成上下文；智能体负责改代码",
  width: 1700,
  height: 560,
  filename: "02-target-flow.svg",
  nodes: [
    { id: "A", label: "打开本地预览页", x: 120, y: 230, w: 150, h: 76 },
    { id: "B", label: "开启标注模式", x: 300, y: 230, w: 150, h: 76, fill: "#EEF4FF", stroke: "#84ADFF" },
    { id: "C", label: "悬停并选中元素", x: 500, y: 230, w: 170, h: 76 },
    { id: "D", label: "输入反馈", x: 690, y: 230, w: 130, h: 76, fill: "#FFF6ED", stroke: "#FDB022" },
    { id: "E", label: "生成标注上下文", x: 880, y: 230, w: 180, h: 76, fill: "#F4F3FF", stroke: "#9B8AFB" },
    { id: "F", label: "预览 Markdown / JSON", x: 1100, y: 230, w: 210, h: 76, maxChars: 16 },
    { id: "G", label: "复制给智能体", x: 1310, y: 230, w: 160, h: 76 },
    { id: "H", label: "智能体修改代码", x: 1510, y: 230, w: 170, h: 76, fill: "#ECFDF3", stroke: "#32D583" },
    { id: "I", label: "用户回到页面验证", x: 1510, y: 390, w: 180, h: 76 },
    { id: "J", label: "是否处理完成？", x: 1240, y: 390, w: 150, h: 104, type: "decision", fill: "#FFFAEB", stroke: "#F79009" },
    { id: "K", label: "标记已处理", x: 1030, y: 390, w: 150, h: 76, fill: "#ECFDF3", stroke: "#32D583" },
    { id: "L", label: "补充线程或重新标注", x: 1240, y: 500, w: 190, h: 72, fill: "#FEF3F2", stroke: "#F97066" }
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "D", to: "E" },
    { from: "E", to: "F" },
    { from: "F", to: "G" },
    { from: "G", to: "H" },
    { from: "H", to: "I" },
    { from: "I", to: "J" },
    { from: "J", to: "K", label: "是" },
    { from: "J", to: "L", label: "否" }
  ]
});

renderFlow({
  title: "技术架构：Chrome 插件标注反馈层",
  subtitle: "MV3 插件通过 content script 采集页面现场，通过 side panel 管理标注和上下文",
  width: 1540,
  height: 620,
  filename: "04-technical-architecture.svg",
  nodes: [
    { id: "A", label: "Chrome 插件", x: 120, y: 260, w: 150, h: 80, fill: "#EEF4FF", stroke: "#84ADFF" },
    { id: "B", label: "Content Script", x: 340, y: 180, w: 190, h: 80, maxChars: 16 },
    { id: "C", label: "页面标注层", x: 570, y: 110, w: 160, h: 76, fill: "#F4F3FF", stroke: "#9B8AFB" },
    { id: "D", label: "DOM / 样式采集器", x: 570, y: 250, w: 190, h: 76 },
    { id: "E", label: "标注协议层", x: 820, y: 250, w: 160, h: 76, fill: "#FFF6ED", stroke: "#FDB022" },
    { id: "F", label: "Markdown / JSON 导出", x: 1080, y: 180, w: 220, h: 76, maxChars: 16 },
    { id: "G", label: "Side Panel / Popup", x: 820, y: 110, w: 210, h: 76, maxChars: 18 },
    { id: "H", label: "Chrome Storage / IndexedDB", x: 1090, y: 110, w: 250, h: 76, maxChars: 18 },
    { id: "I", label: "Background Service Worker", x: 340, y: 400, w: 250, h: 76, maxChars: 20 },
    { id: "J", label: "后续 MCP / 本地智能体适配器", x: 650, y: 400, w: 260, h: 76, fill: "#ECFDF3", stroke: "#32D583" },
    { id: "K", label: "源码线索增强", x: 820, y: 520, w: 160, h: 76, fill: "#F2F4F7", stroke: "#98A2B3" }
  ],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "B", to: "D" },
    { from: "D", to: "E" },
    { from: "E", to: "F" },
    { from: "C", to: "G" },
    { from: "G", to: "H" },
    { from: "A", to: "I" },
    { from: "I", to: "J" },
    { from: "D", to: "K" }
  ]
});

function renderState() {
  const width = 1160;
  const height = 480;
  const nodes = [
    { id: "S", label: "开始", x: 110, y: 230, w: 90, h: 64, fill: "#F2F4F7" },
    { id: "D", label: "草稿：已选中元素", x: 290, y: 230, w: 180, h: 76 },
    { id: "O", label: "待处理：已创建标注", x: 520, y: 230, w: 190, h: 76, fill: "#FFF6ED", stroke: "#FDB022" },
    { id: "P", label: "处理中：交给智能体", x: 760, y: 230, w: 190, h: 76, fill: "#EEF4FF", stroke: "#84ADFF" },
    { id: "R", label: "已处理：用户确认", x: 980, y: 150, w: 170, h: 76, fill: "#ECFDF3", stroke: "#32D583" },
    { id: "X", label: "已忽略：关闭标注", x: 980, y: 320, w: 170, h: 76, fill: "#F2F4F7" }
  ];
  renderFlow({
    title: "标注状态流",
    subtitle: "每条页面反馈都是一条轻量 issue，状态用于跟踪问题是否处理",
    width,
    height,
    filename: "03-annotation-state-flow.svg",
    nodes,
    edges: [
      { from: "S", to: "D", label: "选中元素" },
      { from: "D", to: "O", label: "创建标注" },
      { from: "O", to: "P", label: "交给智能体" },
      { from: "P", to: "R", label: "确认完成" },
      { from: "P", to: "O", label: "需补充" },
      { from: "O", to: "X", label: "忽略" }
    ]
  });
}

renderState();

console.log(`Generated flowcharts in ${outDir}`);
