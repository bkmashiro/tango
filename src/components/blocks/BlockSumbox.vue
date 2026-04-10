<script setup lang="ts">
import { ref } from 'vue'
import type { BlockSumbox } from '../../types'
import InlineRenderer from './InlineRenderer.vue'

defineProps<{ block: BlockSumbox }>()

const revealed = ref<Set<string>>(new Set())
const toggle = (key: string) => {
  if (revealed.value.has(key)) revealed.value.delete(key)
  else revealed.value.add(key)
}
</script>

<template>
  <div class="block-sumbox">
    <div class="sumbox-title">{{ block.title }}</div>
    <ul class="sumbox-rules">
      <li v-for="(rule, ri) in block.rules" :key="ri" class="sumbox-rule">
        <p v-if="rule.rule" class="rule-text">{{ rule.rule }}</p>
        <ol v-if="rule.examples.length" class="rule-examples">
          <li
            v-for="(ex, ei) in rule.examples"
            :key="ei"
            class="example-item"
            @click="toggle(`${ri}-${ei}`)"
          >
            <span class="example-jp">
              <InlineRenderer v-if="ex.inlines?.length" :inlines="ex.inlines" />
              <template v-else>{{ ex.jp }}</template>
            </span>
            <span
              class="example-zh"
              :class="{ hidden: !revealed.has(`${ri}-${ei}`) }"
            >{{ ex.zh }}</span>
            <span v-if="!revealed.has(`${ri}-${ei}`)" class="reveal-hint">点击查看</span>
          </li>
        </ol>
      </li>
    </ul>
  </div>
</template>
