# PinPatch 文档站

PinPatch 的 VitePress 文档站。当前有效 PRD 为 [prd.md](./prd.md)，历史版本位于 [archive](./archive/)，研究材料位于 [research](./research/)。

## 快速开始

```bash
cd docs
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可。

## 构建

```bash
npm run build      # 产物在 docs/.vitepress/dist
npm run preview    # 本地预览构建产物
```

## 目录结构

```
docs/
├─ .vitepress/
│  └─ config.ts          # 站点配置（导航、侧边栏、搜索、mermaid）
├─ public/
│  └─ assets/
│     └─ prd-flowcharts/ # PRD 引用的流程图 PNG（可选，mermaid 已原生渲染）
├─ index.md              # 首页（Hero + Features）
├─ prd.md                # PRD 正文（15 章）
└─ package.json
```

## 说明

- PRD 中的流程图用 mermaid 原生渲染，无需额外图片资源。
- 若要替换为设计稿导出的 PNG，把文件放到 `docs/public/assets/prd-flowcharts/` 下同名即可，路径已经对齐。
- 侧边栏的"PRD 章节"分组提供 15 章锚点跳转，点击即可定位。
- 右上角搜索支持全文检索（基于 VitePress 本地搜索）。
