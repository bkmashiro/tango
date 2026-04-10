<script setup lang="ts">
import { ref } from 'vue'
import type { BlockExamples } from '../../types'
import InlineRenderer from './InlineRenderer.vue'

defineProps<{ block: BlockExamples }>()

// Each example has its own revealed state
const revealed = ref<Set<number>>(new Set())
const toggle = (i: number) => {
  if (revealed.value.has(i)) revealed.value.delete(i)
  else revealed.value.add(i)
}
</script>

<template>
  <ol class="block-examples">
    <li
      v-for="(ex, i) in block.items"
      :key="i"
      class="example-item"
      @click="toggle(i)"
    >
      <span class="example-jp">
        <InlineRenderer v-if="ex.inlines.length" :inlines="ex.inlines" />
        <template v-else>{{ ex.jp }}</template>
      </span>
      <span
        class="example-zh"
        :class="{ hidden: !revealed.has(i) }"
      >
        {{ ex.zh || '　' }}
      </span>
      <span v-if="!revealed.has(i)" class="reveal-hint">点击查看</span>
    </li>
  </ol>
</template>
