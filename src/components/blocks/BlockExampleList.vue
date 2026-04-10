<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BlockExamples } from '../../types'
import InlineRenderer from './InlineRenderer.vue'

const props = defineProps<{ block: BlockExamples }>()

const isJapanese = (s: string) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s)
const hasZh = (s: string) => s && s.trim().length > 0

const items = computed(() =>
  props.block.items.filter(ex => isJapanese(ex.jp))
)

const revealed = ref<Set<number>>(new Set())
const toggle = (i: number, zh: string) => {
  if (!hasZh(zh)) return
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
      :class="{ clickable: hasZh(ex.zh) }"
      @click="toggle(i, ex.zh)"
    >
      <span class="example-jp">
        <InlineRenderer v-if="ex.inlines.length" :inlines="ex.inlines" />
        <template v-else>{{ ex.jp }}</template>
      </span>
      <template v-if="hasZh(ex.zh)">
        <span v-if="revealed.has(i)" class="example-zh">{{ ex.zh }}</span>
        <span v-else class="reveal-hint">点击查看翻译</span>
      </template>
    </li>
  </ol>
</template>
