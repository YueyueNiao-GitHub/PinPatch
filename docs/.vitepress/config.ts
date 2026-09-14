import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'PinPatch',
    description: 'PinPatch 产品文档',
    lang: 'zh-CN',
    srcExclude: ['archive/**'],
    lastUpdated: true,
    cleanUrls: true,
    ignoreDeadLinks: true,

    themeConfig: {
      nav: [
        { text: '首页', link: '/' },
        { text: 'PRD 正文', link: '/prd' },
        { text: '标注协议', link: '/prd#_9-标注协议' },
        { text: '阶段计划', link: '/prd#_11-阶段计划' }
      ],

      sidebar: [
        {
          text: '文档',
          collapsed: false,
          items: [
            { text: '首页', link: '/' },
            { text: 'PRD 正文', link: '/prd' }
          ]
        },
        {
          text: 'PRD 章节',
          collapsed: false,
          items: [
            { text: '1. 需求背景', link: '/prd#_1-需求背景' },
            { text: '2. 用户痛点', link: '/prd#_2-用户痛点' },
            { text: '3. 调研结论与立项判断', link: '/prd#_3-调研结论与立项判断' },
            { text: '4. 产品目标与成功指标', link: '/prd#_4-产品目标与成功指标' },
            { text: '5. 需求范围', link: '/prd#_5-需求范围' },
            { text: '6. 用户场景与主流程', link: '/prd#_6-用户场景与主流程' },
            { text: '7. 方案设计', link: '/prd#_7-方案设计' },
            { text: '8. 功能需求', link: '/prd#_8-功能需求' },
            { text: '9. 标注协议', link: '/prd#_9-标注协议' },
            { text: '10. 技术方案', link: '/prd#_10-技术方案' },
            { text: '11. 阶段计划', link: '/prd#_11-阶段计划' },
            { text: '12. 风险与缓解', link: '/prd#_12-风险与缓解' },
            { text: '13. 开工清单', link: '/prd#_13-开工清单' },
            { text: '14. 待确认问题', link: '/prd#_14-待确认问题' },
            { text: '15. 最终判断', link: '/prd#_15-最终判断' }
          ]
        }
      ],

      outline: {
        level: [2, 3],
        label: '本页导航'
      },

      docFooter: {
        prev: '上一页',
        next: '下一页'
      },

      lastUpdatedText: '最后更新',
      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '菜单',
      darkModeSwitchLabel: '主题',
      lightModeSwitchTitle: '切换到浅色主题',
      darkModeSwitchTitle: '切换到深色主题',

      search: {
        provider: 'local',
        options: {
          translations: {
            button: {
              buttonText: '搜索文档',
              buttonAriaLabel: '搜索文档'
            },
            modal: {
              noResultsText: '无法找到相关结果',
              resetButtonTitle: '清除查询条件',
              footer: {
                selectText: '选择',
                navigateText: '切换'
              }
            }
          }
        }
      },

      socialLinks: []
    }
  })
)
