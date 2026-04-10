<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadData, chapters, getLessonsForChapter, meta, getLesson } from '../stores/data'
import { db, getDueCountByDeck } from '../stores/db'

const router = useRouter()
const dueCount = ref(0)
const dueFavorites = ref(0)
const dueLibrary = ref(0)
const lastLesson = ref<string | null>(null)
const lastLessonTitle = ref<string>('')

// Per-lesson progress: { [lessonId]: { sectionsRead: N, totalSections: N, vocabAdded: N, totalVocab: N } }
type LessonProg = { sectionsRead: number; totalSections: number; vocabAdded: number; totalVocab: number }
const lessonProgress = ref<Record<string, LessonProg>>({})

// Global progress totals
const globalProgress = ref({ sectionsRead: 0, totalSections: 0, vocabAdded: 0, totalVocab: 0 })

onMounted(async () => {
  await loadData()

  const deckCounts = await getDueCountByDeck()
  dueCount.value = deckCounts.all
  dueFavorites.value = deckCounts.favorites
  dueLibrary.value = deckCounts.library

  // Last lesson
  const last = localStorage.getItem('lastLesson')
  if (last) {
    const l = getLesson(last)
    if (l) {
      lastLesson.value = last
      lastLessonTitle.value = l.title
    }
  }

  // Load all progress in two queries
  const [allSections, allVocab] = await Promise.all([
    db.sectionProgress.toArray(),
    db.vocabProgress.toArray(),
  ])

  // Count by lessonId
  const secByLesson: Record<string, number> = {}
  for (const s of allSections) {
    if (s.status === 'read' || s.status === 'reviewing') {
      secByLesson[s.lessonId] = (secByLesson[s.lessonId] ?? 0) + 1
    }
  }
  const vocabByLesson: Record<string, number> = {}
  for (const v of allVocab) {
    vocabByLesson[v.lessonId] = (vocabByLesson[v.lessonId] ?? 0) + 1
  }

  // Build progress map for all lessons + global totals
  let gSecRead = 0, gSecTotal = 0, gVocabAdded = 0, gVocabTotal = 0
  for (const ch of chapters.value) {
    for (const lid of ch.lessons) {
      const l = getLesson(lid)
      if (!l) continue
      const p = {
        sectionsRead: secByLesson[lid] ?? 0,
        totalSections: l.sections.length,
        vocabAdded: vocabByLesson[lid] ?? 0,
        totalVocab: l.totalVocab,
      }
      lessonProgress.value[lid] = p
      gSecRead   += p.sectionsRead
      gSecTotal  += p.totalSections
      gVocabAdded += p.vocabAdded
      gVocabTotal += p.totalVocab
    }
  }
  globalProgress.value = { sectionsRead: gSecRead, totalSections: gSecTotal, vocabAdded: gVocabAdded, totalVocab: gVocabTotal }
})

function progressPct(p: LessonProg) {
  const total = p.totalSections + Math.min(p.totalVocab, 10)
  if (total === 0) return 0
  const done = p.sectionsRead + Math.min(p.vocabAdded, 10)
  return Math.round((done / total) * 100)
}
</script>

<template>
  <div class="home">
    <header class="home-header">
      <div class="header-top">
        <h1 class="app-title">鍛語 <span class="app-sub">TANGO</span></h1>
        <button class="btn-settings" @click="router.push('/settings')" title="设置">⚙️</button>
      </div>
      <p class="app-desc">日语语法指南 · 互动学习版</p>
      <div v-if="meta" class="meta-badges">
        <span class="badge">{{ meta.totalLessons }} 课</span>
        <span class="badge">{{ meta.totalVocab }} 词</span>
        <span class="badge">{{ meta.totalExamples }} 例句</span>
      </div>
    </header>

    <!-- Global progress -->
    <div v-if="globalProgress.totalSections > 0 && (globalProgress.sectionsRead > 0 || globalProgress.vocabAdded > 0)" class="global-progress">
      <div class="global-progress-header">
        <span class="global-progress-label">总体进度</span>
        <span class="global-progress-pct">
          {{ Math.round((globalProgress.sectionsRead / globalProgress.totalSections) * 100) }}%
        </span>
      </div>
      <div class="global-progress-bar">
        <div
          class="global-progress-fill"
          :style="{ width: Math.round((globalProgress.sectionsRead / globalProgress.totalSections) * 100) + '%' }"
        />
      </div>
      <div class="global-progress-stats">
        <span>{{ globalProgress.sectionsRead }} / {{ globalProgress.totalSections }} 节已读</span>
        <span>{{ globalProgress.vocabAdded }} / {{ globalProgress.totalVocab }} 词已加入复习</span>
      </div>
    </div>

    <div v-if="lastLesson" class="continue-banner" @click="router.push(`/lesson/${lastLesson}`)">
      <span class="continue-icon">📖</span>
      <div class="continue-text">
        <div class="continue-label">继续学习</div>
        <div class="continue-title">{{ lastLessonTitle }}</div>
      </div>
      <span class="continue-arrow">→</span>
    </div>

    <div v-if="dueCount > 0" class="review-banner" @click="router.push('/review')">
      <span class="review-fire">🔥</span>
      <span>
        {{ dueCount }} 词待复习
        <span v-if="dueFavorites > 0 || dueLibrary > 0" class="review-breakdown">
          (⭐ {{ dueFavorites }} · 📚 {{ dueLibrary }})
        </span>
      </span>
      <span class="review-arrow">→</span>
    </div>

    <main class="chapters">
      <section
        v-for="chapter in chapters"
        :key="chapter.id"
        class="chapter-section"
      >
        <h2 class="chapter-title">{{ chapter.title }}</h2>
        <div class="lesson-grid">
          <div
            v-for="lesson in getLessonsForChapter(chapter.id)"
            :key="lesson.id"
            class="lesson-card"
            @click="router.push(`/lesson/${lesson.id}`)"
          >
            <div class="lesson-card-title">{{ lesson.title }}</div>
            <div class="lesson-card-meta">
              <span>{{ lesson.totalVocab }} 词</span>
              <span>{{ lesson.totalExamples }} 例</span>
            </div>
            <template v-if="lessonProgress[lesson.id] && (lessonProgress[lesson.id].sectionsRead > 0 || lessonProgress[lesson.id].vocabAdded > 0)">
              <div class="lesson-progress-bar">
                <div
                  class="lesson-progress-fill"
                  :style="{ width: progressPct(lessonProgress[lesson.id]) + '%' }"
                />
              </div>
              <div class="lesson-progress-text">
                <span v-if="lessonProgress[lesson.id].sectionsRead > 0">
                  {{ lessonProgress[lesson.id].sectionsRead }}/{{ lessonProgress[lesson.id].totalSections }} 节已读
                </span>
                <span v-if="lessonProgress[lesson.id].vocabAdded > 0">
                  · {{ lessonProgress[lesson.id].vocabAdded }} 词已加
                </span>
              </div>
            </template>
          </div>
        </div>
      </section>
    </main>

    <footer class="credits">
      <p>基于 <a href="http://www.guidetojapanese.org/learn/grammar" target="_blank" rel="noopener">Tae Kim's Japanese Grammar Guide</a>（CC BY-NC-SA 2.5）</p>
      <p>中文版整理自 <a href="https://github.com/pizzamx/jpgramma" target="_blank" rel="noopener">pizzamx/jpgramma</a></p>
      <p class="credits-repo">
        <a href="https://github.com/bkmashiro/tango" target="_blank" rel="noopener">
          ⌥ bkmashiro/tango
        </a>
      </p>
    </footer>
  </div>
</template>
