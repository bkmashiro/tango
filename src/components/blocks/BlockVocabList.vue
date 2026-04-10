<script setup lang="ts">
import type { BlockVocabList, VocabItem } from '../../types'

defineProps<{ block: BlockVocabList }>()
const emit = defineEmits<{ addToSRS: [item: VocabItem] }>()
</script>

<template>
  <div class="block-vocab">
    <div v-if="block.label" class="vocab-label">{{ block.label }}</div>
    <ul class="vocab-list">
      <li v-for="item in block.items" :key="item.word" class="vocab-item">
        <span class="vocab-word">{{ item.word }}</span>
        <span v-if="item.reading_display" class="vocab-reading">
          【{{ item.reading_display }}】
        </span>
        <span v-if="item.type" class="vocab-type">{{ item.type }}</span>
        <span class="vocab-sep">—</span>
        <span class="vocab-meaning">{{ item.meaning }}</span>
        <button class="vocab-add" @click="emit('addToSRS', item)" title="加入复习">＋</button>
      </li>
    </ul>
  </div>
</template>
