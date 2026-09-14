# AI 前端可视化编辑工具竞品调研报告

## 一、调研背景与目标

### （一）前置结论

本次调研的核心结论是：这个方向值得做，但第一阶段不应从“完整 AI 前端可视化编辑器”起步。真正需要先验证的，不是能否做出一个类似 Inspector 的完整工
作台，而是能否解决最关键的一步：用户在真实页面上指出一个 UI 后，AI 是否能拿到足够准确的页面、样式和源码上下文，并因此更稳定地改对代码。
换句话说，第一阶段应优先建设一层 UI 上下文能力：把用户看到的页面元素，转换成 Agent 能理解和使用的结构化信息，包括 DOM、样式、组件关系、源码位置
和必要的视觉状态。这个能力如果不成立，后续无论是视觉属性面板、Browser-first 工作台，还是 Git / MR 闭环，都会缺少可信基础。
如果验证结果成立，再逐步扩展为完整修改闭环：在浏览器中预览改动，通过 diff 审查和撤销机制控制风险，并进一步接入设计系统、权限、路由、日志、接口等复
杂业务上下文。

### （二）关键结论

方向成立 第一阶段不应复刻
Inspector
可信修改比功能覆盖更重要 内部机会在复杂业务环境 推荐路线
AI 前端修改的关键痛点不是
“不会生成代码”，而是缺少
真实页面、运行时状态和源码
之间的上下文桥接。
Inspector 是终局体验参考，
但第一阶段更应学习 React
Grab 和源码定位类工具，先
验证“选中 UI + 结构化上下
文 + Agent 修改”这一最小
切口。
code-first design tools 的关
键门槛不是是否有属性面板、
拖拽或 Chat，而是修改是否
真实、确定、清楚、完整、可
恢复。
外部工具难以覆盖私有代码、
内部组件库、设计系统
token、权限状态、复杂后台
语义、MR / CI / 审计链路，这
正是内部工具的机会。
第一阶段做 UI 上下文能力；
第二阶段补 Browser-first 修
改闭环；第三阶段接入设计系
统和业务上下文。

### （三）为什么做这次调研

这一方向并非单纯从外部竞品分析倒推出来，而是由内外部反馈共同指向：一方面，团队内部真实工作场景中已经反复出现类似编辑痛点；另一方面，外部社区、AI
coding 工具和 code-first design tools 的演进也说明，这不是单个团队的局部问题，而是前端 AI 修改场景中的共性需求。
当用户已有 HTML 或前端页面时，进行局部修改仍然困难。即使只是调整布局、文案、样式、模块顺序或局部视觉状态，也经常需要在页面表现、DOM 结构、
CSS、组件代码之间来回切换。
> 如何让用户在真实页面上直接指出要改的位置，让 AI 自动拿到足够上下文，并把修改变成可预览、可审查、可回退的代码变更？
因此，本次调研的核心目标并非论证‘是否需要开发 AI 前端工具’，而是将这一已存在的需求拆解为可落地的具体问题：
> 如何让用户在真实页面上直接指出要改的位置，让 AI 自动拿到足够上下文，并把修改变成可预览、可审查、可回退的代码变更？

#### 行业背景：从 Design-First 到 Code-First

传统前端协作通常是 Design First：
需求文档 → 设计稿 → 工程实现 → 走查反馈 → 修改 → 再走查
该流程在营销页、标准页面及从零设计等场景下有效。但在复杂业务系统里，大量工作并不是从零设计，而是围绕已有真实代码持续调整：
- 已上线页面的 UI 微调；
- 复杂表格、表单、筛选器的局部优化；
- 设计系统组件的使用修正；
- 支持文案、状态、权限、空状态、错误状态等调整。
- 设计走查后的问题修复
- AI 生成代码后的结果校正。
在这些场景里，真实产品页面和真实代码比静态设计稿更接近事实源。因此 code-first design tools 的核心价值是：
> 直接在真实产品和真实代码之上完成理解、修改和协作。
但 code-first 也带来更高要求：工具必须理解现有代码结构、样式来源、组件封装、运行时状态和修改边界。若仅提供视觉面板，却无法保障修改的正确性，则其风
险反而高于传统设计稿。
Inspector 的价值正在于此：它不仅是一个单独的设计器，而是尝试把浏览器、源码、AI Agent、代码修改和 Git/PR 连起来。

### （四）本次调研要回答的问题

本次调研并非旨在回答‘市面上有哪些 AI 前端工具’，而是聚焦一个更具体的问题：
> 当用户在真实前端页面中发现 UI 问题时，如何让 AI 准确理解“要改哪里、为什么改、怎么改”，并把修改落地到真实代码库？
若将问题简单理解为‘我们需要一个可视化编辑器’，就容易误入低代码平台、Webflow 或 Figma 类构建器，甚至完整 IDE 的路径。
更准确的问题还原是：
层级 表面问题 真实问题
用户表达 用户往往难以准确定位需修改的页面元素。 缺乏‘指物’能力：AI 无法准确识别用户所指的具体 UI 元素。
AI 理解 AI 能看到代码，却无法感知真实页面的运行状态。 缺少浏览器运行时上下文、DOM、样式、截图、组件关系
视觉编辑 工具看起来能改 UI，但面板显示和真实 CSS 不一致 code-first 设计工具最核心的门槛，不在于功能多少，而在于代码生成的正确性、可信
度与可预测性。
代码落地 AI 能生成代码，但修改不一定可控 缺少 diff review、回滚、Git/MR 协作链路
组织协作 设计/产品/前端之间需要截图、标注、文字反复沟通 缺少从视觉问题到代码修改的统一工作流
因此，分析重点不是“谁功能最多”，而是谁更好地解决了这条链路：
流程为：发现 UI 问题 → 指向页面元素 → 收集上下文 → 提交 AI 处理 → 生成代码修改 → 预览/审查 → 进入协作流程。

## 二、调研对象与竞品分层

本报告不将所有产品简单归入‘直接竞品’范畴，而是依据其对内部决策的影响进行分层：谁决定主路线，谁提供可复用能力，谁提示未来边界，谁仅作外围参照。
分层 产品 / 项目 类型 纳入原因 对本次调研的作用
核心对标 Inspector AI 前端可视化编辑器 最接近“在浏览器中选 UI、让
Agent 改代码、写回代码库”的完
整体验
作为体验的主对标，重点观察 browser-first 工作台、
上下文桥接、Design / Chat 双模式和 Git / PR 闭环
压力样本 Cursor Browser /
design sidebar
AI IDE 内的 code-first
视觉编辑能力
Inspector 官方博客将其作为
code-first design 工具正确性评
测对象
用于分析 code-first design 工具为何会失去用户信
任，重点关注正确性、确定性与可恢复性风险。
相邻路线 Onlo Visual-first code
editor
面向设计师的视觉代码编辑器，代
表 visual-first / builder 化路线
参考属性面板、画布操作和设计师友好度，同时警惕产
品边界滑向 builder
底层能力参考 React Grab UI-to-Agent context
工具
证明“‘选中元素并复制上下文给
Agent”是独立高价值切口
作为第一阶段轻量上下文采集的最小切口参考
底层能力参考 code-inspector 多框架源码定位 解决 DOM 到源码定位问题 参考编译期注入、Source Map 和 IDE Bridge 等底盘
能力
底层能力参考 react-dev-inspector React 源码定位 React 生态中页面元素到代码的定
位参考
可参考 React 项目中元素到组件、文件及行号的定位
方式。
底层能力参考 LocatorJS 浏览器插件 / 源码定位 提供 DevTools / data-id 等源码
定位路径
参考轻量浏览器插件和运行时标记方案
上下文深度参
考
Frontman 浏览器内 AI coding
agent / framework
middleware
强调运行时上下文，包括 live
DOM、component
tree、CSS、路由、服务端日志
等。
需判断在复杂业务系统中，Agent 是否需要路由、日
志、构建输出等运行时上下文。
上下文深度参
考
Tidewave 面向全栈 Web 应用的
编码型 Agent。
从 UI 到数据库、日
志、framework metadata 的全
栈上下文
可作为未来能力边界的参考，但不作为第一阶段的直接
竞品。
外围参考 v0 / Lovable / Bolt AI 应用生成 更偏向从零生成应用，而不是修改
真实代码库中的已有 UI
只作为 AI UI 生成方向的外围参照
外围参考 Puck / Webstudio /
GrapesJS
可视化搭建器 更偏 builder / CMS，而不是
Agent 驱动的前端修改工作流
只参考组件化编辑和设计系统约束，不作为主路线

### （一）竞品纳入依据：客观信号

竞品筛选不是按“看起来像不像 Inspector”主观选择，而是按三类可核验信号精选：
信号类型 判断口径 说明
问题相关性 是否直接覆盖 browser、visual editing、UI-to-Agent context、源码定位、diff
review、Git/PR 中的关键环节
该能力是否与内部技术方向相关？
社区 / 使用信号 GitHub star 数、npm 下载量、开源活跃度、公开文档与示例完备性 需证明其并非孤立 Demo，而是已获得一定
开发者关注或实际使用。
商业 / 组织信号 YC 收录、定价页、企业版、团队协作、source control 文档 证明该方向具备组织级投入价值
公开数据口径说明：GitHub Stars 数据来自 GitHub 仓库主页；npm 下载量数据来自 npm 官方 Downloads API，统计周期为 2026-05-27 至 2026-06-02；
官网、YC 页面、文档站及定价页均取自公开可访问页面，核验时间为 2026-06-10。
证据等级说明：
等级 来源类型 使用方式
A 数据来源包括官方文档、公开的产品功能页、定价页，以及 GitHub / npm 上的
公开数据。
可作为事实依据，但仍需标注时间
B 官方 blog、对比页、厂商自我叙事 可作为观点和判断线索，但不能单独作为竞品优劣结论
C 界面截图、演示视频、二手资料 可用于提出假设，但需通过实测验证。
D 内部试用、真实项目验证、用户访谈 应作为最终路线判断的关键证据，目前仍缺失
产品 / 项目 客观信号 为什么足以纳入

Inspector YC 页面定位为 AI IDE for front-end development；官网定位为 visually
edit front-end；官方博客给出 89 visual test cases / 43 failed 的 code-
first design tools 评测样本；官方文档覆盖 Chat、Visual Editor、Source
Control
方向最贴合：浏览器、视觉编辑、Agent、代码变更、
发布/PR 都在同一链路内
Cursor Browser /
design sidebar
Inspector 官方博客将其作为 code-first design tools 的系统评测对象，覆盖
89 visual 个视觉测试用例，其中 43 个失败；Cursor 有公开的团队 /
Enterprise 定价
虽非直接对标产品，但它提供了‘AI IDE 内置视觉编辑
能力为何失败’的反例样本。
stagewise GitHub 页面约 6,676 颗星；YC 页面定位为 ‘The Open Source Agentic
IDE’，并披露数据：4,800 颗 GitHub 星、130,000 次下载；设有公开定价
页。
开源、Agentic IDE、预览、Git workflow，适合作为
可拆可重工作台参考
React Grab GitHub 页面约 7,296 颗星；GitHub 标题为 ‘Copy any UI element for
your agent’；官网可访问。
直接证明‘将 UI 元素上下文交予 Agent’是一个独立
且高价值的技术切口。
code-inspector GitHub 仓库约获 2,975 颗星标；code-inspector-plugin npm 包周下载量约
281,419 次
源码定位能力已有明显使用信号，适合作为 DOM →
source mapping 的底层参考。
react-dev-
inspector
GitHub 仓库约 1,313 颗星标；npm 包 react-dev-inspector 周下载量约
48,139，@react-dev-inspector/middleware 周下载量约 24,407。
React 生态中‘点击页面跳转至源码’的成熟实践参考
LocatorJS @locator/runtime npm 包周下载量约 87,800 次，@locator/babel-jsx 约
63,482 次，@locator/webpack-loader 约 15,691 次
源码定位与 DevTools 路线已在实际生态中得到广泛使
用
Frontman GitHub 页面约 579 颗星；GitHub 标题为 ‘The AI agent that lives in
your framework/browser’；官网定位为 ‘visual AI frontend editing’。
Star 不算最高，但其 browser/framework runtime
context 与 Inspector 方向高度相关
Tidewave tidewave npm 周下载量约 6,052；tidewave_phoenix GitHub 仓库获约
827 颗星；官方 Inspector 文档可访问，版本为 v0.5.6。
并非视觉编辑类主竞品，但提供从 UI 到日志、数据库
及框架元数据（framework metadata）的全栈上下
文参照。
Onlo 旁观 GitHub 页面获约 25,899 颗星标；YC 官网将其定位为‘Cursor for
Designers’；官方 Features 与 Pricing 页面均可正常访问。
社区关注度最高的项目之一，代表了 visual-first
code editor 路线，适合作为视觉编辑体验的参考
这些数据并不意味着产品一定成熟，但能说明每个竞品进入调研池都有外部依据：Inspector 是体验层面的主要对标对象；stagewise / Onlook 背靠活跃社区和 YC
背书；React Grab 验证了‘上下文切口’这一方向；源码定位类工具以 npm 下载量为佐证；Frontman / Tidewave 则分别补足了运行时能力和全栈上下文边界。

## 三、核心结论

核心结论 关键判断 证据 / 参考 对内部的启发
Inspector 是体验主对标 Inspector 的价值不在于‘可视化编辑’这一单
点功能，而在于将真实项目、页面元素选择、上
下文采集、Agent 修改、预览、代码写回及
Git/PR 流程串联成闭环。
Inspector 官
网、Quickstart、Chat、Visual
Editor、Source Control 文档
内部应重点学习完整工作流，而不
是只学 Chat、属性面板或某个单
点功能
Stagewise 是开源工作台
参考
stagewise 更像一个 agentic IDE：强项在于
Agent 工作区、浏览器上下文、diff 审查、多模
型 / BYOK 支持，以及代码变更管理。
stagewise 官网、GitHub、YC、Pricing 可学习 Agent 工作区与审查机
制，但不应将内部产品打造为重型
IDE。
React Grab 验证了轻量
级上下文采集的有效性与
价值。
AI 修改前端失败，往往并非不会写代码，而是无
法准确定位用户所指的 UI 元素。
React Grab 官网和 GitHub：复制任何 UI
element for your agent
第一阶段可优先验证‘选中元素 +
结构化上下文 + Agent 修改’这
一最小可行切口
源码定位类工具是底盘能
力
code-inspector、react-dev-inspector 和
LocatorJS 解决的是‘点击页面元素 → 定位对
应源码’这一问题，虽非完整竞品，但能力已相
当成熟。
GitHub stars、npm downloads、开源实
现
没有稳定的元素到源码映射，后续
Agent 修改很容易变成猜文件、猜
组件
Onlook 是视觉编辑的参
考方案，不是主产品路
线。
Onlook 更像是面向设计师的 visual-first 代码
编辑器，能力覆盖画布、属性面板、组件库和
Tailwind 编辑器。
Onlook 官网、GitHub、YC、Pricing 可参考视觉编辑体验和设计师心
智，但不能让产品主线偏向
builder / 低代码平台

Frontman / Tidewave
扩展上下文深度
上下文不应局限于 DOM 和源码位置，还可延伸
至路由、服务端日志、构建产物、数据库、框架
元数据及运行时内省信息。
Frontman（官网 /
GitHub）、Tidewave（官网 / 文档）
复杂业务系统最终需运行时与全栈
上下文支持，但应作为后续能力边
界，暂不纳入第一阶段。
code-first design tools
的关键门槛是正确性
code-first design 工具不能只追求“看起来像
Figma”，更核心的是是否真实、确定、清晰、完
整、可恢复
Inspector 官方博客用 Cursor Browser /
Design Sidebar 做压力样本，测试 89 个
场景，其中 43 个失败
评估竞品时，不能只关注功能覆
盖，更要重点考察：样式值是否真
实、操作结果是否确定、修改范围
是否清晰、错误是否可回滚。
其中，Inspector 官方博客《What it takes to make code-first design tools work》对本次调研尤其重要。它将 code-first design 工具的评价标准从“能力覆
盖”提升到“正确性、确定性、可信度”：
评价维度 含义 对内部竞品分析的影响
Truthful 工具展示的值必须与真实代码和 CSS 完全一致。 不能只关注界面是否美观，更要考察其是否如实反映代码状态。
Deterministic 同一个操作应产生可预期结果 AI 或视觉编辑不应让用户猜测结果。
Unambiguous 当前选中对象、样式来源、修改范围必须清楚 复杂业务页面尤其需要清晰的边界
Complete 修改不能只做表面效果，必须落实为稳定代码 视觉编辑必须和代码回写一致
Recoverable 错误修改需要可审查、可撤销 diff review 和 rollback 是信任基础
这也解释了为何 Inspector 并未简单打造一个‘可视化属性面板’，而是强调 selected element、runtime context、source mapping、agent workflow 及
Git/PR 集成——code-first design 工具必须将‘视觉操作’与‘真实代码’深度绑定，否则体验越流畅，误导风险越高。
来源：https://www.tryinspector.com/blog/code-first-design-tools
需注意，本文出自 Inspector 官方 blog，既包含事实线索，也带有厂商立场。本文将其作为‘正确性风险’的重要证据来源，但不将其单独作为判断 Cursor 产品
优劣的最终依据。正式决策前仍需要补充内部实测或第三方评价。

## 四、分析框架

竞品判断带着 7 个问题展开：
它解决的核心问题是
什么？
它服务的主要用户是
谁？
它的关键工作流是什
么？
它的核心能力壁垒是
什么？
它是否可信、正确、
可预测？
它的不足和边界是什
么？
对内部产品有什么启
发？
核心能力边界是什
么？是生成页面、编
辑页面、定位源码，
还是将 UI 上下文交
由 Agent 处理？
是开发者、设计
师、AI coding 用
户，还是团队协作
者？
用户从发现问题到完
成修改，中间经过哪
些步骤？
是浏览器上下文、源
码定位、Agent 集
成、视觉编辑，还是
Git/PR 流程？
code-first design
工具不能仅关注是否
提供控件，还需验
证：控件渲染是否真
实、交互行为是否确
定、状态表达是否无
歧义。
哪些场景它没有覆
盖，或不适合直接参
考？
哪些是必须学习的能
力，哪些只是参考，
哪些不应照搬？

### （一）核心能力维度

AI 前端可视化编辑工具的核心竞争力体现在六个关键能力维度。
能力维度 关注问题 为什么重要
上下文捕获深度 能否获取 DOM、组件树、源码位置、样式、Props/State、路由、日志及截图？ 核心在于判断 Agent 是否真正理解用户当前
所见的页面。
视觉编辑与意图识别 用户能否通过点击、拖拽、文本编辑或自然语言表达来修改意图？ 决定用户表达成本
视觉到代码转换质量 能否生成正确、可读、可维护、符合项目规范的代码 决定工具能否进入真实工程
代码可控性 是否支持 diff 预览、审查、回滚，以及 Git / PR 集成？ 决定开发者和团队是否敢于使用
工程化集成深度 是否接入本地开发环境、框架、构建工具、设计系统、CI/CD 决定落地成本
复杂业务处理能力 Agent 是否能理解状态、异步、数据绑定、权限控制、第三方组件以及后端日志？ 用于评估其是否适用于复杂业务系统。
单纯比较‘是否具备功能’不足以判断产品成熟度。一个工具即使具备视觉面板和 AI 聊天能力，但如果上下文理解浅、代码生成不可控、工程集成能力弱，也难以在
真实项目中提升生产力。

### （二）产品结构分析框架

仅看能力清单会低估 Inspector 这类产品的复杂度。真正需要拆解的是“用户在一个工作台里如何完成一次前端修改”。因此，后续将重点考察每个产品的以下 7
个结构性问题：
结构维度 需要观察什么 对判断的意义
主工作区 产品以浏览器、代码编辑器、画布、Chat 还是文件树为中心 它决定产品的核心心智：是设计工具、开发工具，还是 browser-first 工
作台？
页面与代码关系 页面元素如何映射到对应组件、源文件、行号及样式来源？ 这是决定 Agent 能否从‘看到 UI’真正实现‘改对代码’的关键环节。
上下文入口 用户如何把截图、元素、日志、文件、报错、路由加入任务 决定 AI 是否需要猜测
Agent 介入位置 Agent 是主入口、辅助执行者，还是外部 IDE 的上下文消费
者
决定产品采用完整闭环形态，还是作为插件能力提供
视觉编辑模型 是否支持属性面板、拖拽操作、文字编辑、样式调整和修改暂
存？
决定设计/产品角色能参与到什么程度
变更确认机制 是否有 staged
edits、diff、undo、reject、apply、commit、PR
这决定了该工具是否可信、是否可审查，以及能否被纳入团队开发流程。

工程接入方式 支持桌面 App、浏览器插件、dev server 中间件、CLI 覆盖
层及代码库集成。
用于评估部署成本、权限边界及内部落地难度。
这套框架的重要性远超‘功能多寡’；Inspector 的核心优势在于将浏览器、上下文、Agent、视觉属性编辑与 Git 变更统一整合至同一工作台——而多数竞品仅覆
盖其中某一环节。

## 五、核心竞品拆解

### （一）Inspector

官网：https://www.tryinspector.com/
文档：https://www.tryinspector.com/docs/quickstart

#### 定位

Inspector 是一款连接浏览器、前端代码库与 AI 编程 Agent 的可视化前端编辑器。

#### 关键工作流

1. 用户打开本地项目或 GitHub 仓库。
2. 连接 Claude Code、Cursor、Codex 或 Inspector Agent。
3. 在浏览器中打开真实页面。
4. 点击页面元素，系统将 selected element 加入上下文。
5. 用户描述修改意图。
6. Agent 修改代码。
7. 用户预览和应用改动。
8. 通过 Git / PR 流程提交。

#### 产品框架拆解

从实际界面截图看，Inspector 的核心不是一个聊天面板，而是一个围绕真实前端页面组织的工作台。页面可以拆成 5 个稳定区域：

区域 位置 作用 产品意义
浏览器导航区 顶部左侧 承载 URL 导航、前进/后退、刷新，以及当前 localhost 页面渲
染。
保留浏览器心智：让用户明确操作对象是正在真实运行的
页面。
项目 / 分支 / 发布区 顶部中间 显示分支（branch）、发布（Publish）、创建 PR（Create
PR）、提交更改（Commit Changes）。
将视觉修改和 Git 协作链路连接起来
页面预览区 左侧主体
内容
支持在真实业务页面上选中元素、滚动浏览及进行视觉验证。 页面不是预览图，而是可操作的画布，也是上下文的来
源。
右侧工作面板 右侧 Chat / Design 双模式切换 分别承载 Agent 修改和属性编辑
底部浮动工具条 页面底部 选择、评论、框选等视觉操作工具 提供类似设计工具的轻量操作入口
该框架的核心在于：左侧的真实页面始终是主工作区，右侧面板仅提供 Agent 调用、上下文支持和属性编辑能力。这和传统 IDE 以文件树 / 代码编辑器为中心的框
架不同。

#### Chat / Design 双模式

Inspector 右侧面板分为 Chat 和 Design 两种模式，分别解决不同类型的修改诉求：
Chat 模式 Design 模式
select-element.mp4 visual-editor-display.mp4
模式 用户意图 典型能力 产品价值
Chat “我想让 Agent 理解并修
改”
截图、日志、文件上下文、自然语言、Agent 执行、diff 适用于模糊需求、复杂修改或需 Agent 判断的场
景。
Design “我知道要改哪个视觉属性” Position、Layout、Appearance、Typography、Apply 适用于字号、间距、位置及样式的精细微调。
这说明 Inspector 不是完全依赖 AI Chat，也不是纯视觉设计器，而是把前端修改分成两条路径：
- 表达型修改：通过 Chat 让 Agent 理解并执行；
- 操控型修改：通过 Design 面板直接修改视觉属性。
这一设计值得关注：仅依赖 Chat 会导致修改不可控，而仅依赖 Design 模式则易退化为 Webflow / Figma 类编辑器。Inspector 的优势在于同时支持两种能力，
并通过代码回写与 review 机制统一收口。

页面预览区：Browser as Canvas
截图中左侧页面为真实的 localhost 项目运行页，而非静态截图或 mockup。页面预览区同时承担三类角色：
1. 编辑对象：用户可以选中页面元素，触发视觉编辑。
2. 上下文来源包括：DOM 结构、样式信息、页面截图、元素位置及源码映射，系统均可从页面中获取。
3. 验证环境：修改后可以直接在真实页面中看到结果。
因此，Inspector 的页面预览区可以理解为：
＞ 浏览器即画布：它既是视觉呈现的画布，也是上下文采集器与结果验证器。
上下文系统：Context as Bridge
Inspector 的上下文入口不止“选中元素”。从截图看，至少包括：
上下文
入口
Screenshot Tool 元素选择 / 左侧 Console Tool 文件 / 代码引用 文件列表浮层 Design 面板源码
路径
Diff 卡片

截图
出现位
置
Chat 空状态 Chat 空状态 /
Console Tool
Chat 空状态 输入框附近，例如
`RiskDetailSearc
hForm.tsx 94-
106`
输入框区域 例如 `parent /
RiskOverview.ts
x:91`
Agent 输出区
作用 用截图表达视觉问
题
明确告知
Agent：‘我要修改
的是哪个 UI 元
素’。
把日志加入 Agent
上下文
手动指定相关源码 从项目文件中选择
上下文
说明当前选中元素
和源码的关系
展示 Agent 修改
了哪些代码
这套机制可以概括为：
> Context as Bridge：把视觉问题、运行时信息、源码位置和 Agent 指令桥接起来。
对内部产品来说，上下文系统的设计甚至比 Chat 本身更重要。缺乏上下文时，Agent 只能猜测；上下文足够清晰时，Agent 才能稳定执行修改。
Agent 执行与 diff review
截图中的 Chat 面板并非普通聊天界面，而是
Agent 执行记录与代码审查面板，包含以下内
容：
这说明 Inspector 的 Chat 区承担三件事：
- 用户意图；
- Agent thinking；
- explored files
- 修改说明；
- 代码 diff；
- Open in Editor；
- Undo All / Keep All。
1. 输入任务；
2. 展示 Agent 执行过程；
3. 审查和确认代码修改。

这里的关键不在于‘AI 回复了什么’，而在于 AI 的操作是否可见、可审查、可撤销。

#### Design 面板与 Staged apply

Design 模式中，用户选中元素后，右侧
会展示：
它类似于 Figma / Webflow / DevTools Styles 的
混合体，但明显做了收敛：
- 当前元素类型，例如 `span`；
- 源码关系，例如 `Parent /
RiskOverview.tsx:91`；
- Position；
- Layout；
- Appearance;
- Typography
- Apply；
- undo / redo；
- 支持分阶段编辑（staged
edits），例如‘2 edits’。
- 不提供完整图层树；
- 不做完整 CSS 编辑器；
- 聚焦高频视觉属性
- 修改进入暂存状态；
- 需通过‘Apply’按钮确认后才写入变更；
- 与源码路径和页面选区绑定。
这说明 Inspector 的 Design 面板不是自由设计工具，而是 面向代码回写的属性修改器。

#### 信任机制

Inspector 的产品框架里有多层信任设计：
信任机制 对应表现
修改对象可见 页面元素选中框、源码路径
修改前状态可见 Design 面板展示当前属性
修改后暂存 `2 edits`、Apply
Agent 修改可审查 Chat 中展示 diff
错误可撤销 undo / redo、Undo All
修改可接受 Keep All、Apply
结果可发布 发布（Publish）、提交变更（Commit Changes）、创建 PR（Create PR）
代码可追溯 文件名、行号、Open in editor
这正对应 code-first design tools 的核心门槛：工具不仅要支持修改，还要让用户相信修改正确、清楚修改位置，并能在出错时快速恢复。

#### 可概括的三层结构

Inspector 的产品框架可以抽象成三层：
层级 说明
Browser as Canvas 真实页面既是画布，也是对象选择和结果验证的环境。
Context as Bridge 元素、截图、日志、文件、源码位置，将视觉问题桥接给 Agent
Change as Reviewable Patch 所有修改最终变成可审查、可撤销、可发布的代码变更
这三层结构比功能列表更能解释 Inspector 体验顺滑的原因：它并非将 Chat、设计面板和代码 diff 生硬堆叠，而是围绕‘在真实页面上完成一次修改’构建连续的
工作框架。

#### 做得好的地方

维度 表现
上下文获取 支持通过页面直接选择元素，降低用户描述成本。
体验闭环 支持从选中元素到修改代码、提交 PR 的完整链路。
Agent 生态 不强行替代 Cursor / Claude Code / Codex，而是作为视觉前端
非工程用户友好 通过页面操作，降低用户对代码和 Git 的认知负担。

#### 边界

- 当前公开信息侧重 React 项目中的精准代码定位能力；对复杂多框架场景的适配效果，仍需进一步验证。
- 属于闭源产品：可学习其交互体验，但难以直接复用其代码实现。
- 其对复杂企业后台、内部设计系统及私有权限环境的适配能力需实测验证。

#### 对内部的启发

Inspector 证明：浏览器中的“指物能力”是 AI 前端修改的关键入口。内部工具若要朝此方向发展，应优先学习其整体工作流，而非仅聚焦于某个功能点。
该判断源自 Inspector 官方 blog 的补充说明
Inspector 的 blog 不是在单纯宣传功能，而是在定义 code-first design tools 的质量门槛。它对 Cursor Browser / design sidebar 方式的批评，本质上强调：
视觉编辑必须真实反映代码，修改必须确定、完整且可恢复。
这表明，Inspector 的定位不仅是‘让 AI 修改前端更便捷’，更是构建一种可信的 code-first design 工作流。对内部产品来说，这个判断比功能列表更重要。

### （二）Cursor Browser / design sidebar

来源：
- Cursor Browser Visual Editor：https://cursor.com/cn/blog/browser-visual-editor
- Cursor Browser 文档：https://cursor.com/cn/docs/agent/tools/browser
- Cursor 2.2 更新日志：https://cursor.com/cn/changelog/2-2
- Inspector code-first design tools blog：https://www.tryinspector.com/blog/code-first-design-tools
- 用户提供的 Cursor 最新界面截图，核验时间：2026-06-11

#### 定位

Cursor Browser / design sidebar 是 Cursor 在 AI IDE 中加入的 code-first 视觉设计能力。它代表的不是 browser-first 的独立工作台，而是‘IDE 内置真实
浏览器 + 视觉编辑侧栏 + Agent 代码修改’的技术路线。
Cursor 官方博客对该能力的叙事重点并非‘打造一个类似 Figma 的面板’，而是将 Web 应用、代码库与视觉编辑工具整合至同一窗口：用户可通过拖拽、控件操
作和点选提示表达意图，再由 Agent 定位相关组件并更新底层代码。这一定位对本次调研至关重要：它表明，视觉编辑正从独立的设计工具能力，演变为 AI
coding workflow 中的一层意图表达界面。

#### 为什么纳入分析

它不是本次最主要竞品，因为内部方向更接近浏览器侧的视觉工作台，而不是完整 IDE。但它必须纳入分析，原因有三点：
1. Cursor 是 AI 编程领域的高心智占有率入口：它将视觉化编辑能力集成至 IDE，印证了‘写代码的工具也需要真实页面操作能力’这一趋势。
2. Cursor 官方已将设计侧边栏、组件 props、视觉控件、设计 token、主题测试及 Agent 应用修改纳入 Browser 能力，表明这并非边缘实验。
3. Inspector 官方博客反向将 Cursor 作为正确性评测样本，暴露了 code-first 视觉编辑从‘能操作’到‘可信任’之间的鸿沟。

因此，Cursor 在报告中的角色应是‘强参考 + 风险样本’，而非单纯的负面反例。

#### 界面观察

从最新截图看，Cursor Browser / Design Sidebar 的实际界面已经比较完整，但产品气质仍然偏工程化。它并非仅为非工程用户提供‘可视化搭建面板’，而是在
IDE 中构建了一套面向真实页面、DOM/Component 树、CSS 属性及 Agent 执行过程的视觉调试层。
截图 观察 说明 产品判断
页面中被选中的元
素带有蓝色描边及
标签。
选中 canvas、div.toft-progress、h4.aiCard__ 等元素时，页面直接
显示选中边框和元素标签
“指物”反馈明确，能降低用
户描述 UI 位置的成本
右侧有
Components 树
树中展示 div.aiCard__dimRow、span.aiCard__dimName、canvas
等节点，并可展开层级
Cursor 当前更像 DOM / 组
件结构检查器；对工程师友
好，但对产品 / 设计用户仍
偏技术化
Design / CSS 双
标签并存
Design 标签页提供
Position、Layout、Dimensions、Padding、Margin、Appearance
、Text 等配置项；CSS 标签页则展示 background-
color、border、border-radius、box-sizing 等原始 CSS 属性。
同时覆盖‘可控参数’和
‘真实 CSS’，有助于提升可
信度，但也暴露了较高的工
程理解门槛。
顶部有编辑、撤
销、Apply
修改不会立即被视为最终结果，而是进入一个待应用状态。 这是一种轻量级 diff 心智：
视觉编辑需支持暂存、撤销
与确认，而非直接修改源
码。

Composer 中出
现已选元素 Chips
底部输入区会显示 `<canvas>`、`<section>`、`<div>` 等被选中的
HTML 元素标记。
Cursor 把页面选择结果作为
Agent prompt 的上下文输
入，而不是只依赖自然语言
右侧 Agent 面板
保留执行记录和审
批
可观察到启动服务、检查端口、curl 检测、等待审批、运行/停止等操作。 Browser 不是孤立的视觉工
具，而是 Agent 工具链的一
部分，视觉编辑、终端、审
批在同一工作流里
Cursor 的视觉编辑并非‘设计师版 Figma’，而是‘开发者 IDE 中的页面操作与样式调试增强功能’。它对内部方向的参考价值主要体现在交互链路设计与工程控
制能力上，而非直接照搬其面板形态。

#### 产品设计拆解

设计层 Cursor 的做法 产品判断 对内部的参考价值
入口形态 在 IDE 内打开 Browser，把浏览器窗口作为
Agent 可观察、可操作的上下文
入口天然贴近开发者，不需要用户离
开代码环境
如果内部面向设计 / 产品 / 运营同学，不能照搬 IDE
入口，但可以学习『真实页面就是操作对象”
交互方式 支持拖拽 DOM 元素重排、选择元素后调整样
式、点选元素后用自然语言描述修改
降低了用户‘说清 UI 位置与意图’
的成本
内部工具也应以‘点选对象 + 表达意图’为核心交
互，而非仅让用户编写 prompt
组件理解 官方强调可在侧边栏暴露 React props；最新
截图中已可见 Components 树，以及 DOM
和 class 层级结构
Cursor 同时覆盖组件语义和 DOM
结构，但真实界面仍保留较强开发者
调试心智
对复杂业务组件来说，状态 / props / variant 比单纯
的 CSS 属性更接近真实设计问题；如果面向非工程用
户，需要把 DOM class 翻译成业务语义
样式控制 支持通过滑块、调色板、颜色 Token、设计系
统及布局控件调整样式属性，同时保留原始
CSS 属性的查看能力。
属性面板不是目的，目的是把常见视
觉意图变成可控输入；CSS 选项卡则
提供真实性校验
内部可优先支持高频样式调整：间距、尺寸、颜色、圆
角、排版、Flex/Grid 布局及主题；同时保留‘查看真
实 CSS’作为可信出口。
Agent 执行 视觉调整满意后，点击‘应用’，由 Agent 自
动定位对应组件并更新代码。
Cursor 将可视化操作视为 Agent 的
输入，而非最终输出。
内部需要明确“视觉态只是草稿，代码 diff 才是交付
物”
多智能体 支持选中多个元素，并通过文字描述进行修改；
多个 Agent 可并行运行。
适合批量局部修改，但也会放大审查
压力
若支持并行修改，则需配套提供 diff 分组、影响范围
说明及失败回滚机制。
工程化控制 Browser 文档覆盖控制台日志、网络流量、截
图、会话持久、安全审批、企业 allowlist
Cursor 将浏览器视为 Agent 工具链
的一部分，而不仅是一个设计工具。
若内部产品进入企业环境，权限管理、审批流程、站点
白名单及日志可见性将很快成为刚需。

#### 关键产品判断

Cursor 的设计价值在于：它将‘视觉编辑’重新定义为 AI IDE 中的意图采集层。
用户看到真实页面 → 选中具体元素 → 通过拖拽、控件或 prompt 表达修改意图 → Agent 理解上下文 → 生成代码变更 → 热更新验证。

该链路的优势在于低摩擦：用户无需先定位文件、组件或 class，也无需将 UI 问题抽象为文字需求，而是可直接在页面上选中元素，交由 Agent 处理。对前端代码
修改类工具而言，该能力比单纯增强聊天（Chat）功能更具价值。
但其产品风险也很明显：一旦视觉面板展示的值不真实，或 Agent 应用的代码与用户刚看到的视觉状态不一致，用户将迅速失去信任。Cursor 的路线越强调‘即时、
直观、低门槛’，就越需要在背后强化正确性、可解释性与可恢复性。
和 Inspector 的差异
维度 Cursor Browser / design
sidebar
Inspector 对内部路线的判断
产品载体 AI IDE 浏览器中的前端视觉编辑工作台 若需服务非纯工程背景用户，Inspector 应延续‘以浏览器
为第一心智’的设计原则。
用户默认心智 我在写代码，同时看页面 我在页面中发现问题，并让工具自动修改对应
代码。
内部应优先满足‘看页面→提修改’这一用户心智。
视觉编辑角色 IDE Agent 的一种输入方式 主工作流入口之一 可借鉴 Cursor 的意图表达能力，但主界面无需 IDE 化。
代码修改闭环 Agent 在代码库中应用修改 Inspector 强调从选中元素到 Git / PR 的完
整链路
需要保留代码 diff、审查、撤销、PR，而不是只做页面的即
时变化
风险重点 视觉状态和代码事实可能脱节 强调正确性、确定性、可恢复性 内部评估时要把“可信任”作为一级指标

#### 暴露的问题

根据 Inspector Blog 的测试，Cursor Browser / Design Sidebar 的关键问题在于“正确性”，而非“功能缺失”。
问题类型 影响
面板值与真实 CSS 不一致 用户无法信任工具展示
操作后没有真实落到代码或页面 视觉反馈和代码事实脱节
复杂 transform / layout 处理失败 高级布局编辑不可靠
控件状态歧义 用户不知道当前修改范围
部分实现 看起来改了，但代码不稳定或不完整
证据来源：以上问题出自 Inspector 官方 blog，可作为 code-first design 工具的风险清单参考，但不宜作为对 Cursor 的完整竞品评估。若要形成产品级判断，
需要补充同一套场景下的内部复测，尤其是本地项目、复杂业务组件、内部设计系统、多主题和真实 Git diff 场景。

#### 对内部的启发

这类问题提醒我们：code-first design tool 的最大风险并非‘不够智能’，而是‘不够可信’。内部竞品分析不能仅关注是否具备视觉面板、拖拽能力或 AI 聊天功
能，还需考察以下维度：
- 面板显示是否真实；
- 操作结果是否确定；
- 修改范围是否清晰；
- 代码 diff 是否可审查；
- 错误能否回滚。
更具体地说，Cursor 给内部方向的启发可以拆成下面几项：
可学习点 为什么重要 内部落地建议

点选元素后再表达意图 降低 prompt 描述成本，也减少 Agent 猜错对象的机会 将元素选择、DOM/组件上下文、截图及源码位置一并打包发送给
Agent
视觉控件承接高频修改 间距、颜色、尺寸、布局等修改，并非都适合仅用自然语言表
达。
第一阶段优先实现少量高频、确定性强、可快速回滚的控件，不追
求完整 Figma 化。
Components 树需要语
义化
Cursor 截图中的节点多为 div、span、class 名和
canvas，工程师能读懂，但非工程用户理解成本高
内部若面向设计 / 产品同学，应把 DOM 节点翻译成“风险雷达
图”、“风险维度评分条”、“供应商标题区域”等业务语义
Design 与 CSS 要分层 Design tab 适用于常见视觉调整，CSS tab 适用于真实性校
验；两者混用会增加认知负担。
默认展示语义清晰的控件；高级用户可展开查看真实 CSS 或计算
后的样式，避免初始界面暴露全部实现细节。
暂存修改意图 截图中的 ‘1 Edit’、‘Undo’、‘Apply’ 表明：视觉编辑需
先生成待确认的变更。
内部应将修改流程划分为‘页面预览态 → 待应用变更 → 代码
diff → 提交 / PR’四个阶段，避免用户误以为页面变化即等于代码
已交付。
React Props / 状态暴露 企业后台的大量问题源于组件状态和变体层，而不仅限于
CSS。
对内部组件库建立 props、variant、token 的结构化识别
设计 token 接入 缺乏 token 限制时，视觉编辑容易引发设计系统漂移。 样式修改默认优先推荐设计 Token（如颜色 Token、间距
Token），而非任意色值或固定像素值。
Agent 直接修改代码，而
非仅调整页面渲染效果。
页面临时态本身不产生交付价值，必须最终落地到代码库。 视觉变更需生成 diff，明确影响范围，并支持用户选择应用或放
弃。
浏览器调试上下文 控制台、网络面板、截图与热更新等功能，可帮助 Agent 判
断修改是否生效。
后续可接入 runtime 日志、控制台错误（console error）及网络
错误（network error），以增强复杂问题的诊断与处理能力。
最终判断：Cursor 证明了‘AI 编程工具正在主动整合部分视觉编辑能力’。但对内部产品而言，更合理的路径并非打造另一个 Cursor，而是在 browser-first 工
作台中吸收 Cursor 的低门槛意图表达能力，并通过 Inspector 式的正确性保障、审查机制与 Git 闭环来建立用户信任。

### （三）React Grab

官网：https://www.react-grab.com/
GitHub：https://github.com/aidenybai/react-grab 补充来源：用户提供的 React Grab 最新界面截图，核验时间：2026-06-11

#### 定位

React Grab 是一个轻量级 UI-to-Agent 上下文工具：它的核心目标并非构建完整工作台或视觉编辑器，而是专注解决一个非常具体的问题——
当用户说‘改这个 UI’时，Agent 是否真正理解‘这个’所指的具体元素？
它的产品主张很直接：让用户复制任意 UI 元素给 Agent。截图中的示例很典型：用户让 Agent “把 submit button 变大”，Agent 在代码库中搜索失败；加入
React Grab 提供的元素上下文后，Agent 成功定位到 span、collapsible.tsx 及具体行号，进而完成修改。

#### 三个功能拆解

从截图看，React Grab 的优势不在于复杂工作台，而在于将能力浓缩为三项轻量功能：

功能 截图表现 解决的问题 产品判断
选中 UI 元素
并复制上下
文
页面元素以紫色边框高亮，浮层显示当前节点类型（如
div）；官网文案强调 ‘copy any UI element for your
agent’。
让 Agent 不再依赖关键词盲搜，而
是直接获取用户所指向的真实元素。
这是 React Grab 的核心价值，也是最小
可用切口
为选中元素
补一句上下
文
浮层中有 Add context 输入框和发送按钮 用户可将‘我要怎么改’绑定到具体
UI 元素上，而非撰写脱离页面对象
的泛化提示。
将‘指物’与‘表达意图’合二为一，可
降低 Agent 误识别目标对象的概率。
支持轻量级
属性查看与
微调。
属性浮层显示 background、text color、font
size、width、height、fill、display 等，并有 Copy 按钮
让用户看到元素关键样式和尺寸，并
可把这些信息复制给 Agent
它并非完整的 Design 面板，而是一个极
简 inspector；是否将修改直接写回代
码，需进一步实测验证。
这三个功能共同形成了一个很轻的链路：
选中页面元素 → 添加修改意图 → 复制该元素的上下文（如样式、源码等）→ 提交给 Cursor / Claude Code / Copilot / Codex 等外部
Agent。
它的特点是“不抢主工作区”，用户仍然在自己的浏览器、IDE 和 Agent 工具里工作，React Grab 只在需要指向 UI 的时候浮出来。

#### 产品框架拆解

结构维度 React Grab 的表现 产品意义
主工作区 仍然是用户自己的浏览器页面 不改变用户原有开发环境
页面与代码关系 从选中元素反向推导出其对应的节点、组件、文件路径及行号。 解决“AI 不知道改哪里”的前置问题
上下文入口 hover / select / add context / copy 上手成本极低，无需掌握完整产品逻辑。
Agent 介入位置 Agent 在外部工具中执行 React Grab 是上下文供应器，不是 Agent 工作台
视觉编辑模型 仅提供轻量级的属性查看与微调功能，不支持完整的视觉编辑。 避免陷入复杂编辑器问题
变更确认机制 依赖外部 IDE / Agent 的 diff 自身不解决代码信任闭环
工程接入方式 `npx grab@latest init`，并提供 CLI、Prompt、Next.js、Vite、TanStack Start 等
初始化入口。
接入心智轻，适合快速验证 UI-to-Agent context
价值
React Grab 的启示很直接：即使不构建完整的 Inspector，只要能将‘该 UI 元素’的完整上下文准确传递给 Agent，就能显著降低 AI 驱动的前端修改失败率。
它的价值恰恰来自克制：不做 Git、不做 PR、不做完整属性面板、不做 Agent 工作区，只做 UI context。

#### 关键工作流

1. 用户在页面中悬停或选中某个 UI。

2. 工具用高亮框确认选中对象，并显示节点类型。
3. 用户可以补充一句自然语言上下文，例如“把这个按钮变大”。
4. 工具自动收集页面元素、组件、源码位置、DOM 结构及样式等上下文信息。
5. 用户将上下文复制到 AI 编程工具中。
6. 外部 Agent 根据上下文定位文件并修改代码。
7. 用户回到 IDE 或页面验证。
该流程虽缺少闭环，但将最关键的第一步做得足够聚焦、清晰。

#### 做得好的地方

维度 表现
切口清晰 不打造完整产品，仅聚焦于 UI 到 Agent 的上下文构建（UI-to-Agent context）。
使用成本低 通过 hover、select、add context、copy 等方式操作，流程轻量。
问题抓得准 解决‘AI 无法准确定位用户所指 UI 元素’的问题。
心智简单 用户无需学习新工作台，只需将页面元素交由现有 Agent 处理。
接入轻量 仅需一条初始化命令即可启动，无需强制配置。迁移开发环境

#### 值得学习的结构点

结构点 为什么值得学
轻量入口 内部工具不一定一开始就要完整桌面化，可以先做上下文采集层
选中即上下文 用户只要指向页面元素，系统就应自动补齐 DOM、组件、文件、行号、样式等信息
Add context 指物之后再补一句意图，比单纯 prompt 更准确
上下文模板 给 Agent 的内容需要结构化，而不是只复制 DOM
不替代现有工具 可以和 Cursor、Codex、Claude Code 共存
明确边界 只做 context，反而容易把价值讲清楚

#### 边界

- 不提供完整视觉编辑闭环。
- 不强调代码变更审查和 Git/PR 流程。
- 更像效率插件，不是独立生产工作台。
- 属性浮层很轻，不适合承载复杂设计系统、组件状态和批量修改。
- 对非 React、复杂内网组件、低代码平台生成页面的适配程度需要实测。

#### 对内部的启发

React Grab 的价值在于提醒我们：不要一上来追求大而全。先把“UI 元素上下文”这件事讲清楚，就已经能显著提升 AI 修改准确率。
对内部场景来说，可以学习它的轻量路径，但把上下文做得更懂业务：
内部可增强点 说明
业务语义 不只告诉 Agent 这是 div，还要告诉它这是“风险评分卡片”“供应商标题区”“维度评分条”

设计系统 token 把色值、字号、间距映射到内部 token，避免 Agent 生成漂移样式
组件和文件关系 结合内部组件库、路由和源码定位，让 Agent 更稳定地找到修改位置
权限和状态上下文 对复杂后台来说，当前页面状态、权限、接口数据也可能影响 UI 修改
后续闭环 React Grab 只做 context，内部产品可以在此基础上接 diff review、Apply、PR
一句话总结：React Grab 是最适合做第一阶段验证的参照。它不证明“完整工作台一定成立”，但证明“选中 UI + 结构化上下文 + 外部 Agent”这个极轻链路本
身就有价值。

## 六、横向能力对照

### （一）产品角色速览

这些产品不应被放在同一个“谁更强”的线性排序里。更准确的看法是：它们分别站在不同的产品结构位置上。
产品 / 项目 在本报告中的角色 关键价值 边界
Inspector 体验终局对标 最完整地串起真实页面、上下文、Agent、视觉编辑、diff
和 Git / PR
不适合第一阶段完整复刻
React Grab 第一阶段 MVP 主参照 用最轻方式验证“选中 UI + 结构化上下文 + 外部
Agent”
缺少修改闭环
Cursor Browser / design
sidebar
IDE 内置视觉编辑参考 / 风险
样本
证明 AI IDE 正在吸收视觉编辑能力 需要重点警惕正确性和可信度
stagewise 开源工作台参考 Agent 工作区、文件探索、diff review IDE 化较重，不决定产品主心智
Frontman / Tidewave 上下文深度参考 runtime、logs、DB、framework metadata 适合作为后续复杂业务能力边界
Onlook 视觉编辑体验参考 画布、属性面板、设计师心智 容易滑向 builder / 设计器
源码定位类 底盘能力参考 DOM / 组件到源码文件和行号 不是完整 AI 修改产品

### （二）关键维度不是“有无功能”，而是“能否形成可信修改”

如果只看功能覆盖，很多产品都会显得相似：都有浏览器、都有选择元素、都有 AI、都有编辑入口。但从 code-first design tools 的角度，真正拉
开差距的是：
深层维度 说明 为什么重要
真实上下文 能否拿到用户实际看到的 DOM、样式、截图、运行状态 AI 不能只靠源代码猜 UI
源码映射 能否把视觉元素稳定映射到代码位置 关系到修改是否可落地
样式可信度 面板值是否等于真实 CSS / 组件属性 关系到用户是否敢用
修改确定性 同一操作是否产生可预测结果 关系到工具是否可靠
代码完整性 是否生成稳定、可维护代码，而非表面 patch 关系到能否进入生产流程
审查与恢复 是否能 review、reject、rollback 关系到组织级使用信任
因此，本报告不按“产品强弱”排序，而是按能力位置判断：Inspector 给终局体验，React Grab 给第一阶段切口，源码定位类给底盘，Frontman / Tidewave
提醒上下文深度，Onlook 只补充视觉编辑体验。

## 七、对内部方向的启发

内部不应直接复刻完整 Inspector。更稳妥的路径是先验证轻量上下文层，再逐步补齐浏览器工作台和复杂业务上下文。

### （一）推荐路线

阶段 切口 对标参考 判断
第一阶段 页面元素选择 + DOM / 样式 / 源码上下文 + Agent 修改 React Grab、源码定位类 优先验证“AI 是否因为上下文更准而改得更
准”
第二阶段 Browser-first 修改闭环，加入预览、diff、撤销、MR Inspector 在第一阶段成立后，再补完整工作流
第三阶段 接入设计系统、业务语义、权限、路由、日志、接口上下文 Frontman、Tidewave 面向复杂后台和内部真实业务场景

推荐判断：第一阶段主参照应是 React Grab，而不是 Inspector 的完整工作台。第一版目标可以收敛为一句话：用户指哪里，AI 就知道改哪里，并能安全改回来。

### （二）第一阶段验证

验证项 判断标准
点选元素 能稳定拿到 DOM、文本、样式、选择器、组件 / 文件线索
Agent 修改 相比纯 prompt，修改命中率明显提升
预览与回退 用户能看到改了什么，并能撤销
试点范围 先选 1-2 个真实 HTML / 简单前端页面，不用 demo 项目做唯一样本
第一阶段暂不做完整 Git / PR、多项目管理、复杂权限、全栈日志、数据库上下文和完整设计器属性面板。

### （三）关键风险

风险 应对
正确性风险 优先验证源码定位、真实样式读取、diff 可审查
工程接入风险 用真实业务页面试点，避免只在干净 demo 中验证
产品边界风险 坚持“AI 修改真实页面 / 代码”，不滑向低代码平台或完整设计器
组织采用风险 先让开发者可审查，再逐步降低设计和产品参与门槛
内部机会在于外部工具难以覆盖的公司环境：私有代码、内部组件库、设计系统 token、复杂后台语义、权限状态和组织级 MR / CI / 审计链路。

## 八、其他参考

### （一）StackBlitz / WebContainers

官网：https://stackblitz.com/
StackBlitz 的核心价值是浏览器内完整开发环境。它提示我们：未来 code-first design tools 不一定完全依赖用户本地环境，也可以在浏览器沙箱中运行
Node.js、依赖安装和 dev server。
对本方向的启发：
- 降低本地环境配置成本；
- 提供隔离、可控的运行环境；
- 便于多用户共享同一开发上下文；
- 为云端 Agent 操作前端项目提供基础设施。
但它不是视觉编辑或 Agent 修改工具，更多是运行环境基础设施。

### （二）Builder.io

官网：https://www.builder.io/
Builder.io 代表的是设计系统、视觉开发和代码集成路线。它的价值不是 Agent，而是长期解决“设计系统与生产代码如何同步”。
对本方向的启发：
- 视觉编辑不能脱离组件库和设计系统；
- 生产级代码质量比页面生成速度更重要；
- 设计系统约束需要成为工具的一等上下文。
但 Builder.io 更偏 visual development platform，不是 Inspector 式 browser-aware coding agent。

### （三）Replay.io

官网：https://www.replay.io/
Replay.io 的时间旅行调试能力说明：运行时上下文不只包括“当前页面状态”，还可以包括一段时间内的执行过程。

对本方向的启发：
- Agent 调试复杂 bug 时，仅靠当前 DOM 不够；
- 时间序列、事件、异步调用、状态变化也可能成为关键上下文；
- 未来前端 AI 修改可能从“改 UI”延展到“理解问题发生过程”。
Replay.io 更偏调试和 Agentic Debugging，不是视觉编辑工具。

### （四）Windsurf / Devin Desktop

官网：https://codeium.com/windsurf
Windsurf / Devin Desktop 代表 Agent 原生 IDE 方向。它们强调代码库上下文、Agent 任务管理、diff review 和多 Agent 协作。
对本方向的启发：
- AI 工具的竞争正在从单次生成走向 Agent 工作流；
- 代码审查和任务委托会成为组织级使用的核心；
- 视觉上下文工具需要和 Agent 原生 IDE 形成互补，而不是简单替代。

### （五）Puck / Webstudio / GrapesJS

这些产品代表可视化搭建器 / builder 路线。它们对设计系统和组件化编辑有参考价值，但和 Inspector 的核心问题不同。
对本方向的启发：
- 可视化编辑必须尊重组件边界；
- 设计系统组件可以作为编辑和生成的约束；
- 但如果过度走 builder 路线，容易偏离“修改真实代码库”的核心问题。

## 九、商业和价值

商业化策略不是核心讨论对象，但价格、版本和企业能力可以作为方向价值的外部信号。
产品 价格 / 商业信号 说明
stagewise Pro 20 美元/月，Ultra 200 美元/月 Agentic 前端工作流已具备付费意愿
Onlook Team / Enterprise custom pricing 真实代码视觉编辑具备团队价值
Cursor Team 40 美元/user/月，Enterprise custom AI coding 已进入团队预算
v0 Team 30 美元/user/月，Business 100 美元/user/月 AI UI 生成具备高客单价
Claude Pro / Max / Team 多档 AI 编码能力已是持续性投入
这些价格说明：市场不是只为“生成代码”付费，而是为更高质量的 AI 开发上下文、团队协作、安全治理和真实代码工作流付费。

## 十、调研结论

1. 本方向成立，核心价值是补齐 AI 前端修改中的视觉和运行时上下文。
2. Inspector 是最直接的体验对标，重点学习完整工作流。
3. stagewise 是开源工作台参考，但不应照搬其 IDE 化形态。
4. React Grab 是第一阶段最重要的 MVP 参照，证明 UI context 对 Agent 很关键。
5. 源码定位类项目是底层能力参考，应单独研究。
6. Onlook 是视觉编辑路线参考，但不是第一竞品。
7. Cursor Browser/design sidebar 说明 IDE 正在内置视觉编辑能力；同时，其风险样本也提醒我们，code-first design 工具的关键不是“看起来能编辑”，
而是正确、确定、可信。

8. 内部工具的机会在于更贴合私有代码、设计系统、复杂后台和组织流程。
附：参考资料
- Inspector 官网：https://www.tryinspector.com/
- Inspector Blog - Code-first design tools：https://www.tryinspector.com/blog/code-first-design-tools
- Inspector Quickstart：https://www.tryinspector.com/docs/quickstart
- Inspector Chat：https://www.tryinspector.com/docs/using-inspector/chat
- Inspector Visual Editor：https://www.tryinspector.com/docs/using-inspector/visual-editor
- Inspector Publishing：https://www.tryinspector.com/docs/using-inspector/source-control
- Inspector YC：https://www.ycombinator.com/companies/inspector
- stagewise 官网：https://stagewise.io/
- stagewise GitHub：https://github.com/stagewise-io/stagewise
- stagewise Pricing：https://stagewise.io/pricing
- stagewise YC：https://www.ycombinator.com/companies/stagewise
- Frontman 官网：https://frontman.sh/
- Frontman GitHub：https://github.com/frontman-ai/frontman
- Tidewave 官网：https://tidewave.ai/
- Tidewave Inspector 文档：https://hexdocs.pm/tidewave/inspector.html
- Tidewave Security 文档：https://hexdocs.pm/tidewave/security.html
- Tidewave JS GitHub：https://github.com/tidewave-ai/tidewave_js
- Tidewave Phoenix GitHub：https://github.com/tidewave-ai/tidewave_phoenix
- React Grab GitHub：https://github.com/aidenybai/react-grab
- React Grab 官网：https://www.react-grab.com/
- code-inspector GitHub：https://github.com/zh-lx/code-inspector
- react-dev-inspector GitHub：https://github.com/zthxxx/react-dev-inspector
- LocatorJS：https://www.locatorjs.com/
- Onlook GitHub：https://github.com/onlook-dev/onlook
- Onlook Pricing：https://www.onlook.com/pricing
- Onlook YC：https://www.ycombinator.com/companies/onlook
- StackBlitz：https://stackblitz.com/
- Builder.io：https://www.builder.io/
- Replay.io：https://www.replay.io/
- Windsurf：https://codeium.com/windsurf
- Puck：https://puckeditor.com/
- Webstudio：https://webstudio.is/
- GrapesJS：https://grapesjs.com/
- Cursor Pricing：https://cursor.com/pricing
- v0 Pricing：https://v0.app/pricing
- Bolt Pricing：https://bolt.new/pricing
- Claude Plans：https://support.claude.com/en/articles/11049762-choose-a-claude-plan
- npm downloads API：https://api.npmjs.org/downloads/
