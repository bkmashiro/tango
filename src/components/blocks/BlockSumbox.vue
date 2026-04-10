<script setup lang="ts">
import type { BlockSumbox } from '../../types'
import InlineRenderer from './InlineRenderer.vue'

defineProps<{ block: BlockSumbox }>()

const isJapanese = (s: string) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s)
const hasZh = (s: string) => !!(s && s.trim().length > 0)
</script>

<template>
  <div class="block-sumbox">
    <div class="sumbox-title">{{ block.title }}</div>
    <ul class="sumbox-rules">
      <li v-for="(rule, ri) in block.rules" :key="ri" class="sumbox-rule">
        <p v-if="rule.rule" class="rule-text">{{ rule.rule }}</p>
        <ol v-if="rule.examples.length" class="rule-examples">
          <li
            v-for="(ex, ei) in rule.examples.filter(e => isJapanese(e.jp))"
            :key="ei"
            class="example-item"
          >
            <span class="example-jp">
              <InlineRenderer v-if="ex.inlines?.length" :inlines="ex.inlines" />
              <template v-else>{{ ex.jp }}</template>
            </span>
            <span v-if="hasZh(ex.zh)" class="example-zh">{{ ex.zh }}</span>
          </li>
        </ol>
      </li>
    </ul>
  </div>
</template>
