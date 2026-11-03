import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// withMermaid renders ```mermaid blocks, which the book shares with docs/.
// zh-TW is the root locale (ADR-SHARED-0002); add an `en` locale later.
export default withMermaid(
  defineConfig({
    title: 'CuriosityLab',
    description: '從零打造多租戶平台：Spring Boot、OIDC、BFF 與 Kubernetes 教學書',
    lang: 'zh-TW',
    cleanUrls: true,
    lastUpdated: true,
    // Set BASE when hosted under a sub-path, e.g. BASE=/curiositylab/
    base: process.env.BASE ?? '/',

    themeConfig: {
      nav: [{ text: '開始閱讀', link: '/guide/' }],
      sidebar: {
        '/guide/': [
          {
            text: '開始',
            items: [{ text: '本書簡介', link: '/guide/' }],
          },
        ],
      },
      outline: { label: '本頁目錄' },
      docFooter: { prev: '上一頁', next: '下一頁' },
      lastUpdated: { text: '最後更新' },
      returnToTopLabel: '回到頂端',
      sidebarMenuLabel: '選單',
      darkModeSwitchLabel: '外觀',
      search: { provider: 'local' },
    },
  }),
)
