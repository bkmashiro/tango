<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadData, getLesson, lessons } from '../stores/data'
import { markSectionRead, getLessonProgress, db, vocabId } from '../stores/db'
import type { VocabItem, SectionStatus } from '../types'
import LessonBlock from '../components/blocks/LessonBlock.vue'
import BlockExercises from '../components/blocks/BlockExercises.vue'

const route  = useRoute()
const router = useRouter()

const lessonId = computed(() => route.params.id as string)
const lesson   = computed(() => getLesson(lessonId.value))

const sectionStatuses = ref<Record<string, SectionStatus>>({})
const addedWords      = ref<Set<string>>(new Set())

// Prev / Next lesson
const allLessons = computed(() => lessons.value)
const currentIdx = computed(() => allLessons.value.findIndex(l => l.id === lessonId.value))
const prevLesson = computed(() => currentIdx.value > 0 ? allLessons.value[currentIdx.value - 1] : null)
const nextLesson = computed(() => currentIdx.value >= 0 && currentIdx.value < allLessons.value.length - 1
  ? allLessons.value[currentIdx.value + 1] : null)

async function loadProgress() {
  sectionStatuses.value = {}
  const progress = await getLessonProgress(lessonId.value)
  for (const p of progress) {
    sectionStatuses.value[p.sectionIndex] = p.status
  }
  const vocab = await db.vocabProgress
    .where('lessonId').equals(lessonId.value).toArray()
  const next = new Set<string>()
  for (const v of vocab) next.add(v.word)
  addedWords.value = next
}

onMounted(async () => {
  await loadData()
  await loadProgress()
  // Save last visited lesson
  localStorage.setItem('lastLesson', lessonId.value)
})

// Reload progress when lesson changes (router navigation)
watch(lessonId, async () => {
  await loadData()
  await loadProgress()
  localStorage.setItem('lastLesson', lessonId.value)
  window.scrollTo(0, 0)
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
  const next = new Set(addedWords.value)
  next.add(item.word)
  addedWords.value = next
}

function scrollToSection(i: number) {
  const el = document.getElementById(`section-${i}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
        href="#"
        class="toc-item"
        :class="sectionStatuses[i]"
        @click.prevent="scrollToSection(i)"
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
          :added-words="addedWords"
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

      <!-- Exercises -->
      <div v-if="lesson.exercises?.length" class="lesson-exercises">
        <h2 class="section-title" style="margin-bottom: 16px">📝 练习题</h2>
        <BlockExercises :exercises="lesson.exercises" />
      </div>

      <!-- Prev / Next navigation -->
      <nav class="lesson-pagination">
        <button
          v-if="prevLesson"
          class="btn-page btn-prev"
          @click="router.push(`/lesson/${prevLesson.id}`)"
        >
          ← {{ prevLesson.title }}
        </button>
        <span v-else class="btn-page-placeholder" />
        <button
          v-if="nextLesson"
          class="btn-page btn-next"
          @click="router.push(`/lesson/${nextLesson.id}`)"
        >
          {{ nextLesson.title }} →
        </button>
        <span v-else class="btn-page-placeholder" />
      </nav>
    </main>
  </div>

  <div v-else class="loading">加载中…</div>
</template>
