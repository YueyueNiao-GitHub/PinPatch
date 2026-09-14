# PinPatch

PinPatch 将浏览器中的页面点选、标注与评论转换为 AI 编码智能体可消费的结构化上下文，帮助团队更准确地完成局部前端修改。

## 项目结构

```text
PinPatch/
├── docs/                    # 文档站、当前 PRD、调研与历史归档
├── packages/pinpatch-mcp/   # 后续版本研究代码，不属于 1.0
├── packages/pinpatch-extension/ # Manifest V3 Chrome 插件
├── prototypes/              # 交互原型
├── assets/                  # 流程图等静态资源
├── scripts/                 # 资源生成脚本
├── vendor/                  # 第三方源码与研究样本
└── PRODUCT.md               # 产品与设计原则
```

## 常用命令

```bash
# Chrome 插件
cd packages/pinpatch-extension
npm run check
npm run test:runtime

# 文档站
cd docs
npm run dev
```

当前有效 PRD 为 [`docs/prd.md`](docs/prd.md)，历史版本统一保存在 `docs/archive/`。

PinPatch 1.0 不包含 MCP、本地服务或 Agent 自动同步；留言通过单条或批量复制交给编码 Agent。
