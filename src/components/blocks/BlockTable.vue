<script setup lang="ts">
import type { BlockTable } from '../../types'
import InlineRenderer from './InlineRenderer.vue'
defineProps<{ block: BlockTable }>()
</script>

<template>
  <div class="block-table-wrap">
    <p v-if="block.caption" class="table-caption">{{ block.caption }}</p>
    <table class="block-table">
      <thead v-if="block.headers.length">
        <tr>
          <th v-for="(cell, i) in block.headers" :key="i">
            <InlineRenderer :inlines="cell" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, ri) in block.rows" :key="ri">
          <td v-for="(cell, ci) in row" :key="ci">
            <InlineRenderer :inlines="cell" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
