const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const OUT_DIR = path.resolve(__dirname, "../docs/images/prd/flows");
const W = 1600;
const H = 900;

const C = {
  ink: "#171717",
  muted: "#737373",
  light: "#E8E8E8",
  orange: "#F97316",
  blue: "#3B82F6",
  red: "#EF4444",
  green: "#16A34A",
};

function frame(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#fff"/>
    <style>
      .line{fill:none;stroke:${C.ink};stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
      .thin{fill:none;stroke:${C.ink};stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      .muted{fill:none;stroke:${C.muted};stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      .orange{fill:none;stroke:${C.orange};stroke-width:10;stroke-linecap:round;stroke-linejoin:round}
      .blue{fill:none;stroke:${C.blue};stroke-width:8;stroke-linecap:round;stroke-linejoin:round}
      .red{fill:none;stroke:${C.red};stroke-width:8;stroke-linecap:round;stroke-linejoin:round}
      .green{fill:none;stroke:${C.green};stroke-width:8;stroke-linecap:round;stroke-linejoin:round}
      .label{font:600 32px 'PingFang SC','Noto Sans CJK SC',sans-serif;fill:${C.ink}}
      .small{font:500 26px 'PingFang SC','Noto Sans CJK SC',sans-serif;fill:${C.muted}}
      .tiny{font:600 23px 'PingFang SC','Noto Sans CJK SC',sans-serif;fill:${C.ink}}
    </style>
    ${body}
  </svg>`;
}

function xiaohei(x, y, arms = "") {
  return `<g transform="translate(${x} ${y})">
    <path d="M10 16 C18 -2 70 -4 82 17 L86 106 C77 129 17 130 6 105 Z" fill="${C.ink}"/>
    <circle cx="33" cy="38" r="5" fill="#fff"/><circle cx="59" cy="38" r="5" fill="#fff"/>
    <path class="line" d="M27 126 L23 160 M65 126 L71 160"/>
    ${arms}
  </g>`;
}

const diagrams = {
  "flow-story-1-copy.png": frame(`
    <g transform="translate(95 220) rotate(-3)">
      <rect x="0" y="0" width="240" height="300" rx="18" fill="#fff" stroke="${C.ink}" stroke-width="6"/>
      <path class="thin" d="M28 58 H210 M28 96 H175"/>
      <rect x="34" y="145" width="150" height="82" rx="9" fill="#fff" stroke="${C.ink}" stroke-width="4"/>
      <rect x="88" y="118" width="150" height="82" rx="9" fill="#fff" stroke="${C.ink}" stroke-width="4"/>
      <rect x="52" y="218" width="150" height="82" rx="9" fill="#fff" stroke="${C.ink}" stroke-width="4"/>
      <text class="label" x="20" y="350">页面标注</text>
    </g>
    <path class="orange" d="M340 410 C430 410 470 410 535 410"/>
    <g transform="translate(540 252)">
      <rect x="0" y="52" width="430" height="270" rx="30" fill="#fff" stroke="${C.ink}" stroke-width="8"/>
      <path class="line" d="M30 122 H400 M54 184 H372 M54 246 H372"/>
      <circle cx="68" cy="78" r="15" fill="${C.orange}"/>
      <path class="line" d="M20 340 H410"/>
      <circle cx="416" cy="185" r="48" fill="#fff" stroke="${C.ink}" stroke-width="7"/>
      <path class="line" d="M416 137 V95 M416 233 V275 M368 185 H326 M464 185 H506"/>
      <text class="small" x="105" y="375">结构化留言</text>
    </g>
    ${xiaohei(1030, 440, `<path class="line" d="M8 70 L-60 45 M80 68 L130 38"/>`)}
    <path class="orange" d="M970 410 C1080 410 1130 410 1230 410"/>
    <text class="label" x="1035" y="368">复制</text>
    <g transform="translate(1230 275)">
      <rect x="0" y="0" width="250" height="330" rx="24" fill="#fff" stroke="${C.ink}" stroke-width="8"/>
      <path class="line" d="M42 105 H207 M84 105 V50 H166 V105"/>
      <path class="thin" d="M50 196 H200 M50 230 H200"/>
      <text class="label" x="77" y="300">Agent</text>
    </g>`),

  "flow-story-2-first-connect.png": frame(`
    ${xiaohei(160, 465, `<path class="line" d="M78 64 L170 8 M16 68 L136 102"/>`)}
    <g transform="translate(380 170)">
      <rect x="0" y="0" width="440" height="510" rx="28" fill="#fff" stroke="${C.ink}" stroke-width="8"/>
      <path class="line" d="M220 0 V510"/>
      <circle cx="220" cy="255" r="128" fill="#fff" stroke="${C.ink}" stroke-width="8"/>
      <circle cx="220" cy="255" r="36" fill="${C.orange}"/>
      <g class="tiny" text-anchor="middle">
        <text x="220" y="155">1</text><text x="302" y="207">2</text><text x="302" y="308">3</text>
        <text x="220" y="366">4</text><text x="138" y="308">5</text><text x="138" y="207">6</text>
      </g>
      <text class="label" x="96" y="565">6 位配对码</text>
    </g>
    <path class="orange" d="M820 425 H965"/>
    <polygon points="965,425 930,404 930,446" fill="${C.orange}"/>
    <g transform="translate(995 190)">
      <rect x="0" y="0" width="425" height="470" rx="28" fill="#fff" stroke="${C.ink}" stroke-width="8"/>
      <circle cx="365" cy="55" r="14" fill="${C.blue}"/>
      <text class="small" x="255" y="64">已连接</text>
      <rect x="48" y="108" width="330" height="78" rx="16" fill="#fff" stroke="${C.ink}" stroke-width="5"/>
      <rect x="48" y="220" width="330" height="78" rx="16" fill="#fff" stroke="${C.ink}" stroke-width="5"/>
      <rect x="48" y="332" width="330" height="78" rx="16" fill="#fff" stroke="${C.ink}" stroke-width="5"/>
      <text class="label" x="105" y="160">当前页面</text>
      <text class="label" x="174" y="272">项目</text>
      <text class="label" x="161" y="384">Agent</text>
      <path class="blue" d="M22 147 H48 M22 259 H48 M22 371 H48"/>
    </g>`),

  "flow-story-3-switch-project.png": frame(`
    <g transform="translate(90 325)">
      <rect x="0" y="0" width="230" height="140" rx="18" fill="#fff" stroke="${C.ink}" stroke-width="6"/>
      <path class="thin" d="M34 48 H195 M34 82 H160"/>
      <text class="label" x="18" y="195">页面留言</text>
    </g>
    <path class="orange" d="M320 395 H620 C710 395 720 350 800 315"/>
    <g transform="translate(585 380)">
      <path class="line" d="M0 110 L130 0 M48 72 L98 122"/>
      <circle cx="0" cy="110" r="18" fill="${C.ink}"/>
      <path class="line" d="M85 105 L142 48"/>
      <text class="label" x="22" y="165">更换</text>
    </g>
    ${xiaohei(520, 510, `<path class="line" d="M82 65 L150 -2 M10 70 L-28 38"/>`)}
    <g transform="translate(840 135)">
      <rect x="0" y="0" width="470" height="165" rx="22" fill="#fff" stroke="${C.ink}" stroke-width="6"/>
      <rect x="0" y="210" width="470" height="165" rx="22" fill="#fff" stroke="${C.ink}" stroke-width="6"/>
      <rect x="0" y="420" width="470" height="165" rx="22" fill="#fff" stroke="${C.ink}" stroke-width="6"/>
      <path class="thin" d="M34 50 H435 M34 92 H390 M34 260 H435 M34 302 H390 M34 470 H435 M34 512 H390"/>
      <text class="label" x="150" y="105">当前项目</text>
      <text class="label" x="150" y="315">正确项目</text>
      <path class="red" d="M390 50 L435 95 M435 50 L390 95"/>
      <ellipse cx="235" cy="292" rx="265" ry="118" fill="none" stroke="${C.blue}" stroke-width="8" stroke-dasharray="14 13"/>
    </g>
    <path class="orange" d="M1310 450 H1480"/>
    <polygon points="1480,450 1445,429 1445,471" fill="${C.orange}"/>
    <text class="label" x="1348" y="408">发送</text>`),

  "flow-story-4-review-loop.png": frame(`
    <g transform="translate(90 360)">
      <rect x="0" y="0" width="210" height="135" rx="18" fill="#fff" stroke="${C.ink}" stroke-width="6"/>
      <path class="thin" d="M35 45 H175 M35 82 H142"/>
    </g>
    <path class="orange" d="M300 428 H455"/>
    <g transform="translate(455 230)">
      <rect x="0" y="0" width="460" height="395" rx="34" fill="${C.ink}"/>
      <rect x="70" y="72" width="320" height="225" rx="22" fill="#fff"/>
      <circle cx="115" cy="345" r="17" fill="${C.blue}"/>
      <text x="155" y="355" style="font:600 30px 'PingFang SC';fill:#fff">处理中</text>
      <path d="M130 145 H330 M130 200 H300" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>
    </g>
    <path class="orange" d="M915 428 H1050"/>
    <g transform="translate(1030 320)">
      <rect x="0" y="0" width="245" height="175" rx="18" fill="#fff" stroke="${C.blue}" stroke-width="7"/>
      <text class="label" x="55" y="100">待验证</text>
    </g>
    ${xiaohei(1090, 535, `<path class="line" d="M82 68 L160 5 M12 70 L-28 34"/><circle cx="171" cy="-6" r="42" fill="none" stroke="${C.ink}" stroke-width="7"/><path class="line" d="M200 24 L235 61"/>`)}
    <text class="small" x="1085" y="765">用户验收</text>
    <path class="green" d="M1285 410 C1370 380 1415 330 1490 280"/>
    <polygon points="1490,280 1450,278 1475,315" fill="${C.green}"/>
    <text class="label" x="1325" y="265" fill="${C.green}">已解决</text>
    <path class="red" d="M1280 470 C1405 570 1380 750 830 750 C620 750 525 705 525 625"/>
    <polygon points="525,625 504,665 546,665" fill="${C.red}"/>
    <text class="small" x="950" y="805" fill="${C.red}">补充要求</text>`),

  "flow-story-5-copy-fallback.png": frame(`
    <path class="line" d="M155 185 H670"/>
    <path class="line" d="M850 185 H1390"/>
    <path class="red" d="M680 155 L730 220 M770 145 L820 215 M710 170 L790 190"/>
    <text class="label" x="570" y="105" fill="${C.red}">连接不可用</text>
    <g transform="translate(440 330)">
      <rect x="0" y="0" width="560" height="330" rx="35" fill="#fff" stroke="${C.ink}" stroke-width="8"/>
      <rect x="70" y="72" width="240" height="118" rx="18" fill="#fff" stroke="${C.blue}" stroke-width="7"/>
      <text class="label" x="105" y="145">留言保留</text>
      <path class="line" d="M380 90 L490 220"/>
      <circle cx="380" cy="90" r="18" fill="${C.ink}"/>
      <circle cx="490" cy="220" r="18" fill="${C.orange}"/>
      <text class="small" x="340" y="275">复制模式</text>
    </g>
    ${xiaohei(245, 495, `<path class="line" d="M82 66 L200 10 M12 70 L-38 42"/>`)}
    <g transform="translate(1050 500)">
      <rect x="0" y="0" width="300" height="82" rx="15" fill="#fff" stroke="${C.ink}" stroke-width="5"/>
      <rect x="35" y="-32" width="175" height="70" rx="10" fill="#fff" stroke="${C.ink}" stroke-width="4"/>
      <rect x="70" y="-64" width="175" height="70" rx="10" fill="#fff" stroke="${C.ink}" stroke-width="4"/>
    </g>
    <path class="orange" d="M1000 570 H1220 C1300 570 1330 530 1370 465"/>
    <g transform="translate(1360 300)">
      <rect x="0" y="0" width="180" height="255" rx="22" fill="#fff" stroke="${C.ink}" stroke-width="7"/>
      <path class="thin" d="M35 75 H145 M70 75 V38 H112 V75"/>
      <text class="label" x="40" y="205">Agent</text>
      <path class="green" d="M115 245 L140 270 L180 220"/>
    </g>
    <text class="label" x="1080" y="680" fill="${C.orange}">继续交付</text>`),
};

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const [name, svg] of Object.entries(diagrams)) {
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, name));
  }
  console.log(`Rendered ${Object.keys(diagrams).length} PNG files to ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
