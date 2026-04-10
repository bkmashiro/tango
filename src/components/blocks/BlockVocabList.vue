<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BlockVocabList, VocabItem } from '../../types'
import { speakJapanese } from '../../utils/speak'

const props = defineProps<{ block: BlockVocabList; addedWords?: Set<string> }>()
const emit  = defineEmits<{ toggleSRS: [item: VocabItem] }>()

const added = ref<Set<string>>(new Set())

watch(() => props.addedWords, (val) => {
  added.value = val ? new Set(val) : new Set()
}, { immediate: true })

function onToggle(item: VocabItem) {
  if (!item.word) return
  emit('toggleSRS', item)
  // Optimistic local update
  const next = new Set(added.value)
  if (next.has(item.word)) next.delete(item.word)
  else next.add(item.word)
  added.value = next
}
</script>

<template>
  <div class="block-vocab">
    <div v-if="block.label" class="vocab-label">{{ block.label }}</div>
    <ul class="vocab-list">
      <li v-for="item in block.items" :key="item.word" class="vocab-item">
        <span class="vocab-word speakable" @click="speakJapanese(item.word)">{{ item.word }}</span>
        <span v-if="item.reading_display" class="vocab-reading">
          【{{ item.reading_display }}】
        </span>
        <span v-if="item.type" class="vocab-type">{{ item.type }}</span>
        <span class="vocab-sep">—</span>
        <span class="vocab-meaning">{{ item.meaning }}</span>
        <button
          class="vocab-star"
          :class="{ starred: added.has(item.word) }"
          :title="added.has(item.word) ? '点击取消复习' : '加入复习'"
          @click="onToggle(item)"
        >
          {{ added.has(item.word) ? '★' : '☆' }}
        </button>
      </li>
    </ul>
  </div>
</template>
