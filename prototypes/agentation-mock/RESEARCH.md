# Agentation 实现调研记录

已检查来源：

- 产品站点：`https://www.agentation.com/`
- 官网侧边栏暴露的公开仓库：`https://github.com/benjitaylor/agentation`
- 本地临时克隆目录：`/tmp/agentation-src`

关键实现判断：

- 官网是一个 Next.js / Vercel 文档与演示站。
- 公开包暴露了 React 工具条组件：`Agentation` / `PageFeedbackToolbarCSS`。
- 工具条通过 portal 挂到页面上，固定在右下角。
- 进入标注模式后，它会在 document capture 阶段拦截点击。
- 鼠标悬停时会计算目标元素，绘制 fixed 高亮框，并展示深色 tooltip。
- 点击元素后会创建 pending annotation，弹出黑色 textarea 评论气泡，提交后生成编号 marker。
- 每条标注包含元素名称、元素路径、选择器、视觉边界、选中文本、计算样式、React / 源码提示、状态和线程消息。
- Markdown 输出由标注列表生成，用于粘贴给编码 Agent。
- MCP 包额外提供 session、pending / resolved 状态、回复、watch mode 和 server sync。

许可证说明：

公开代码使用 PolyForm Shield 1.0.0，不是 MIT。当前本地原型没有复制 package 源码，而是用静态 HTML / CSS / JS 重新实现交互模式。

当前原型已实现：

- Agentation 风格的文档页布局和视觉语言。
- Remix Icon 图标体系。
- 悬浮工具条：标注、评论、复制输出、清空标注。
- 悬停高亮与元素 tooltip。
- 点击元素创建评论气泡。
- 编号 marker。
- 点击 marker 打开评论线程。
- 在评论面板按单条或批量发送标注给智能体。
- `待发送 -> 处理中 -> 待验证 -> 已解决` 的任务状态闭环。
- 补充上下文、解决 / 重新打开、删除和本地智能体处理模拟。
- 基于模拟 AFS 字段生成 Markdown 输出。
- 使用 localStorage 做本地持久化。
