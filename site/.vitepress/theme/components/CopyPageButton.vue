<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const state = ref<'idle' | 'copied' | 'failed'>('idle')
let timer: ReturnType<typeof setTimeout> | undefined

// navigator.clipboard needs a secure context (HTTPS or localhost). The dev server is
// often opened over plain HTTP on the lab network, so fall back to execCommand there.
async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand('copy')
  area.remove()
  if (!ok) throw new Error('execCommand copy failed')
}

async function copyPage() {
  try {
    await writeClipboard(frontmatter.value.rawMarkdown ?? '')
    state.value = 'copied'
  } catch {
    state.value = 'failed'
  }
  clearTimeout(timer)
  timer = setTimeout(() => (state.value = 'idle'), 2000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div v-if="frontmatter.rawMarkdown" class="copy-page">
    <button type="button" class="copy-page-btn" title="複製本頁 Markdown" @click="copyPage">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h8" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
      <span>{{ state === 'copied' ? 'Copied!' : state === 'failed' ? 'Copy failed' : 'Copy Page' }}</span>
    </button>
    <span class="visually-hidden" aria-live="polite">{{ state === 'copied' ? '已複製本頁' : '' }}</span>
  </div>
</template>

<style scoped>
.copy-page {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.copy-page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  line-height: 24px;
  transition: color 0.2s, border-color 0.2s;
}

.copy-page-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
