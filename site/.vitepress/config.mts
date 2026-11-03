import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// Leading YAML frontmatter block; it is page config, not content, so Copy Page drops it.
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/

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

    // Under pnpm, mermaid is not pre-bundled, so its CommonJS deps (dayjs, fastdom, …)
    // reach the browser raw and fail with "does not provide an export named 'default'",
    // leaving a blank page. Pre-bundling mermaid converts all of them at once.
    vite: {
      optimizeDeps: { include: ['mermaid'] },
    },

    // Ship each page's Markdown source with its page data so the Copy Page button
    // can copy it without a fetch. Works the same under `dev` and `build`.
    transformPageData(pageData, { siteConfig }) {
      if (pageData.frontmatter.layout === 'home') return
      const source = readFileSync(join(siteConfig.srcDir, pageData.relativePath), 'utf8')
      pageData.frontmatter.rawMarkdown = source.replace(FRONTMATTER, '').trim()
    },

    themeConfig: {
      nav: [{ text: '書籍架構', link: '/syllabus' }],
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
