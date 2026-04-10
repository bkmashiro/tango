<script setup lang="ts">
import type { BlockNote } from '../../types'
import InlineRenderer from './InlineRenderer.vue'
defineProps<{ block: BlockNote }>()
</script>

<template>
  <aside class="block-note">
    <span class="note-icon">💡</span>
    <InlineRenderer :inlines="block.inlines" />
  </aside>
</template>
