<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadData, getLesson, lessons } from '../stores/data'
import { toggleSectionRead, getLessonProgress, db, vocabId, removeVocab } from '../stores/db'
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
  localStorage.setItem('lastLesson', lessonId.value)
})

watch(lessonId, async () => {
  await loadData()
  await loadProgress()
  localStorage.setItem('lastLesson', lessonId.value)
  window.scrollTo(0, 0)
})

/** Toggle a section read/unread. No vocab side effects — user controls their queue. */
async function onSectionRead(idx: number) {
  await toggleSectionRead(lessonId.value, idx)
  const wasRead = sectionStatuses.value[idx] === 'read' || sectionStatuses.value[idx] === 'reviewing'
  if (wasRead) {
    const next = { ...sectionStatuses.value }
    delete next[idx]
    sectionStatuses.value = next
  } else {
    sectionStatuses.value = { ...sectionStatuses.value, [idx]: 'read' }
  }
}

/** Toggle a word in/out of the review queue. */
async function toggleSRS(item: VocabItem) {
  if (!item.word) return
  if (addedWords.value.has(item.word)) {
    // Remove from queue
    await removeVocab(lessonId.value, item.word)
    const next = new Set(addedWords.value)
    next.delete(item.word)
    addedWords.value = next
  } else {
    // Add to queue
    const id = vocabId(lessonId.value, item.word)
    await db.vocabProgress.put({
      id,
      lessonId: lessonId.value,
      word: item.word,
      correct: 0, incorrect: 0,
      interval: 1,
      nextReview: Date.now(),
      deck: 'favorites',
    })
    const next = new Set(addedWords.value)
    next.add(item.word)
    addedWords.value = next
  }
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
          @toggleSRS="toggleSRS"
        />

        <div v-if="sec.title" class="section-footer">
          <!-- Toggle button: shows current state, click to toggle -->
          <button
            class="btn-read"
            :class="{ 'btn-read-active': sectionStatuses[i] === 'read' || sectionStatuses[i] === 'reviewing' }"
            @click="onSectionRead(i)"
          >
            {{ (sectionStatuses[i] === 'read' || sectionStatuses[i] === 'reviewing') ? '✓ 已读' : '○ 标为已读' }}
          </button>
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

<style scoped>
/* Override the read button to show toggle state */
.btn-read {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text2);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all .15s;
}
.btn-read:hover { border-color: var(--accent); color: var(--accent); }
.btn-read.btn-read-active {
  background: rgba(34,197,94,.12);
  border-color: var(--green);
  color: var(--green);
}
.btn-read.btn-read-active:hover {
  background: rgba(239,68,68,.1);
  border-color: var(--red);
  color: var(--red);
}
</style>
