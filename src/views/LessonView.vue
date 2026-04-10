<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadData, getLesson } from '../stores/data'
import { markSectionRead, getLessonProgress, db, vocabId } from '../stores/db'
import type { VocabItem, SectionStatus } from '../types'
import LessonBlock from '../components/blocks/LessonBlock.vue'

const route  = useRoute()
const router = useRouter()

const lessonId = computed(() => route.params.id as string)
const lesson   = computed(() => getLesson(lessonId.value))

const sectionStatuses = ref<Record<string, SectionStatus>>({})
const addedWords      = ref<Set<string>>(new Set())

onMounted(async () => {
  await loadData()
  const progress = await getLessonProgress(lessonId.value)
  for (const p of progress) {
    sectionStatuses.value[p.sectionIndex] = p.status
  }
  // Load already-added words
  const vocab = await db.vocabProgress
    .where('lessonId').equals(lessonId.value).toArray()
  for (const v of vocab) addedWords.value.add(v.word)
})

async function onSectionRead(idx: number) {
  await markSectionRead(lessonId.value, idx)
  sectionStatuses.value[idx] = 'read'
}

async function addToSRS(item: VocabItem) {
  if (addedWords.value.has(item.word)) return
  const id = vocabId(lessonId.value, item.word)
  await db.vocabProgress.put({
    id,
    lessonId: lessonId.value,
    word: item.word,
    correct: 0, incorrect: 0,
    interval: 1,
    nextReview: Date.now(),
  })
  addedWords.value.add(item.word)
}
</script>

<template>
  <div v-if="lesson" class="lesson-view">
    <nav class="lesson-nav">
      <button class="btn-back" @click="router.push('/')">← 返回</button>
      <h1 class="lesson-title">{{ lesson.title }}</h1>
    </nav>

    <!-- Section TOC -->
    <aside class="section-toc">
      <a
        v-for="(sec, i) in lesson.sections"
        :key="i"
        :href="`#section-${i}`"
        class="toc-item"
        :class="sectionStatuses[i]"
      >
        <span class="toc-dot" />
        <span class="toc-label">{{ sec.title ?? '概述' }}</span>
      </a>
    </aside>

    <!-- Sections -->
    <main class="lesson-content">
      <section
        v-for="(sec, i) in lesson.sections"
        :id="`section-${i}`"
        :key="i"
        class="lesson-section"
        :class="sectionStatuses[i] ?? 'unread'"
      >
        <h2 v-if="sec.title" class="section-title">{{ sec.title }}</h2>

        <LessonBlock
          v-for="(block, bi) in sec.blocks"
          :key="bi"
          :block="block"
          @addToSRS="addToSRS"
        />

        <div class="section-footer">
          <button
            v-if="!sectionStatuses[i] || sectionStatuses[i] === 'unread'"
            class="btn-read"
            @click="onSectionRead(i)"
          >
            ✓ 已读
          </button>
          <span v-else class="read-badge">✓ 已读</span>
        </div>
      </section>
    </main>
  </div>

  <div v-else class="loading">加载中…</div>
</template>
