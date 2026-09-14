# Agentation MCP 研究笔记

研究日期：2026-07-08

## 1. 已下载内容

- MCP npm 包：`vendor/agentation-mcp/agentation-mcp-1.2.0.tgz`
- MCP 解包源码：`vendor/agentation-mcp/extracted/package/`
- 官方 GitHub 仓库：`vendor/agentation-repo/`

官方 npm 最新版本：

- `agentation-mcp@1.2.0`
- 发布时间：2026-02-15
- License：PolyForm Shield 1.0.0
- 依赖：`@modelcontextprotocol/sdk`、`better-sqlite3`、`zod`

## 2. Agentation 的真实产品形态

Agentation 不是单纯的 MCP，也不是单纯的前端组件。完整体验由三层组成：

1. 前端标注工具栏：`agentation@3.0.2`，React 组件，嵌入业务页面。
2. 本地 MCP 服务：`agentation-mcp@1.2.0`，同时启动 HTTP server 和 MCP stdio server。
3. Agent 工作流 skill：仓库内有 `skills/agentation` 和 `skills/agentation-self-driving`。

它的核心链路是：

```text
页面工具栏 -> HTTP Server -> SQLite / EventBus -> MCP Server -> AI Coding Agent
```

官网表述为：

```text
Browser Toolbar -> HTTP Server -> MCP Server -> AI Agent
```

关键判断：Agentation 的 MCP 不是负责改代码的模块，它负责把“用户在页面上指出的问题”变成 Agent 可读取、可跟踪状态、可回复的结构化任务队列。真正改代码仍由 Claude Code / Codex / Cursor 这类 coding agent 完成。

## 3. 安装与启动方式

官网推荐：

```bash
npx add-mcp "npx -y agentation-mcp server"
```

这个方式会自动识别 Claude Code、Cursor、Codex、Windsurf 等 Agent，并写入对应 MCP 配置。

Claude Code 专用方式：

```bash
claude mcp add agentation -- npx agentation-mcp server
```

命令行：

```bash
npx agentation-mcp init
npx agentation-mcp server
npx agentation-mcp doctor
npx agentation-mcp help
```

Server 参数：

```bash
--port <port>      # HTTP server 端口，默认 4747
--mcp-only         # 只跑 MCP stdio，不启动 HTTP server
--http-url <url>   # MCP 访问的 HTTP server 地址
--api-key <key>    # 云端模式 API key
```

默认存储：

```text
~/.agentation/store.db
```

可以用内存模式：

```bash
AGENTATION_STORE=memory agentation-mcp server
```

## 4. HTTP API

浏览器工具栏主要通过 HTTP API 写入和读取数据。

Session：

- `POST /sessions`：创建页面会话
- `GET /sessions`：列出所有会话
- `GET /sessions/:id`：读取会话和全部标注

Annotation：

- `POST /sessions/:id/annotations`：新增标注
- `GET /annotations/:id`：读取单条标注
- `PATCH /annotations/:id`：更新标注
- `DELETE /annotations/:id`：删除标注
- `GET /sessions/:id/pending`：读取某个会话下待处理标注
- `GET /pending`：读取所有会话下待处理标注
- `POST /annotations/:id/thread`：给标注追加对话消息

事件：

- `GET /sessions/:id/events`：某个会话的 SSE 事件流
- `GET /events`：全局 SSE 事件流，可用 `?domain=...` 过滤
- `POST /sessions/:id/action`：用户请求 Agent 处理当前标注，触发 `action.requested`

健康检查：

- `GET /health`
- `GET /status`

额外发现：

- HTTP server 还提供 `/mcp`，支持 Streamable HTTP MCP transport。
- 但主 README 和常规用法仍以 stdio MCP 为主。

## 5. MCP Tools

当前 MCP 暴露 9 个工具：

| 工具名 | 作用 |
| --- | --- |
| `agentation_list_sessions` | 列出活跃页面会话 |
| `agentation_get_session` | 获取某个会话及其全部标注 |
| `agentation_get_pending` | 获取某个会话下待处理标注 |
| `agentation_get_all_pending` | 获取所有会话下待处理标注 |
| `agentation_acknowledge` | 标记“已看到/处理中” |
| `agentation_resolve` | 标记“已解决”，可附处理摘要 |
| `agentation_dismiss` | 标记“忽略/不处理”，必须给原因 |
| `agentation_reply` | 在标注线程中回复或追问 |
| `agentation_watch_annotations` | 阻塞等待新标注，收集一批后返回 |

最关键的是 `agentation_watch_annotations`。它先拉取已有 pending；如果没有，就连接 SSE 等待 `annotation.created`。收到第一条新标注后，会等待一个 batch window，把短时间内新增的多条标注合并返回。

默认参数：

- `batchWindowSeconds`：10 秒，最大 60 秒
- `timeoutSeconds`：120 秒，最大 300 秒

这就是 Agentation 的“免复制、边标边改”体验基础。

## 6. 数据模型

核心对象是 Session 和 Annotation。

Session：

```ts
type Session = {
  id: string;
  url: string;
  status: "active" | "approved" | "closed";
  createdAt: string;
  updatedAt?: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
};
```

Annotation：

```ts
type Annotation = {
  id: string;
  x: number;
  y: number;
  comment: string;
  element: string;
  elementPath: string;
  timestamp: number;
  selectedText?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  nearbyText?: string;
  cssClasses?: string;
  nearbyElements?: string;
  computedStyles?: string;
  fullPath?: string;
  accessibility?: string;
  isMultiSelect?: boolean;
  isFixed?: boolean;
  reactComponents?: string;
  sourceFile?: string;
  kind?: "feedback" | "placement" | "rearrange";
  placement?: {
    componentType: string;
    width: number;
    height: number;
    scrollY: number;
    text?: string;
  };
  rearrange?: {
    selector: string;
    label: string;
    tagName: string;
    originalRect: { x: number; y: number; width: number; height: number };
    currentRect: { x: number; y: number; width: number; height: number };
  };
  sessionId?: string;
  url?: string;
  intent?: "fix" | "change" | "question" | "approve";
  severity?: "blocking" | "important" | "suggestion";
  status?: "pending" | "acknowledged" | "resolved" | "dismissed";
  thread?: ThreadMessage[];
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: "human" | "agent";
};
```

重要发现：官网已经强调 AFS 1.1，把标注分成三类：

- `feedback`：普通问题反馈
- `placement`：放置组件/线框占位
- `rearrange`：页面区块重排

这对我们非常重要。我们不应该只把产品定义成“点元素写评论”，而应该把它定义成“把视觉意图结构化为 Agent 可执行任务”。

## 7. 状态机

Annotation 状态：

```text
pending -> acknowledged -> resolved
pending -> dismissed
```

对应中文可翻译为：

- `pending`：待处理
- `acknowledged`：已接收/处理中
- `resolved`：已完成
- `dismissed`：已忽略

注意：`acknowledged` 更准确不是“已处理”，而是“Agent 已看到并接手”。真正完成是 `resolved`。

## 8. 事件机制

事件类型：

```ts
type AFSEventType =
  | "annotation.created"
  | "annotation.updated"
  | "annotation.deleted"
  | "session.created"
  | "session.updated"
  | "session.closed"
  | "thread.message"
  | "action.requested";
```

所有事件都有递增 `sequence`，SSE 重连时可以用 `Last-Event-Id` 补发遗漏事件。这个设计很实用，建议我们复用。

## 9. 持久化设计

默认 SQLite，路径：

```text
~/.agentation/store.db
```

核心表：

- `sessions`
- `annotations`
- `events`
- `organizations`
- `users`
- `api_keys`

虽然本地版主要用前三张表，但它已经为云端多租户和 API key 做了预留。

## 10. React 组件版的能力来源

Agentation 的前端标注组件嵌入业务页面，因此能做几件 Chrome 插件默认较难稳定做到的事：

- 直接读 DOM 和 computed style
- 直接读 React fiber，拿组件路径
- 在 React dev build 下读取 `_debugSource`，拿 source file 和行号
- 在页面内保存 localStorage 状态
- 通过 `endpoint` prop 直接同步到本地 MCP HTTP server

这也是它能做到“指哪改哪”的关键，但代价是业务项目需要安装 npm 包并改入口代码。

## 11. 对我们 Chrome 插件版的启发

如果我们做 Chrome 插件，不应该照搬“React 组件嵌入”路径，而应该照搬它的数据协议和协作闭环：

```text
Chrome 插件 content script
-> 页面元素识别/框选/文本选区/截图
-> 本地 HTTP bridge
-> SQLite / EventBus
-> MCP tools
-> Codex / Claude / Cursor
-> 状态回写到插件侧边栏和页面标记
```

我们的 MVP 可以保留 Chrome 插件优势：

- 不要求用户改项目代码
- 支持任意本地网页、localhost、静态 HTML、部分线上页面
- 入口更像浏览器标注工具，而不是 SDK

但必须承认 Chrome 插件版的限制：

- 默认拿不到 React fiber source location，除非页面允许或配合 devtools/source map。
- 不能直接改本地源码，仍要通过 MCP/local agent/IDE agent。
- 对跨域 iframe、shadow DOM、canvas、WebGL、闭源线上页面会有限制。
- 修改“本地 HTML 文件”需要用户授权和本地桥，不应让插件直接写文件。

## 12. 建议我们照搬的部分

1. Session / Annotation / Event 的协议结构。
2. `pending / acknowledged / resolved / dismissed` 状态闭环。
3. `agentation_watch_annotations` 这种阻塞等待加 batch window 的工具。
4. HTTP server 作为浏览器和 MCP 的单一事实源。
5. SQLite 本地持久化。
6. SSE 事件流，用于浏览器和 Agent 双向同步状态。
7. 标注线程 `thread`，允许 Agent 追问和解释处理结果。
8. 标注类型扩展：`feedback / placement / rearrange`。

## 13. 建议我们不要照搬的部分

1. 不把 React 组件嵌入作为主路径；我们的主路径应是 Chrome 插件。
2. 不把“自动改代码”放在 0 期；0 期先做准确表达和结构化交付。
3. 不依赖 Claude 专用配置；安装要面向 Codex、Claude、Cursor、Windsurf 等多 Agent。
4. 不把状态文案翻译成“已处理/已忽略”就结束，需要区分“已接收”和“已完成”。
5. 不把 Chrome 插件包装成可以直接写本地文件；这会带来权限、信任和回滚风险。

## 14. 我们阶段 1 的建议 MCP 工具

建议工具名不要直接用 `agentation_`，可以用自己的产品前缀，例如：

| 工具 | 作用 |
| --- | --- |
| `visual_list_sessions` | 列出页面会话 |
| `visual_get_session` | 读取会话及标注 |
| `visual_get_pending` | 读取当前会话待处理标注 |
| `visual_get_all_pending` | 读取所有待处理标注 |
| `visual_acknowledge` | 标记已接收 |
| `visual_resolve` | 标记已完成，并写入处理摘要 |
| `visual_dismiss` | 标记不处理，并写原因 |
| `visual_reply` | 向用户追问或说明 |
| `visual_watch_annotations` | 阻塞等待新标注并批量返回 |

如果要比 Agentation 更进一步，可以加：

| 工具 | 作用 |
| --- | --- |
| `visual_get_dom_context` | 按 annotationId 获取更完整 DOM 上下文 |
| `visual_get_screenshot` | 获取标注区域截图 |
| `visual_attach_patch` | Agent 把拟修改 diff 绑定回某个标注 |
| `visual_verify_result` | 用户或 Agent 对结果做验收记录 |

## 15. 对 PRD 的产品判断

我们的产品不应表述为“Chrome 插件帮你改代码”，而应表述为：

> 面向 AI 改码工作流的本地可视化反馈层。用户在浏览器里指出问题、描述意图，系统把页面位置、元素上下文、截图、状态和对话结构化同步给本地 Agent，由 Agent 完成代码修改并把处理状态回写给用户。

这比“截图 + 文字”强，也比“直接让插件改本地文件”稳。

从第一性原理看，用户真正需要的不是浏览器插件本身，而是降低三类成本：

1. 指代成本：我说的是哪个元素、哪个状态、哪个区域。
2. 上下文成本：Agent 需要哪些 DOM、样式、文本、组件、截图信息。
3. 闭环成本：它是否看到了、是否在处理、改了什么、我是否接受。

Agentation 的优秀之处就是把这三件事做成了一个闭环。我们应该做同样的闭环，但入口改成 Chrome 插件，并为本地文件/本地 Agent/多工具协作设计更强的桥接层。
