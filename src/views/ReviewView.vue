<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loadData, getLesson, lessons } from '../stores/data'
import { getDueVocab, recordVocabResult } from '../stores/db'
import { getSetting } from '../utils/settings'
import type { VocabProgress } from '../types'

const router = useRouter()
const route  = useRoute()

const queue   = ref<VocabProgress[]>([])
const current = ref(0)
const done    = ref(false)

// Per-card phase: keyed by cardKey so the leaving card keeps its phase during slide animation
const phaseMap = ref<Record<number, 'question' | 'answer'>>({})
const phase = computed<'question' | 'answer'>({
  get: () => phaseMap.value[cardKey.value] ?? 'question',
  set: (v) => { phaseMap.value = { ...phaseMap.value, [cardKey.value]: v } },
})
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

// ── Reading display & TTS toggles ──────────────────────────────────────────
const showReading = ref(localStorage.getItem('tango_show_reading') !== 'false')
const autoRead    = ref(localStorage.getItem('tango_auto_read') === 'true')

watch(showReading, v => localStorage.setItem('tango_show_reading', String(v)))
watch(autoRead,    v => localStorage.setItem('tango_auto_read',    String(v)))

function speak() {
  if (!card.value) return
  const word = vocabData.value?.word ?? normalizeWord(card.value.word)
  if (!word) return
  const utt  = new SpeechSynthesisUtterance(word)
  utt.lang   = 'ja-JP'
  utt.rate   = 0.9
  speechSynthesis.cancel()
  speechSynthesis.speak(utt)
}

// Auto-read when card changes (cardKey changes)
watch(cardKey, () => { if (autoRead.value && !done.value) speak() })

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
    phaseMap.value = {}
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
  phaseMap.value = {}
  queue.value   = await getDueVocab(getSetting('reviewLimit'), deck.value)
  current.value = 0
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

/** Mark wrong AND push card back to end of queue so it appears again this session. */
async function respondHard() {
  if (!card.value) return
  const requeued = { ...card.value }
  history.value.push({ word: card.value.word, lessonId: card.value.lessonId })
  await recordVocabResult(card.value.lessonId, card.value.word, false)
  // Add to end before goForward so the done-check sees the updated length
  queue.value = [...queue.value, requeued]
  goForward()
}

function goForward() {
  transitionName.value = 'slide-left'
  const leavingKey = cardKey.value
  cardKey.value++
  const next = current.value + 1
  if (next >= queue.value.length) {
    done.value = true
    clearSession()
  } else {
    current.value = next
    // Keep leavingKey entry so the slide-out card holds its answer phase;
    // new cardKey is not in phaseMap → computed returns 'question' automatically.
    // Trim anything older than leavingKey to avoid unbounded growth.
    const trimmed: Record<number, 'question' | 'answer'> = {}
    if (phaseMap.value[leavingKey] !== undefined) trimmed[leavingKey] = phaseMap.value[leavingKey]
    phaseMap.value = trimmed
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

    <!-- Feature toggles -->
    <div class="feature-toggles">
      <button class="toggle-btn" :class="{ active: autoRead }" @click="autoRead = !autoRead" title="自动朗读">
        🔊 朗读
      </button>
      <button class="toggle-btn" :class="{ active: !showReading }" @click="showReading = !showReading" title="隐藏注音以训练记忆">
        {{ showReading ? '👁 注音' : '🙈 注音' }}
      </button>
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
              <button class="btn-speak" @click.stop="speak" title="朗读">🔊</button>
              <div class="card-word">{{ vocabData?.word ?? normalizeWord(card.word) }}</div>
              <div v-if="vocabData?.reading_display && (showReading || phase === 'answer')" class="card-reading">
                {{ vocabData.reading_display }}
              </div>
              <div v-else-if="vocabData?.reading_display && !showReading && phase === 'question'" class="card-reading card-reading-hidden">
                ···
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
                    <button class="btn-hard" @click="respondHard">一点也不会，再来一次</button>
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
/* ── Review View Layout ───────────────────────────────────────────── */
.review-view {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 var(--space-4) var(--space-12);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.review-nav {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) var(--space-2) var(--space-4);
}

.btn-back {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  padding: var(--space-3) var(--space-2);
  border-radius: var(--radius-xs);
  transition: color var(--transition-fast);
}
.btn-back:hover { color: var(--text-primary); }

.review-progress {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: 500;
}

/* ── Feature Toggles ──────────────────────────────────────────────── */
.feature-toggles {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  justify-content: center;
}

.toggle-btn {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-default);
  background: var(--surface-secondary);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.toggle-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.toggle-btn:hover:not(.active) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

/* ── Deck Selector ────────────────────────────────────────────────── */
.deck-selector {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-7);
  justify-content: center;
}

.deck-btn {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-default);
  background: var(--surface-secondary);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.deck-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.deck-btn:hover:not(.active) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

/* ── Done Screen ──────────────────────────────────────────────────── */
.review-done {
  text-align: center;
  padding: var(--space-12) var(--space-7);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

.done-emoji { font-size: 3.5rem; }

.review-done h2 {
  font-family: var(--font-heading);
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: var(--ls-h3);
}

.review-done p {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
}

.done-btns {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--space-3);
}

.btn-primary {
  padding: var(--space-4) var(--space-9);
  background: var(--accent);
  color: #fff;
  border: 1px solid transparent;
  border-radius: var(--radius-xs);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
}
.btn-primary:hover { background: var(--accent-hover); }
.btn-primary:active { background: var(--accent-active); transform: scale(0.97); }

.btn-secondary {
  padding: var(--space-4) var(--space-9);
  background: var(--surface-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xs);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

/* ── Resample ─────────────────────────────────────────────────────── */
.resample-row {
  margin-top: var(--space-4);
  text-align: center;
}

.btn-resample {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-xs);
  transition: color var(--transition-fast);
}
.btn-resample:hover { color: var(--text-secondary); }

/* ── Card Stage ───────────────────────────────────────────────────── */
.card-stage {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-bar {
  width: 100%;
  max-width: 440px;
  height: 3px;
  background: rgba(0, 0, 0, 0.07);
  border-radius: var(--radius-pill);
  margin-bottom: var(--space-7);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: var(--radius-pill);
  transition: width 0.3s ease;
}

/* ── Card Row (ghost + main + ghost) ──────────────────────────────── */
.card-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  position: relative;
  min-height: 340px;
}

.card-ghost-placeholder { width: 52px; flex-shrink: 0; }

.card-ghost {
  width: 52px;
  flex-shrink: 0;
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--surface-secondary);
  overflow: hidden;
  padding: var(--space-4) var(--space-2);
  user-select: none;
  transition: opacity var(--transition-base);
}
.card-ghost-left  { opacity: 0.40; cursor: pointer; }
.card-ghost-right { opacity: 0.20; cursor: default; }
.card-ghost-left:hover { opacity: 0.65; }

.ghost-word {
  font-family: var(--font-jp);
  font-size: 0.78rem;
  color: var(--text-secondary);
  text-align: center;
  word-break: break-word;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  max-height: 160px;
  overflow: hidden;
}

.ghost-label {
  font-size: 0.52rem;
  color: var(--text-tertiary);
  text-align: center;
  writing-mode: horizontal-tb;
  font-weight: 500;
}

/* ── Main Card Wrap ───────────────────────────────────────────────── */
.card-wrap {
  flex: 1;
  max-width: 440px;
  min-width: 0;
  position: relative;
  overflow: hidden;
  min-height: 300px;
}

/* ── Flash Card ───────────────────────────────────────────────────── */
.flash-card {
  position: relative;
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-10) var(--space-8) var(--space-8);
  width: 100%;
  box-shadow: var(--shadow-deep);
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  transition: box-shadow var(--transition-base), border-color var(--transition-base);
}

.flash-card.quick-peek {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 117, 222, 0.12), var(--shadow-deep);
}

.card-word {
  font-family: var(--font-jp);
  font-size: clamp(2rem, 10vw, 3.5rem);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: break-word;
}

.btn-speak {
  position: absolute;
  top: var(--space-4);
  right: var(--space-5);
  background: var(--surface-secondary);
  border: 1px solid var(--border-subtle);
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0.5;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast), background var(--transition-fast);
  line-height: 1;
}
.btn-speak:hover {
  opacity: 1;
  background: var(--surface-hover);
}

.card-reading {
  font-family: var(--font-jp);
  font-size: 1rem;
  color: var(--text-tertiary);
  margin-top: -4px;
}
.card-reading-hidden {
  opacity: 0.2;
  letter-spacing: 0.2em;
}

/* ── Fixed-height card body ───────────────────────────────────────── */
.card-body {
  width: 100%;
  height: 200px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-3);
  overflow: visible;
}

.card-question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  width: 100%;
}

.card-mask {
  font-size: 1.75rem;
  color: var(--text-tertiary);
  letter-spacing: 0.2em;
  opacity: 0.4;
}

.card-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

.btn-reveal {
  padding: var(--space-4) 0;
  width: 100%;
  max-width: 240px;
  background: var(--accent);
  color: #fff;
  border: 1px solid transparent;
  border-radius: var(--radius-xs);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  transition: background var(--transition-fast), transform var(--transition-fast);
}
.btn-reveal:hover { background: var(--accent-hover); }
.btn-reveal:active { background: var(--accent-active); transform: scale(0.97); }

.btn-quick-skip {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--text-tertiary);
  border: none;
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-xs);
  transition: color var(--transition-fast);
}
.btn-quick-skip:hover { color: var(--text-secondary); }

/* ── Answer Phase ─────────────────────────────────────────────────── */
.card-answer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  margin-top: var(--space-3);
}

.card-meaning {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.card-type {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--ls-badge);
  color: var(--accent-text);
  background: var(--accent-bg);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-pill);
}

.card-btns {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-3);
  width: 100%;
}

.btn-wrong, .btn-correct {
  flex: 1;
  padding: var(--space-5) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  white-space: nowrap;
  transition: background var(--transition-fast), transform var(--transition-fast);
}
.btn-wrong {
  background: rgba(192, 57, 43, 0.09);
  color: var(--color-danger-dark);
  border-color: rgba(192, 57, 43, 0.18);
}
.btn-correct {
  background: rgba(26, 174, 57, 0.09);
  color: var(--color-success-dark);
  border-color: rgba(26, 174, 57, 0.18);
}
.btn-wrong:hover   { background: rgba(192, 57, 43, 0.17); }
.btn-correct:hover { background: rgba(26, 174, 57, 0.17); }
.btn-wrong:active, .btn-correct:active { transform: scale(0.97); }

.btn-hard {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-xs);
  transition: color var(--transition-fast);
}
.btn-hard:hover { color: var(--color-danger-dark); }

/* ── Keyboard Hints ───────────────────────────────────────────────── */
kbd {
  display: inline-block;
  font-size: 0.70em;
  padding: 1px 5px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-xs);
  opacity: 0.55;
  font-family: var(--font-mono);
  vertical-align: middle;
  line-height: 1.4;
  color: var(--text-secondary);
  background: var(--surface-secondary);
}

.kbd-hint {
  display: flex;
  gap: var(--space-7);
  margin-top: var(--space-5);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  font-weight: 500;
  justify-content: center;
  flex-wrap: wrap;
}

/* ── Phase Fade Transition ────────────────────────────────────────── */
.phase-fade-enter-active,
.phase-fade-leave-active { transition: opacity 0.15s ease; }
.phase-fade-enter-from,
.phase-fade-leave-to     { opacity: 0; }

/* ── Slide Transitions ────────────────────────────────────────────── */
.slide-left-enter-active,
.slide-right-enter-active {
  transition: transform 0.26s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.26s ease;
}
.slide-left-leave-active,
.slide-right-leave-active {
  transition: transform 0.26s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.26s ease;
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
