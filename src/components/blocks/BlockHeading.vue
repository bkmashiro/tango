<script setup lang="ts">
import type { BlockHeading } from '../../types'
import InlineRenderer from './InlineRenderer.vue'
defineProps<{ block: BlockHeading }>()
</script>

<template>
  <h3 class="block-heading" :class="`level-${block.level}`">
    <InlineRenderer :inlines="block.inlines" />
  </h3>
</template>
