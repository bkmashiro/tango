<script setup lang="ts">
import type { Block, VocabItem } from '../../types'
import BlockHeading    from './BlockHeading.vue'
import BlockParagraph  from './BlockParagraph.vue'
import BlockNote       from './BlockNote.vue'
import BlockVocabList  from './BlockVocabList.vue'
import BlockExampleList from './BlockExampleList.vue'
import BlockSumbox     from './BlockSumbox.vue'
import BlockTable      from './BlockTable.vue'
import BlockVideo      from './BlockVideo.vue'

defineProps<{ block: Block; addedWords?: Set<string> }>()
defineEmits<{ addToSRS: [item: VocabItem] }>()
</script>

<template>
  <BlockHeading     v-if="block.type === 'heading'"      :block="block" />
  <BlockParagraph   v-else-if="block.type === 'paragraph'"    :block="block" />
  <BlockNote        v-else-if="block.type === 'note'"         :block="block" />
  <BlockVocabList   v-else-if="block.type === 'vocab-list'"   :block="block" :added-words="addedWords" @addToSRS="$emit('addToSRS', $event)" />
  <BlockExampleList v-else-if="block.type === 'example-list'" :block="block" />
  <BlockSumbox      v-else-if="block.type === 'sumbox'"       :block="block" />
  <BlockTable       v-else-if="block.type === 'table'"        :block="block" />
  <BlockVideo       v-else-if="block.type === 'video'"        :block="block" />
</template>
