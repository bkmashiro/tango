<script setup lang="ts">
import { computed } from 'vue'
import type { BlockExamples } from '../../types'
import InlineRenderer from './InlineRenderer.vue'
import { speakJapanese } from '../../utils/speak'

const props = defineProps<{ block: BlockExamples }>()

const isJapanese = (s: string) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s)
const hasZh = (s: string) => !!(s && s.trim().length > 0)

const items = computed(() =>
  props.block.items.filter(ex => isJapanese(ex.jp))
)
</script>

<template>
  <ol v-if="items.length" class="block-examples">
    <li
      v-for="(ex, i) in items"
      :key="i"
      class="example-item"
    >
      <span class="example-jp example-jp--speak" @click="speakJapanese(ex.jp)" title="点击朗读">
        <InlineRenderer v-if="ex.inlines.length" :inlines="ex.inlines" />
        <template v-else>{{ ex.jp }}</template>
      </span>
      <span v-if="hasZh(ex.zh)" class="example-zh">{{ ex.zh }}</span>
    </li>
  </ol>
</template>
