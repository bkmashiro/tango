<script setup lang="ts">
import { computed } from 'vue'
import type { BlockExamples, Inline } from '../../types'
import InlineRenderer from './InlineRenderer.vue'
import { speakJapanese } from '../../utils/speak'

const props = defineProps<{ block: BlockExamples }>()

// Require kana (not just CJK) so pure Chinese text like "片假名练习" is excluded
const hasKana = (s: string) => /[\u3040-\u30ff]/.test(s)
const hasZh = (s: string) => !!(s && s.trim().length > 0)

// Reconstruct full sentence text from inlines for TTS (includes particles/endings)
function inlinesToText(inlines: Inline[]): string {
  return inlines.map(t => {
    if (t.type === 'text') return t.content
    if (t.type === 'ruby') return t.text
    if (t.type === 'italic' || t.type === 'bold' || t.type === 'underline') return t.content
    return ''
  }).join('').trim()
}

function getReadText(ex: { jp: string; inlines: Inline[] }): string {
  if (ex.inlines.length) {
    const full = inlinesToText(ex.inlines)
    if (full) return full
  }
  return ex.jp
}

const items = computed(() =>
  props.block.items.filter(ex => hasKana(ex.jp) || hasKana(inlinesToText(ex.inlines)))
)
</script>

<template>
  <ol v-if="items.length" class="block-examples">
    <li
      v-for="(ex, i) in items"
      :key="i"
      class="example-item"
    >
      <span class="example-jp example-jp--speak" @click="speakJapanese(getReadText(ex))" title="点击朗读">
        <InlineRenderer v-if="ex.inlines.length" :inlines="ex.inlines" />
        <template v-else>{{ ex.jp }}</template>
      </span>
      <span v-if="hasZh(ex.zh)" class="example-zh">{{ ex.zh }}</span>
    </li>
  </ol>
</template>
