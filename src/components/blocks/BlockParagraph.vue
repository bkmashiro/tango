<script setup lang="ts">
import type { BlockParagraph } from '../../types'
import InlineRenderer from './InlineRenderer.vue'
defineProps<{ block: BlockParagraph }>()
</script>

<template>
  <p class="block-paragraph">
    <InlineRenderer :inlines="block.inlines" />
  </p>
</template>
