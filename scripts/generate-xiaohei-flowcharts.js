const fs = require("fs");
const path = require("path");

const outDir = path.resolve(__dirname, "../assets/xiaohei-flowcharts");
fs.mkdirSync(outDir, { recursive: true });

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars = 9) {
  const lines = [];
  let line = "";
  for (const ch of text) {
    const len = Array.from(line + ch).reduce((sum, c) => sum + (/[A-Za-z0-9/]/.test(c) ? 0.55 : 1), 0);
    if (line && len > maxChars) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function defs() {
  return `<defs>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto" markerUnits="strokeWidth">
      <path d="M2,2 L10,6 L2,10 Z" fill="#344054"/>
    </marker>
  </defs>`;
}

function xiaohei(x, y, scale = 1, action = "") {
  const bodyW = 22 * scale;
  const bodyH = 28 * scale;
  const leg = 8 * scale;
  const eye = 3 * scale;
  const arm = action === "point" ? `<path d="M${x + bodyW / 2 - 2},${y - 2} q16,-8 28,-2" stroke="#111827" stroke-width="${2 * scale}" fill="none" stroke-linecap="round"/>` : "";
  return `<g>
    <ellipse cx="${x}" cy="${y}" rx="${bodyW / 2}" ry="${bodyH / 2}" fill="#111827"/>
    <circle cx="${x - 4 * scale}" cy="${y - 4 * scale}" r="${eye}" fill="#fff"/>
    <circle cx="${x + 5 * scale}" cy="${y - 4 * scale}" r="${eye}" fill="#fff"/>
    <path d="M${x - 5 * scale},${y + bodyH / 2 - 1} l-4,${leg}" stroke="#111827" stroke-width="${2 * scale}" stroke-linecap="round"/>
    <path d="M${x + 5 * scale},${y + bodyH / 2 - 1} l4,${leg}" stroke="#111827" stroke-width="${2 * scale}" stroke-linecap="round"/>
    ${arm}
  </g>`;
}

function nodeSvg(node) {
  const fill = node.fill || "#FFFFFF";
  const stroke = node.stroke || "#98A2B3";
  const lines = wrapText(node.label, node.maxChars || 9);
  const textY = node.y - (lines.length - 1) * 11;
  const text = lines.map((line, index) => `<text x="${node.x}" y="${textY + index * 22}" text-anchor="middle" class="label">${escapeXml(line)}</text>`).join("");
  if (node.type === "decision") {
    const points = [
      `${node.x},${node.y - node.h / 2}`,
      `${node.x + node.w / 2},${node.y}`,
      `${node.x},${node.y + node.h / 2}`,
      `${node.x - node.w / 2},${node.y}`
    ].join(" ");
    return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${text}`;
  }
  return `<rect x="${node.x - node.w / 2}" y="${node.y - node.h / 2}" width="${node.w}" height="${node.h}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${text}`;
}

function edgeSvg(edge, map) {
  const from = map[edge.from];
  const to = map[edge.to];
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
  const label = edge.label
    ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 9}" text-anchor="middle" class="edge-label">${escapeXml(edge.label)}</text>`
    : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#344054" stroke-width="2.1" marker-end="url(#arrow)"/>${label}`;
}

function render({ filename, title, subtitle, width, height, nodes, edges, creatures = [] }) {
  const map = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${defs()}
  <style>
    .title { font: 700 28px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; fill: #101828; }
    .subtitle { font: 400 15px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; fill: #667085; }
    .label { font: 600 16px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; fill: #182230; dominant-baseline: middle; }
    .edge-label { font: 600 14px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; fill: #475467; paint-order: stroke; stroke: #F8FAFC; stroke-width: 5px; }
  </style>
  <rect x="0" y="0" width="${width}" height="${height}" fill="#F8FAFC"/>
  <text x="48" y="54" class="title">${escapeXml(title)}</text>
  <text x="48" y="82" class="subtitle">${escapeXml(subtitle)}</text>
  ${edges.map((edge) => edgeSvg(edge, map)).join("\n  ")}
  ${nodes.map(nodeSvg).join("\n  ")}
  ${creatures.map((c) => xiaohei(c.x, c.y, c.scale, c.action)).join("\n  ")}
</svg>`;
  fs.writeFileSync(path.join(outDir, filename), svg);
}

render({
  filename: "01-current-flow-xiaohei.svg",
  title: "当前流程：自然语言描述导致反复返工",
  subtitle: "小黑在浏览器里指得很准，但 AI 到代码里只能猜",
  width: 1480,
  height: 520,
  creatures: [
    { x: 550, y: 145, scale: 0.82, action: "point" },
    { x: 1040, y: 150, scale: 0.82 }
  ],
  nodes: [
    { id: "A", label: "AI 生成前端代码", x: 130, y: 240, w: 165, h: 76, fill: "#EEF4FF", stroke: "#84ADFF" },
    { id: "B", label: "打开 localhost 页面", x: 335, y: 240, w: 175, h: 76 },
    { id: "C", label: "发现页面问题", x: 545, y: 240, w: 165, h: 76, fill: "#FFF6ED", stroke: "#FDB022" },
    { id: "D", label: "自然语言描述", x: 760, y: 240, w: 165, h: 76 },
    { id: "E", label: "AI 猜目标位置", x: 980, y: 240, w: 180, h: 76, fill: "#FEF3F2", stroke: "#F97066" },
    { id: "F", label: "是否改对？", x: 1185, y: 240, w: 128, h: 96, type: "decision", fill: "#FFFAEB", stroke: "#F79009" },
    { id: "G", label: "补充描述/截图/类名", x: 760, y: 400, w: 210, h: 72, fill: "#FEF3F2", stroke: "#F97066", maxChars: 11 },
    { id: "H", label: "预览继续开发", x: 1360, y: 240, w: 160, h: 76, fill: "#ECFDF3", stroke: "#32D583" }
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

render({
  filename: "02-target-flow-xiaohei.svg",
  title: "目标流程：页面标注转成智能体上下文",
  subtitle: "Chrome 插件负责点选、采集、生成上下文；智能体负责改代码",
  width: 1700,
  height: 560,
  creatures: [
    { x: 500, y: 160, scale: 0.82, action: "point" },
    { x: 900, y: 165, scale: 0.78 },
    { x: 1430, y: 165, scale: 0.78 }
  ],
  nodes: [
    { id: "A", label: "打开本地预览页", x: 120, y: 250, w: 160, h: 76 },
    { id: "B", label: "开启标注模式", x: 315, y: 250, w: 160, h: 76, fill: "#EEF4FF", stroke: "#84ADFF" },
    { id: "C", label: "选中元素", x: 505, y: 250, w: 145, h: 76 },
    { id: "D", label: "输入反馈", x: 680, y: 250, w: 130, h: 76, fill: "#FFF6ED", stroke: "#FDB022" },
    { id: "E", label: "生成标注上下文", x: 875, y: 250, w: 180, h: 76, fill: "#F4F3FF", stroke: "#9B8AFB" },
    { id: "F", label: "预览 Markdown / JSON", x: 1105, y: 250, w: 210, h: 76, maxChars: 16 },
    { id: "G", label: "复制给智能体", x: 1325, y: 250, w: 160, h: 76 },
    { id: "H", label: "智能体修改代码", x: 1525, y: 250, w: 170, h: 76, fill: "#ECFDF3", stroke: "#32D583" },
    { id: "I", label: "回到页面验证", x: 1525, y: 410, w: 160, h: 76 },
    { id: "J", label: "是否完成？", x: 1260, y: 410, w: 132, h: 96, type: "decision", fill: "#FFFAEB", stroke: "#F79009" },
    { id: "K", label: "标记已处理", x: 1050, y: 410, w: 150, h: 76, fill: "#ECFDF3", stroke: "#32D583" },
    { id: "L", label: "补充线程/重新标注", x: 1260, y: 515, w: 195, h: 68, fill: "#FEF3F2", stroke: "#F97066" }
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

render({
  filename: "03-state-flow-xiaohei.svg",
  title: "标注状态流：一条反馈就是一张轻量 issue",
  subtitle: "状态管理的意思：每条页面反馈都有自己的处理进度",
  width: 1180,
  height: 470,
  creatures: [{ x: 405, y: 155, scale: 0.85 }, { x: 650, y: 155, scale: 0.78 }],
  nodes: [
    { id: "A", label: "开始", x: 110, y: 250, w: 90, h: 64, fill: "#F2F4F7" },
    { id: "B", label: "草稿：选中元素", x: 300, y: 250, w: 170, h: 76 },
    { id: "C", label: "待处理：已创建", x: 525, y: 250, w: 175, h: 76, fill: "#FFF6ED", stroke: "#FDB022" },
    { id: "D", label: "处理中：交给智能体", x: 770, y: 250, w: 200, h: 76, fill: "#EEF4FF", stroke: "#84ADFF" },
    { id: "E", label: "已处理：用户确认", x: 1000, y: 165, w: 180, h: 76, fill: "#ECFDF3", stroke: "#32D583" },
    { id: "F", label: "已忽略：关闭标注", x: 1000, y: 335, w: 180, h: 76, fill: "#F2F4F7" }
  ],
  edges: [
    { from: "A", to: "B", label: "选中" },
    { from: "B", to: "C", label: "创建" },
    { from: "C", to: "D", label: "处理" },
    { from: "D", to: "E", label: "完成" },
    { from: "D", to: "C", label: "补充" },
    { from: "C", to: "F", label: "忽略" }
  ]
});

render({
  filename: "04-architecture-xiaohei.svg",
  title: "技术架构：Chrome 插件标注反馈层",
  subtitle: "MV3 插件通过 content script 采集页面现场，通过 side panel 管理标注",
  width: 1500,
  height: 610,
  creatures: [{ x: 365, y: 120, scale: 0.82, action: "point" }, { x: 785, y: 165, scale: 0.78 }],
  nodes: [
    { id: "A", label: "Chrome 插件", x: 120, y: 300, w: 150, h: 76, fill: "#EEF4FF", stroke: "#84ADFF" },
    { id: "B", label: "Content Script", x: 340, y: 210, w: 190, h: 76, maxChars: 16 },
    { id: "C", label: "页面标注层", x: 570, y: 140, w: 160, h: 76, fill: "#F4F3FF", stroke: "#9B8AFB" },
    { id: "D", label: "DOM / 样式采集器", x: 570, y: 285, w: 190, h: 76, maxChars: 13 },
    { id: "E", label: "标注协议层", x: 815, y: 285, w: 160, h: 76, fill: "#FFF6ED", stroke: "#FDB022" },
    { id: "F", label: "Markdown / JSON 导出", x: 1080, y: 220, w: 220, h: 76, maxChars: 16 },
    { id: "G", label: "Side Panel / Popup", x: 820, y: 140, w: 210, h: 76, maxChars: 18 },
    { id: "H", label: "Chrome Storage / IndexedDB", x: 1110, y: 140, w: 250, h: 76, maxChars: 18 },
    { id: "I", label: "Background Service Worker", x: 340, y: 430, w: 250, h: 76, maxChars: 20 },
    { id: "J", label: "后续 MCP / 本地智能体适配器", x: 660, y: 430, w: 270, h: 76, fill: "#ECFDF3", stroke: "#32D583" },
    { id: "K", label: "源码线索增强", x: 900, y: 520, w: 160, h: 76, fill: "#F2F4F7", stroke: "#98A2B3" }
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

console.log(`Generated Xiaohei flowcharts in ${outDir}`);
