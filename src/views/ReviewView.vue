<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loadData, getLesson, lessons } from '../stores/data'
import { getDueVocab, recordVocabResult } from '../stores/db'
import { getSetting } from '../utils/settings'
import type { VocabProgress } from '../types'

const router = useRouter()

const queue   = ref<VocabProgress[]>([])
const current = ref(0)
const phase   = ref<'question' | 'answer'>('question')
const done    = ref(false)
const correct = ref(0)

const card = computed(() => queue.value[current.value])

/** Normalize a stored word that may have been saved before parsing improvements.
 *  Handles old formats like "ざ っ し (za-s-shi) - 杂志" → "ざっし"
 *  Also handles full-width parentheses （）. */
function normalizeWord(w: string): string {
  // Strip romaji hints in ASCII or full-width parens: (za-s-shi) or （za-s-shi）
  let s = w.replace(/\s*[(\uff08][a-zA-Z][a-zA-Z\s\-.]*[)\uff09]\s*/g, ' ').trim()
  // Collapse spaces between CJK/kana characters
  s = s.replace(/([\u3040-\u30ff\u4e00-\u9fff])\s+(?=[\u3040-\u30ff\u4e00-\u9fff])/g, '$1')
  // Strip meaning part if full entry was accidentally stored: "word - meaning"
  s = s.replace(/\s+[-－]\s+.+$/, '')
  // Strip reading brackets if stored with them: "word【reading】"
  s = s.replace(/\s*【[^】]+】.*$/, '')
  return s.trim()
}

const vocabData = computed(() => {
  if (!card.value) return null
  const raw     = card.value.word
  const cleaned = normalizeWord(raw)

  // First try the stored lesson
  const lesson = getLesson(card.value.lessonId)
  if (lesson) {
    for (const sec of lesson.sections) {
      const found = sec.vocab.find(v => v.word === raw || v.word === cleaned || v.reading === cleaned)
      if (found) return found
    }
  }

  // Fallback: search ALL lessons (handles lessonId mismatch or kana-only vs kanji entries)
  for (const l of lessons.value) {
    for (const sec of l.sections) {
      const found = sec.vocab.find(v => v.word === raw || v.word === cleaned || v.reading === cleaned)
      if (found) return found
    }
  }
  return null
})

onMounted(async () => {
  await loadData()
  queue.value = await getDueVocab(getSetting('reviewLimit'))
  done.value = queue.value.length === 0
})

function showAnswer() {
  phase.value = 'answer'
}

async function respond(isCorrect: boolean) {
  if (isCorrect) correct.value++
  await recordVocabResult(card.value.lessonId, card.value.word, isCorrect)
  current.value++
  phase.value = 'question'
  if (current.value >= queue.value.length) done.value = true
}
</script>

<template>
  <div class="review-view">
    <nav class="review-nav">
      <button class="btn-back" @click="router.push('/')">← 返回</button>
      <span class="review-progress">{{ current }} / {{ queue.length }}</span>
    </nav>

    <!-- Done screen -->
    <div v-if="done" class="review-done">
      <div class="done-emoji">🎉</div>
      <h2>复习完成</h2>
      <p>正确率 {{ queue.length ? Math.round(correct / queue.length * 100) : 0 }}%</p>
      <button class="btn-primary" @click="router.push('/')">回主页</button>
    </div>

    <!-- Card -->
    <div v-else-if="card" class="card-wrap">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(current / queue.length) * 100}%` }" />
      </div>

      <div class="flash-card">
        <div class="card-word">{{ vocabData?.word ?? normalizeWord(card.word) }}</div>
        <div v-if="vocabData?.reading_display" class="card-reading">
          {{ vocabData.reading_display }}
        </div>

        <!-- Question phase -->
        <div v-if="phase === 'question'" class="card-question">
          <div class="card-mask">···</div>
          <button class="btn-reveal" @click="showAnswer">显示意思</button>
        </div>

        <!-- Answer phase -->
        <div v-else class="card-answer">
          <div class="card-meaning">{{ vocabData?.meaning ?? '—' }}</div>
          <div v-if="vocabData?.type" class="card-type">{{ vocabData.type }}</div>
          <div class="card-btns">
            <button class="btn-wrong" @click="respond(false)">✗ 忘了</button>
            <button class="btn-correct" @click="respond(true)">✓ 记得</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
