import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import CopyPageButton from './components/CopyPageButton.vue'

// Extend the default theme and put Copy Page above the content of every doc page.
// The `doc-before` slot only exists in the doc layout, so the home page is skipped.
export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(CopyPageButton) }),
} satisfies Theme
