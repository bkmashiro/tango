<script setup lang="ts">
import { ref } from 'vue'
import type { BlockVideo } from '../../types'

defineProps<{ block: BlockVideo }>()
const expanded = ref(false)
</script>

<template>
  <div class="block-video">
    <button v-if="!expanded" class="video-thumb" @click="expanded = true">
      <span class="video-icon">▶</span>
      <span>观看配套视频</span>
    </button>
    <iframe
      v-else
      :src="block.url"
      allowfullscreen
      frameborder="0"
      class="video-frame"
    />
  </div>
</template>
