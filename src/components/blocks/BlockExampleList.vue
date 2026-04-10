<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BlockExamples } from '../../types'
import InlineRenderer from './InlineRenderer.vue'

const props = defineProps<{ block: BlockExamples }>()

// Filter out non-Japanese items (external links, English-only text, etc.)
const isJapanese = (s: string) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s)
const items = computed(() => props.block.items.filter(ex => isJapanese(ex.jp)))

// Reassign Set on mutation so Vue tracks the change
const revealed = ref<Set<number>>(new Set())
const toggle = (i: number) => {
  const next = new Set(revealed.value)
  if (next.has(i)) next.delete(i)
  else next.add(i)
  revealed.value = next
}
</script>

<template>
  <ol v-if="items.length" class="block-examples">
    <li
      v-for="(ex, i) in items"
      :key="i"
      class="example-item"
      @click="toggle(i)"
    >
      <span class="example-jp">
        <InlineRenderer v-if="ex.inlines.length" :inlines="ex.inlines" />
        <template v-else>{{ ex.jp }}</template>
      </span>
      <span class="example-zh" :class="{ hidden: !revealed.has(i) }">
        {{ ex.zh || '　' }}
      </span>
      <span v-if="!revealed.has(i)" class="reveal-hint">点击查看</span>
    </li>
  </ol>
</template>
