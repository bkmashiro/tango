<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BlockVocabList, VocabItem } from '../../types'

const props = defineProps<{ block: BlockVocabList; addedWords?: Set<string> }>()
const emit = defineEmits<{ addToSRS: [item: VocabItem] }>()

const added = ref<Set<string>>(new Set())

// Sync when parent finishes loading DB words
watch(() => props.addedWords, (val) => {
  if (val && val.size > 0) added.value = new Set(val)
}, { immediate: true })

function onAdd(item: VocabItem) {
  if (added.value.has(item.word)) return
  emit('addToSRS', item)
  const next = new Set(added.value)
  next.add(item.word)
  added.value = next
}
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
        <button
          class="vocab-add"
          :class="{ added: added.has(item.word) }"
          :title="added.has(item.word) ? '已加入复习' : '加入单词复习'"
          @click="onAdd(item)"
        >
          {{ added.has(item.word) ? '✓' : '＋' }}
        </button>
      </li>
    </ul>
  </div>
</template>
