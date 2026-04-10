<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadData, chapters, getLessonsForChapter, meta } from '../stores/data'
import { db } from '../stores/db'

const router = useRouter()
const dueCount = ref(0)

onMounted(async () => {
  await loadData()
  dueCount.value = await db.vocabProgress
    .where('nextReview').belowOrEqual(Date.now()).count()
})
</script>

<template>
  <div class="home">
    <header class="home-header">
      <h1 class="app-title">鍛語 <span class="app-sub">TANGO</span></h1>
      <p class="app-desc">日语语法指南 · 互动学习版</p>
      <div v-if="meta" class="meta-badges">
        <span class="badge">{{ meta.totalLessons }} 课</span>
        <span class="badge">{{ meta.totalVocab }} 词</span>
        <span class="badge">{{ meta.totalExamples }} 例句</span>
      </div>
    </header>

    <div v-if="dueCount > 0" class="review-banner" @click="router.push('/review')">
      <span class="review-fire">🔥</span>
      <span>{{ dueCount }} 个词汇待复习</span>
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
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
