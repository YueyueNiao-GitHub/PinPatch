# PinPatch Chrome Extension

正式的 Manifest V3 浏览器插件。插件复用已确认的原型界面和交互，通过隔离后的样式注入本地开发页面。

## 构建

```bash
cd packages/pinpatch-extension
npm run build
```

在 `chrome://extensions` 开启开发者模式，选择“加载已解压的扩展程序”，加载 `packages/pinpatch-extension/dist`。

商店上传包为 `packages/pinpatch-extension/pinpatch-extension-1.0.0.zip`，压缩包根目录直接包含 `manifest.json`。

插件固定 ID 为 `iijgjngfnmoipgheplhgoiighnmggfio`。加载后打开任意 `localhost`、`127.0.0.1`、`[::1]` 页面即可使用。若需标注本地 HTML，请在扩展详情中开启“允许访问文件网址”，再刷新页面。

插件主入口为页面右下角的悬浮工具栏。点击浏览器工具栏图标时，可用页面会直接进入标注状态；仅在页面不支持或插件尚未加载时显示提示。

## 数据流

```text
页面元素 -> PinPatch 标注层 -> 结构化留言 -> 用户复制到编码 Agent
```

- 标注按页面路径保存在当前站点的 `localStorage`，不同页面互不串数据。
- 支持复制单条留言、全部待处理留言或当前页面全部留言。
- 复制内容包含标注时页面现场、元素语义与状态、唯一性验证后的定位候选、关键计算样式、修改差异和留言线程。
- 优先读取页面显式提供的组件/源码信息，并通过只读页面桥接在开发模式下尝试补充 React、Vue 元数据；无法识别时明确标记为 `unknown`。
- 不采集输入框或富文本编辑区的当前内容，页面文本和属性会标记为未信任上下文。
- 处理状态由用户在页面中手动标记解决或重新打开。
- 页面样式不会被插件的 reset、字体或组件样式污染。

## 1.0 功能

- 页面元素标注与样式详情
- 可视化调整与临时预览
- 评论管理、补充、删除和恢复
- 单条/批量复制结构化留言
- 手动标记解决与重新打开
