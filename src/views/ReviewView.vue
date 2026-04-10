<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loadData, getLesson, lessons } from '../stores/data'
import { getDueVocab, recordVocabResult } from '../stores/db'
import { getSetting } from '../utils/settings'
import type { VocabProgress } from '../types'

const router = useRouter()
const route  = useRoute()

const queue   = ref<VocabProgress[]>([])
const current = ref(0)
const phase   = ref<'question' | 'answer'>('question')
const done    = ref(false)
const correct = ref(0)
const deck    = ref<'all' | 'library' | 'favorites'>('all')

// Animation direction: 'left' = forward, 'right' = backward
const transitionName = ref('slide-left')
const cardKey        = ref(0)
const quickPeeked    = ref(false)

// Undo history stack
const history = ref<Array<{ word: string; lessonId: string }>>([])

const card     = computed(() => queue.value[current.value])
const prevCard = computed(() => current.value > 0 ? queue.value[current.value - 1] : null)
const nextCard = computed(() => current.value + 1 < queue.value.length ? queue.value[current.value + 1] : null)

/** Normalize a stored word that may have been saved before parsing improvements. */
function normalizeWord(w: string): string {
  let s = w.replace(/\s*[(\uff08][a-zA-Z][a-zA-Z\s\-.]*[)\uff09]\s*/g, ' ').trim()
  s = s.replace(/([\u3040-\u30ff\u4e00-\u9fff])\s+(?=[\u3040-\u30ff\u4e00-\u9fff])/g, '$1')
  s = s.replace(/\s+[-－]\s+.+$/, '')
  s = s.replace(/\s*【[^】]+】.*$/, '')
  return s.trim()
}

function lookupVocab(vp: VocabProgress | null) {
  if (!vp) return null
  const raw     = vp.word
  const cleaned = normalizeWord(raw)
  const lesson  = getLesson(vp.lessonId)
  if (lesson) {
    for (const sec of lesson.sections) {
      const found = sec.vocab.find(v => v.word === raw || v.word === cleaned || v.reading === cleaned)
      if (found) return found
    }
  }
  for (const l of lessons.value) {
    for (const sec of l.sections) {
      const found = sec.vocab.find(v => v.word === raw || v.word === cleaned || v.reading === cleaned)
      if (found) return found
    }
  }
  return null
}

const vocabData = computed(() => lookupVocab(card.value))

const deckLabel = computed(() => {
  if (deck.value === 'favorites') return '⭐ 收藏夹'
  if (deck.value === 'library') return '📚 学习库'
  return '全部'
})

// ── Session persistence ─────────────────────────────────────────────────
const SESSION_KEY = 'tango_review_session'
const SESSION_TTL = 12 * 60 * 60 * 1000   // 12 hours

interface SavedSession {
  ids: string[]          // VocabProgress IDs in order
  current: number
  correct: number
  deck: string
  savedAt: number
}

function saveSession() {
  if (done.value || queue.value.length === 0) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  const s: SavedSession = {
    ids:     queue.value.map(v => v.id),
    current: current.value,
    correct: correct.value,
    deck:    deck.value,
    savedAt: Date.now(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(s))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

async function tryRestoreSession(): Promise<boolean> {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const s: SavedSession = JSON.parse(raw)
    if (Date.now() - s.savedAt > SESSION_TTL) { clearSession(); return false }
    if (s.deck !== deck.value) return false
    if (!s.ids?.length) return false

    // Reload the actual VocabProgress records from DB in saved order
    const { db } = await import('../stores/db')
    const all = await db.vocabProgress.bulkGet(s.ids)
    const restored = all.filter(Boolean) as typeof queue.value
    if (restored.length === 0) return false

    queue.value   = restored
    current.value = Math.min(s.current, restored.length - 1)
    correct.value = s.correct
    phase.value   = 'question'
    done.value    = false
    history.value = []
    cardKey.value++
    return true
  } catch {
    clearSession()
    return false
  }
}

async function loadQueue(fresh = false) {
  if (!fresh) {
    const restored = await tryRestoreSession()
    if (restored) return
  }
  queue.value   = await getDueVocab(getSetting('reviewLimit'), deck.value)
  current.value = 0
  phase.value   = 'question'
  correct.value = 0
  done.value    = queue.value.length === 0
  history.value = []
  cardKey.value++
  saveSession()
}

onMounted(async () => {
  await loadData()
  const queryDeck = route.query.deck as string | undefined
  if (queryDeck === 'favorites' || queryDeck === 'library' || queryDeck === 'all') {
    deck.value = queryDeck
  }
  await loadQueue()
  window.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
})

async function switchDeck(newDeck: 'all' | 'library' | 'favorites') {
  deck.value = newDeck
  clearSession()
  await loadQueue(true)
}

function showAnswer() {
  phase.value = 'answer'
}

/** Flash answer briefly then auto-mark correct. */
async function quickSkip() {
  if (phase.value === 'answer') { respond(true); return }
  quickPeeked.value = true
  phase.value = 'answer'
  await new Promise(r => setTimeout(r, 450))
  quickPeeked.value = false
  respond(true)
}

async function respond(isCorrect: boolean) {
  if (!card.value) return
  if (isCorrect) correct.value++
  history.value.push({ word: card.value.word, lessonId: card.value.lessonId })
  await recordVocabResult(card.value.lessonId, card.value.word, isCorrect)
  goForward()
}

function goForward() {
  transitionName.value = 'slide-left'
  cardKey.value++
  const next = current.value + 1
  if (next >= queue.value.length) {
    done.value = true
    clearSession()
  } else {
    current.value = next
    phase.value   = 'question'
    saveSession()
  }
}

function goBack() {
  if (current.value === 0) return
  history.value.pop()
  transitionName.value = 'slide-right'
  cardKey.value++
  current.value--
  phase.value = 'question'
  saveSession()
}

function handleKey(e: KeyboardEvent) {
  if (done.value) return
  switch (e.key) {
    case ' ':
    case 'Enter':
      e.preventDefault()
      if (phase.value === 'question') showAnswer()
      else respond(true)
      break
    case 'ArrowRight':
    case 'l':
    case 'L':
      e.preventDefault()
      if (phase.value === 'answer') respond(true)
      else quickSkip()
      break
    case 'ArrowLeft':
    case 'h':
    case 'H':
      e.preventDefault()
      if (phase.value === 'answer') respond(false)
      else goBack()
      break
    case 'f':
    case 'F':
      if (phase.value === 'answer') { e.preventDefault(); respond(false) }
      break
    case 'z':
    case 'Z':
    case 'Backspace':
      e.preventDefault()
      goBack()
      break
  }
}
</script>

<template>
  <div class="review-view">
    <nav class="review-nav">
      <button class="btn-back" @click="router.push('/')">← 返回</button>
      <span class="review-progress">{{ deckLabel }} · {{ current }} / {{ queue.length }}</span>
    </nav>

    <!-- Deck selector -->
    <div class="deck-selector">
      <button class="deck-btn" :class="{ active: deck === 'all' }"       @click="switchDeck('all')">全部</button>
      <button class="deck-btn" :class="{ active: deck === 'favorites' }" @click="switchDeck('favorites')">⭐ 收藏夹</button>
      <button class="deck-btn" :class="{ active: deck === 'library' }"   @click="switchDeck('library')">📚 学习库</button>
    </div>

    <!-- Done screen -->
    <div v-if="done" class="review-done">
      <div class="done-emoji">🎉</div>
      <h2>复习完成</h2>
      <p>{{ queue.length }} 词 · 正确率 {{ queue.length ? Math.round(correct / queue.length * 100) : 0 }}%</p>
      <div class="done-btns">
        <button class="btn-primary" @click="router.push('/')">回主页</button>
        <button class="btn-secondary" @click="loadQueue(true)">再来一组</button>
      </div>
    </div>

    <!-- Card stage with ghost cards -->
    <div v-else-if="card" class="card-stage">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(current / queue.length) * 100}%` }" />
      </div>

      <div class="card-row">
        <!-- Left ghost: previous card -->
        <div
          v-if="prevCard"
          class="card-ghost card-ghost-left"
          @click="goBack"
          title="返回上一张 (← / Z)"
        >
          <div class="ghost-word">{{ lookupVocab(prevCard)?.word ?? normalizeWord(prevCard.word) }}</div>
          <div class="ghost-label">← 返回</div>
        </div>
        <div v-else class="card-ghost-placeholder" />

        <!-- Main card -->
        <div class="card-wrap">
          <Transition :name="transitionName">
            <div class="flash-card" :key="cardKey" :class="{ 'quick-peek': quickPeeked }">
              <div class="card-word">{{ vocabData?.word ?? normalizeWord(card.word) }}</div>
              <div v-if="vocabData?.reading_display" class="card-reading">
                {{ vocabData.reading_display }}
              </div>

              <!-- Body: fixed height so card doesn't jump between phases -->
              <div class="card-body">
                <Transition name="phase-fade" mode="out-in">
                  <!-- Question phase -->
                  <div v-if="phase === 'question'" class="card-question" key="q">
                    <div class="card-mask">···</div>
                    <div class="card-actions">
                      <button class="btn-reveal" @click="showAnswer">
                        显示意思 <kbd>Space</kbd>
                      </button>
                      <button class="btn-quick-skip" @click="quickSkip">
                        ⚡ 已知 <kbd>→</kbd>
                      </button>
                    </div>
                  </div>

                  <!-- Answer phase -->
                  <div v-else class="card-answer" key="a">
                    <div class="card-meaning">{{ vocabData?.meaning ?? '—' }}</div>
                    <div v-if="vocabData?.type" class="card-type">{{ vocabData.type }}</div>
                    <div class="card-btns">
                      <button class="btn-wrong"   @click="respond(false)">✗ 忘了 <kbd>←</kbd></button>
                      <button class="btn-correct" @click="respond(true)">✓ 记得 <kbd>→</kbd></button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Right ghost: next card -->
        <div v-if="nextCard" class="card-ghost card-ghost-right">
          <div class="ghost-word">{{ lookupVocab(nextCard)?.word ?? normalizeWord(nextCard.word) }}</div>
          <div class="ghost-label">下一张</div>
        </div>
        <div v-else class="card-ghost-placeholder" />
      </div>

      <!-- Resample link -->
      <div class="resample-row">
        <button class="btn-resample" @click="loadQueue(true)">↺ 重新采样</button>
      </div>

      <!-- Keyboard hint bar -->
      <div class="kbd-hint">
        <template v-if="phase === 'question'">
          <span><kbd>Space</kbd> 翻开</span>
          <span><kbd>→</kbd> 直接过</span>
          <span><kbd>←</kbd> / <kbd>Z</kbd> 返回</span>
        </template>
        <template v-else>
          <span><kbd>→</kbd> 记得</span>
          <span><kbd>←</kbd> 忘了</span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-view {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 8px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.review-nav {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 8px 8px;
}
.btn-back {
  background: none;
  border: none;
  color: var(--text2);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 6px 0;
}
.btn-back:hover { color: var(--text1); }
.review-progress { font-size: 0.85rem; color: var(--text2); }

/* Deck selector */
.deck-selector {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  justify-content: center;
}
.deck-btn {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text2);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all .15s;
}
.deck-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.deck-btn:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

/* Done */
.review-done { text-align: center; padding: 40px 20px; }
.done-emoji  { font-size: 3rem; margin-bottom: 12px; }
.review-done h2 { font-size: 1.4rem; margin-bottom: 8px; }
.review-done p  { color: var(--text2); margin-bottom: 24px; }
.btn-primary {
  padding: 12px 32px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover { opacity: .85; }

.done-btns { display: flex; gap: 12px; justify-content: center; }
.btn-secondary {
  padding: 12px 32px;
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-secondary:hover { background: rgba(139,92,246,.1); }

.resample-row {
  margin-top: 10px;
  text-align: center;
}
.btn-resample {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 0.78rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color .15s;
}
.btn-resample:hover { color: var(--text1); }

/* Card stage */
.card-stage {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-bar {
  width: 100%;
  max-width: 440px;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  margin-bottom: 20px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width .3s ease;
}

/* Card row: ghost + main + ghost */
.card-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  position: relative;
  min-height: 340px;
}

.card-ghost-placeholder { width: 56px; flex-shrink: 0; }

.card-ghost {
  width: 56px;
  flex-shrink: 0;
  height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  overflow: hidden;
  padding: 10px 4px;
  user-select: none;
  transition: opacity .2s;
}
.card-ghost-left  { opacity: 0.38; cursor: pointer; }
.card-ghost-right { opacity: 0.22; cursor: default; }
.card-ghost-left:hover { opacity: 0.6; }

.ghost-word {
  font-family: var(--font-jp);
  font-size: 0.8rem;
  color: var(--text1);
  text-align: center;
  word-break: break-word;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  max-height: 180px;
  overflow: hidden;
}
.ghost-label {
  font-size: 0.55rem;
  color: var(--text2);
  text-align: center;
  writing-mode: horizontal-tb;
}

/* Main card wrap for overflow clipping during transitions */
.card-wrap {
  flex: 1;
  max-width: 440px;
  min-width: 0;
  position: relative;
  overflow: hidden;
  min-height: 300px;
}

/* Flash card */
.flash-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 36px 24px 28px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0,0,0,.18);
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: box-shadow .2s, border-color .2s;
}
.flash-card.quick-peek {
  border-color: var(--accent);
  box-shadow: 0 4px 32px rgba(139,92,246,.3);
}

.card-word {
  font-family: var(--font-jp);
  font-size: clamp(2rem, 10vw, 3.5rem);
  font-weight: 700;
  color: var(--text1);
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: break-word;
}
.card-reading {
  font-family: var(--font-jp);
  font-size: 1rem;
  color: var(--text2);
  margin-top: -6px;
}

/* Fixed-height body prevents card from jumping when phase changes */
.card-body {
  width: 100%;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.card-question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}
.card-mask { font-size: 2rem; color: var(--text2); letter-spacing: .2em; }

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.btn-reveal {
  padding: 12px 24px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity .15s;
}
.btn-reveal:hover { opacity: .85; }

.btn-quick-skip {
  padding: 8px 14px;
  background: transparent;
  color: var(--accent2);
  border: 1px solid var(--accent2);
  border-radius: 8px;
  font-size: 0.82rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background .15s;
}
.btn-quick-skip:hover { background: rgba(139,92,246,.12); }

.card-answer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
}
.card-meaning { font-size: 1.3rem; font-weight: 600; color: var(--text1); }
.card-type {
  font-size: 0.8rem;
  color: var(--accent2);
  background: rgba(139,92,246,.1);
  padding: 3px 10px;
  border-radius: 10px;
}

.card-btns {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  width: 100%;
}
.btn-wrong, .btn-correct {
  flex: 1;
  padding: 14px 8px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  transition: background .15s;
}
.btn-wrong   { background: rgba(239,68,68,.15);  color: var(--red);   }
.btn-correct { background: rgba(34,197,94,.15);  color: var(--green); }
.btn-wrong:hover   { background: rgba(239,68,68,.28); }
.btn-correct:hover { background: rgba(34,197,94,.28); }

/* Keyboard hint */
kbd {
  display: inline-block;
  font-size: 0.72em;
  padding: 1px 5px;
  border: 1px solid currentColor;
  border-radius: 4px;
  opacity: 0.55;
  font-family: monospace;
  vertical-align: middle;
  line-height: 1.4;
}
.kbd-hint {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  font-size: 0.78rem;
  color: var(--text2);
  justify-content: center;
  flex-wrap: wrap;
}

/* Phase fade (question ↔ answer within same card) */
.phase-fade-enter-active,
.phase-fade-leave-active { transition: opacity .15s ease; }
.phase-fade-enter-from,
.phase-fade-leave-to     { opacity: 0; }

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform .26s cubic-bezier(.4,0,.2,1), opacity .26s ease;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}
.slide-left-enter-from  { transform: translateX(52px);  opacity: 0; }
.slide-left-leave-to    { transform: translateX(-52px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-52px); opacity: 0; }
.slide-right-leave-to   { transform: translateX(52px);  opacity: 0; }
</style>
