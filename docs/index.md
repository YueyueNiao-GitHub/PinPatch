---
layout: home

hero:
  name: PinPatch
  text: 产品需求文档
  tagline: 把"页面上的这个问题"变成 AI 能理解的结构化上下文，让 AI 少猜目标、少改错范围、少返工。
  actions:
    - theme: brand
      text: 阅读 PRD 正文
      link: /prd
    - theme: alt
      text: 查看当前流程痛点
      link: /prd#_1-2-当前流程

features:
  - title: 点选即反馈
    details: 在 localhost 预览页悬停、选中元素，留下绑定到具体 DOM 的反馈，不再靠"这里""那个按钮"指代。
  - title: 结构化上下文
    details: 自动采集目标元素、页面现场、样式事实、组件和源码线索，生成稳定 JSON / Markdown 标注协议。
  - title: 本地优先
    details: 标注和历史默认本地保存，不默认上传截图、DOM、源码路径或用户反馈。
  - title: 只标注不写回
    details: 第一阶段明确不做自动写回源码，信任边界清晰，避免把定位验证污染成撤销/diff 工程。
  - title: Chrome 插件形态
    details: Manifest V3 content script 注入，业务项目零侵入，无需安装 npm 包或改构建配置。
  - title: 智能体可消费
    details: 标注协议字段稳定，缺失字段显式标注 unknown，智能体适配器和 MCP 在后续阶段接入。
---
