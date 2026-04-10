<script setup lang="ts">
import type { Inline } from '../../types'

defineProps<{ inlines: Inline[] }>()
</script>

<template>
  <span class="inlines">
    <template v-for="(token, i) in inlines" :key="i">
      <template v-if="token.type === 'text'">{{ token.content }}</template>

      <ruby v-else-if="token.type === 'ruby'" class="jp-ruby">
        {{ token.text }}
        <rp>(</rp>
        <rt>{{ token.reading ?? token.meaning ?? '' }}</rt>
        <rp>)</rp>
      </ruby>

      <strong v-else-if="token.type === 'bold'">{{ token.content }}</strong>
      <em     v-else-if="token.type === 'italic'">{{ token.content }}</em>
      <u      v-else-if="token.type === 'underline'">{{ token.content }}</u>
      <br     v-else-if="token.type === 'br'" />
      <a
        v-else-if="token.type === 'link'"
        :href="token.href"
        target="_blank"
        rel="noopener"
      >{{ token.content }}</a>
    </template>
  </span>
</template>
