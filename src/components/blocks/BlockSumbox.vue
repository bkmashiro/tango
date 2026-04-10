<script setup lang="ts">
import { ref } from 'vue'
import type { BlockSumbox } from '../../types'
import InlineRenderer from './InlineRenderer.vue'

defineProps<{ block: BlockSumbox }>()

const isJapanese = (s: string) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s)
const hasZh = (s: string) => s && s.trim().length > 0

const revealed = ref<Set<string>>(new Set())
const toggle = (key: string, zh: string) => {
  if (!hasZh(zh)) return
  const next = new Set(revealed.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  revealed.value = next
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
            v-for="(ex, ei) in rule.examples.filter(e => isJapanese(e.jp))"
            :key="ei"
            class="example-item"
            :class="{ clickable: hasZh(ex.zh) }"
            @click="toggle(`${ri}-${ei}`, ex.zh)"
          >
            <span class="example-jp">
              <InlineRenderer v-if="ex.inlines?.length" :inlines="ex.inlines" />
              <template v-else>{{ ex.jp }}</template>
            </span>
            <template v-if="hasZh(ex.zh)">
              <span v-if="revealed.has(`${ri}-${ei}`)" class="example-zh">{{ ex.zh }}</span>
              <span v-else class="reveal-hint">点击展开</span>
            </template>
          </li>
        </ol>
      </li>
    </ul>
  </div>
</template>
