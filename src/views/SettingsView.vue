<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loadSettings, saveSettings } from '../utils/settings'
import { db, bulkAddVocab } from '../stores/db'
import { loadData, getLesson, chapters, getLessonsForChapter } from '../stores/data'
import type { VocabProgress, SectionProgress } from '../types'

const router = useRouter()

// ── Settings ──────────────────────────────────────────────────────────────
const settings = ref(loadSettings())

function save() {
  saveSettings(settings.value)
  savedToast.value = true
  setTimeout(() => { savedToast.value = false }, 1500)
}

const savedToast = ref(false)

// ── Debug data ────────────────────────────────────────────────────────────
const vocabRows   = ref<VocabProgress[]>([])
const sectionRows = ref<SectionProgress[]>([])
const loading     = ref(true)
const filterLesson = ref('')

const lessonIds = computed(() => {
  const ids = new Set(vocabRows.value.map(r => r.lessonId))
  return ['', ...Array.from(ids).sort()]
})

const filteredVocab = computed(() => {
  const rows = filterLesson.value
    ? vocabRows.value.filter(r => r.lessonId === filterLesson.value)
    : vocabRows.value
  return rows.sort((a, b) => a.nextReview - b.nextReview)
})

const stats = computed(() => ({
  vocabTotal:   vocabRows.value.length,
  vocabDue:     vocabRows.value.filter(r => r.nextReview <= Date.now()).length,
  sectionsRead: sectionRows.value.filter(r => r.status === 'read' || r.status === 'reviewing').length,
  sectionsTotal: sectionRows.value.length,
}))

async function loadDebug() {
  loading.value = true
  await loadData()
  const [v, s] = await Promise.all([
    db.vocabProgress.toArray(),
    db.sectionProgress.toArray(),
  ])
  vocabRows.value   = v
  sectionRows.value = s
  loading.value = false
}

onMounted(loadDebug)

// ── Actions ───────────────────────────────────────────────────────────────
const confirmClear = ref<'all' | 'vocab' | 'sections' | null>(null)
const confirmStep  = ref<1 | 2>(1)   // two-step confirmation

function requestClear(type: 'all' | 'vocab' | 'sections') {
  confirmClear.value = type
  confirmStep.value  = 1
}

function confirmStep1() {
  confirmStep.value = 2
}

async function doClear() {
  if (!confirmClear.value || confirmStep.value !== 2) return
  if (confirmClear.value === 'all') {
    await db.vocabProgress.clear()
    await db.sectionProgress.clear()
    localStorage.removeItem('lastLesson')
  } else if (confirmClear.value === 'vocab') {
    await db.vocabProgress.clear()
  } else if (confirmClear.value === 'sections') {
    await db.sectionProgress.clear()
  }
  confirmClear.value = null
  confirmStep.value  = 1
  await loadDebug()
}

function cancelClear() {
  confirmClear.value = null
  confirmStep.value  = 1
}

const confirmLessonId = ref<string | null>(null)
const confirmLessonStep = ref<1 | 2>(1)

function requestClearLesson(lessonId: string) {
  confirmLessonId.value   = lessonId
  confirmLessonStep.value = 1
}

async function doClearLesson() {
  if (!confirmLessonId.value || confirmLessonStep.value !== 2) return
  await db.vocabProgress.where('lessonId').equals(confirmLessonId.value).delete()
  await db.sectionProgress.where('lessonId').equals(confirmLessonId.value).delete()
  confirmLessonId.value   = null
  confirmLessonStep.value = 1
  await loadDebug()
}

function exportJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    vocab: vocabRows.value,
    sections: sectionRows.value,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `tango-backup-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function fmtDate(ts: number) {
  if (!ts || ts === 0) return '—'
  const diff = ts - Date.now()
  if (diff < 0) return '已到期'
  const days = Math.ceil(diff / 86_400_000)
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  return `${days}天后`
}

function lessonTitle(id: string) {
  const l = getLesson(id)
  return l ? l.title : id
}

// ── Vocab Library ─────────────────────────────────────────────────────────
const activeTab = ref<'settings' | 'library' | 'debug'>('settings')

// Set of lessonIds currently in vocabProgress
const addedLessonVocab = computed(() => {
  const map: Record<string, Set<string>> = {}
  for (const r of vocabRows.value) {
    if (!map[r.lessonId]) map[r.lessonId] = new Set()
    map[r.lessonId].add(r.word)
  }
  return map
})

function lessonAddedCount(lessonId: string) {
  return addedLessonVocab.value[lessonId]?.size ?? 0
}
function lessonTotalVocab(lessonId: string) {
  return getLesson(lessonId)?.sections.reduce((s, sec) => s + sec.vocab.filter(v => !!v.word).length, 0) ?? 0
}
function lessonFullyAdded(lessonId: string) {
  return lessonAddedCount(lessonId) >= lessonTotalVocab(lessonId) && lessonTotalVocab(lessonId) > 0
}

const addingLesson = ref<string | null>(null)

async function addLessonVocab(lessonId: string) {
  const lesson = getLesson(lessonId)
  if (!lesson) return
  addingLesson.value = lessonId
  const words = lesson.sections.flatMap(s => s.vocab.map(v => v.word).filter(Boolean))
  await bulkAddVocab(lessonId, words)
  // refresh
  const v = await db.vocabProgress.toArray()
  vocabRows.value = v
  addingLesson.value = null
}

async function addAllVocab() {
  for (const ch of chapters.value) {
    for (const lesson of getLessonsForChapter(ch.id)) {
      if (!lessonFullyAdded(lesson.id)) {
        await addLessonVocab(lesson.id)
      }
    }
  }
}

const totalVocabInDB = computed(() => vocabRows.value.length)
const totalVocabInData = computed(() =>
  chapters.value.reduce((sum, ch) =>
    sum + getLessonsForChapter(ch.id).reduce((s, l) =>
      s + lessonTotalVocab(l.id), 0), 0)
)
</script>

<template>
  <div class="settings-view">
    <nav class="review-nav">
      <button class="btn-back" @click="router.push('/')">← 返回</button>
      <span class="review-progress">设置</span>
    </nav>

    <!-- Tabs -->
    <div class="settings-tabs">
      <button :class="['tab', { active: activeTab === 'settings' }]" @click="activeTab = 'settings'">⚙️ 设置</button>
      <button :class="['tab', { active: activeTab === 'library' }]" @click="activeTab = 'library'">📚 词库</button>
      <button :class="['tab', { active: activeTab === 'debug' }]" @click="activeTab = 'debug'">🔍 调试</button>
    </div>

    <!-- ── Settings ────────────────────────────────────────────────── -->
    <section v-show="activeTab === 'settings'" class="settings-section">
      <h2 class="settings-h2">⚙️ 设置</h2>

      <div class="setting-row">
        <label class="setting-label">
          <span>每次复习词数</span>
          <span class="setting-value">{{ settings.reviewLimit }}</span>
        </label>
        <div class="setting-chips">
          <button v-for="n in [10, 20, 30, 50]" :key="n"
            :class="['chip', { active: settings.reviewLimit === n }]"
            @click="settings.reviewLimit = n">{{ n }}</button>
        </div>
      </div>

      <div class="setting-row">
        <label class="setting-label">
          <span>语音语速</span>
          <span class="setting-value">{{ settings.ttsRate }}x</span>
        </label>
        <div class="setting-chips">
          <button v-for="r in [0.75, 1.0, 1.25, 1.5]" :key="r"
            :class="['chip', { active: settings.ttsRate === r }]"
            @click="settings.ttsRate = r">{{ r }}x</button>
        </div>
      </div>

      <div class="setting-row">
        <label class="setting-label">
          <span>语音音调</span>
          <span class="setting-value">{{ settings.ttsPitch }}</span>
        </label>
        <div class="setting-chips">
          <button v-for="p in [0.75, 1.0, 1.25, 1.5]" :key="p"
            :class="['chip', { active: settings.ttsPitch === p }]"
            @click="settings.ttsPitch = p">{{ p }}</button>
        </div>
      </div>

      <button class="btn-save" @click="save">
        {{ savedToast ? '✓ 已保存' : '保存设置' }}
      </button>
    </section>

    <!-- ── Vocab Library ─────────────────────────────────────────── -->
    <section v-show="activeTab === 'library'" class="settings-section">
      <h2 class="settings-h2">📚 词库管理</h2>

      <div class="library-summary">
        <span>已加入复习：<b>{{ totalVocabInDB }}</b> / {{ totalVocabInData }} 词</span>
        <button class="btn-add-all-global" @click="addAllVocab">⚡ 一键加入全部词汇</button>
      </div>

      <div v-for="ch in chapters" :key="ch.id" class="library-chapter">
        <div class="library-chapter-title">{{ ch.title }}</div>
        <div class="library-lessons">
          <div
            v-for="lesson in getLessonsForChapter(ch.id)"
            :key="lesson.id"
            class="library-lesson"
          >
            <div class="library-lesson-info">
              <span class="library-lesson-name">{{ lesson.title }}</span>
              <span class="library-lesson-count"
                :class="lessonFullyAdded(lesson.id) ? 'count-done' : 'count-partial'">
                {{ lessonAddedCount(lesson.id) }}/{{ lessonTotalVocab(lesson.id) }}
              </span>
            </div>
            <button
              v-if="!lessonFullyAdded(lesson.id) && lessonTotalVocab(lesson.id) > 0"
              class="btn-lesson-add"
              :disabled="addingLesson === lesson.id"
              @click="addLessonVocab(lesson.id)"
            >
              {{ addingLesson === lesson.id ? '…' : '+ 加入' }}
            </button>
            <span v-else-if="lessonTotalVocab(lesson.id) > 0" class="lesson-done-badge">✓</span>
            <span v-else class="lesson-no-vocab">无词汇</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Debug ───────────────────────────────────────────────────── -->
    <section v-show="activeTab === 'debug'" class="settings-section">
      <h2 class="settings-h2">🔍 调试 / 数据</h2>

      <div v-if="loading" class="debug-loading">加载中…</div>
      <template v-else>

        <!-- Stats overview -->
        <div class="debug-stats">
          <div class="debug-stat">
            <div class="debug-stat-num">{{ stats.vocabTotal }}</div>
            <div class="debug-stat-label">词汇记录</div>
          </div>
          <div class="debug-stat">
            <div class="debug-stat-num">{{ stats.vocabDue }}</div>
            <div class="debug-stat-label">今日待复习</div>
          </div>
          <div class="debug-stat">
            <div class="debug-stat-num">{{ stats.sectionsRead }}</div>
            <div class="debug-stat-label">已读章节</div>
          </div>
          <div class="debug-stat">
            <div class="debug-stat-num">{{ stats.sectionsTotal }}</div>
            <div class="debug-stat-label">章节总记录</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="debug-actions">
          <button class="btn-export" @click="exportJSON">📥 导出 JSON</button>
          <button class="btn-refresh" @click="loadDebug">🔄 刷新</button>
        </div>

        <!-- Vocab table -->
        <div class="debug-filter">
          <span class="debug-filter-label">按课程筛选：</span>
          <select v-model="filterLesson" class="debug-select">
            <option value="">全部（{{ vocabRows.length }} 条）</option>
            <option v-for="id in lessonIds.slice(1)" :key="id" :value="id">
              {{ lessonTitle(id) }}（{{ vocabRows.filter(r => r.lessonId === id).length }}）
            </option>
          </select>
          <button v-if="filterLesson" class="btn-clear-lesson danger-sm"
            @click="requestClearLesson(filterLesson)">清除该课程数据</button>
        </div>

        <div class="debug-table-wrap">
          <table class="debug-table">
            <thead>
              <tr>
                <th>词</th>
                <th>课程</th>
                <th>下次复习</th>
                <th>✓</th>
                <th>✗</th>
                <th>间隔(天)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredVocab" :key="row.id"
                :class="{ 'row-due': row.nextReview <= Date.now() }">
                <td class="td-word">{{ row.word }}</td>
                <td class="td-lesson">{{ lessonTitle(row.lessonId) }}</td>
                <td :class="row.nextReview <= Date.now() ? 'td-due' : ''">{{ fmtDate(row.nextReview) }}</td>
                <td class="td-correct">{{ row.correct }}</td>
                <td class="td-wrong">{{ row.incorrect }}</td>
                <td>{{ Math.round(row.interval) }}</td>
              </tr>
              <tr v-if="filteredVocab.length === 0">
                <td colspan="6" class="td-empty">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Danger zone -->
        <div class="danger-zone">
          <div class="danger-title">⚠️ 危险操作</div>
          <div class="danger-btns">
            <button class="btn-danger" @click="requestClear('vocab')">清除复习进度</button>
            <button class="btn-danger" @click="requestClear('sections')">清除阅读进度</button>
            <button class="btn-danger btn-danger-all" @click="requestClear('all')">清除全部数据</button>
          </div>
        </div>

      </template>
    </section>

    <!-- Confirm dialog (global clear) -->
    <div v-if="confirmClear" class="confirm-overlay" @click.self="cancelClear">
      <div class="confirm-box">
        <div class="confirm-step-indicator">
          <span :class="['step-dot', { active: confirmStep >= 1 }]" />
          <span :class="['step-dot', { active: confirmStep >= 2 }]" />
        </div>

        <!-- Step 1 -->
        <template v-if="confirmStep === 1">
          <div class="confirm-icon">⚠️</div>
          <div class="confirm-msg">
            <template v-if="confirmClear === 'all'">确定要清除<b>全部学习数据</b>吗？</template>
            <template v-else-if="confirmClear === 'vocab'">确定要清除所有<b>复习进度</b>吗？</template>
            <template v-else>确定要清除所有<b>阅读进度</b>吗？</template>
          </div>
          <div class="confirm-btns">
            <button class="btn-cancel" @click="cancelClear">取消</button>
            <button class="btn-confirm-danger" @click="confirmStep1">是的，继续 →</button>
          </div>
        </template>

        <!-- Step 2 -->
        <template v-else>
          <div class="confirm-icon">🚨</div>
          <div class="confirm-msg">
            <template v-if="confirmClear === 'all'"><b>最后确认：</b>清除后<b>无法恢复</b>，全部进度将丢失。</template>
            <template v-else-if="confirmClear === 'vocab'"><b>最后确认：</b>所有单词的复习记录将被<b>永久删除</b>。</template>
            <template v-else><b>最后确认：</b>所有章节的阅读记录将被<b>永久删除</b>。</template>
          </div>
          <div class="confirm-btns">
            <button class="btn-cancel" @click="cancelClear">我再想想</button>
            <button class="btn-confirm-danger" @click="doClear">确认，永久删除</button>
          </div>
        </template>
      </div>
    </div>

    <!-- Confirm dialog (per-lesson clear) -->
    <div v-if="confirmLessonId" class="confirm-overlay" @click.self="confirmLessonId = null; confirmLessonStep = 1">
      <div class="confirm-box">
        <div class="confirm-step-indicator">
          <span :class="['step-dot', { active: confirmLessonStep >= 1 }]" />
          <span :class="['step-dot', { active: confirmLessonStep >= 2 }]" />
        </div>

        <template v-if="confirmLessonStep === 1">
          <div class="confirm-icon">⚠️</div>
          <div class="confirm-msg">确定要清除课程<b>「{{ lessonTitle(confirmLessonId!) }}」</b>的数据吗？</div>
          <div class="confirm-btns">
            <button class="btn-cancel" @click="confirmLessonId = null; confirmLessonStep = 1">取消</button>
            <button class="btn-confirm-danger" @click="confirmLessonStep = 2">是的，继续 →</button>
          </div>
        </template>
        <template v-else>
          <div class="confirm-icon">🚨</div>
          <div class="confirm-msg"><b>最后确认：</b>该课程的所有进度将被<b>永久删除</b>。</div>
          <div class="confirm-btns">
            <button class="btn-cancel" @click="confirmLessonId = null; confirmLessonStep = 1">我再想想</button>
            <button class="btn-confirm-danger" @click="doClearLesson">确认，永久删除</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Settings View ────────────────────────────────────────────────── */
.settings-view {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 var(--space-6) var(--space-12);
}

/* ── Tabs ─────────────────────────────────────────────────────────── */
.settings-tabs {
  display: flex;
  gap: 0;
  margin-top: var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.tab {
  padding: var(--space-4) var(--space-7);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  margin-bottom: -1px;
}
.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}
.tab:hover:not(.active) { color: var(--text-secondary); }

/* ── Settings Section Card ────────────────────────────────────────── */
.settings-section {
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  margin-top: var(--space-7);
  box-shadow: var(--shadow-card);
}

.settings-h2 {
  font-family: var(--font-heading);
  font-size: var(--text-h4);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: var(--ls-h4);
  margin: 0 0 var(--space-7);
}

/* ── Setting Rows ─────────────────────────────────────────────────── */
.setting-row { margin-bottom: var(--space-7); }

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.setting-value {
  color: var(--accent);
  font-weight: 600;
  font-size: var(--text-xs);
  background: var(--accent-bg);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.setting-chips {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.chip {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-default);
  background: var(--surface-secondary);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.chip.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.chip:hover:not(.active) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

.btn-save {
  margin-top: var(--space-4);
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
.btn-save:hover { background: var(--accent-hover); }
.btn-save:active { background: var(--accent-active); transform: scale(0.97); }

/* ── Library ──────────────────────────────────────────────────────── */
.library-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-7);
  padding: var(--space-4) var(--space-6);
  background: var(--surface-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.library-summary b { color: var(--text-primary); font-weight: 700; }

.btn-add-all-global {
  padding: var(--space-3) var(--space-6);
  background: var(--accent);
  color: #fff;
  border: 1px solid transparent;
  border-radius: var(--radius-xs);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.btn-add-all-global:hover { background: var(--accent-hover); }

.library-chapter { margin-bottom: var(--space-7); }

.library-chapter-title {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-subtle);
}

.library-lessons { display: flex; flex-direction: column; gap: var(--space-2); }

.library-lesson {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  background: var(--surface-secondary);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.library-lesson:hover { border-color: var(--border-subtle); background: var(--surface-hover); }

.library-lesson-info { flex: 1; display: flex; align-items: center; gap: var(--space-4); min-width: 0; }

.library-lesson-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.library-lesson-count {
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: var(--radius-pill);
  padding: 1px var(--space-3);
  white-space: nowrap;
}
.count-done {
  background: rgba(26, 174, 57, 0.10);
  color: var(--color-success-dark);
}
.count-partial {
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-tertiary);
}

.btn-lesson-add {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-default);
  background: var(--surface-primary);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}
.btn-lesson-add:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}
.btn-lesson-add:disabled { opacity: 0.45; cursor: default; }

.lesson-done-badge {
  color: var(--color-success-dark);
  font-size: var(--text-sm);
  font-weight: 600;
}
.lesson-no-vocab {
  color: var(--text-tertiary);
  font-size: var(--text-xs);
}

/* ── Debug ────────────────────────────────────────────────────────── */
.debug-loading {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  padding: var(--space-5) 0;
}

.debug-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-7);
}

.debug-stat {
  background: var(--surface-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  text-align: center;
}

.debug-stat-num {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: var(--ls-h4);
  line-height: 1.2;
}

.debug-stat-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-top: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.debug-actions {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.btn-export, .btn-refresh {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-default);
  background: var(--surface-secondary);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-export:hover, .btn-refresh:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

.debug-filter {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.debug-filter-label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.debug-select {
  flex: 1;
  min-width: 160px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-default);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: var(--text-xs);
  font-family: var(--font-ui);
  font-weight: 500;
  transition: border-color var(--transition-fast);
}
.debug-select:focus {
  outline: none;
  border-color: var(--accent);
}

.danger-sm {
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-xs);
  border: 1px solid rgba(192, 57, 43, 0.30);
  background: rgba(192, 57, 43, 0.06);
  color: var(--color-danger);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast);
}
.danger-sm:hover { background: rgba(192, 57, 43, 0.12); }

.debug-table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-card);
}

.debug-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-xs);
}

.debug-table th {
  background: var(--surface-secondary);
  padding: var(--space-4) var(--space-5);
  text-align: left;
  color: var(--text-tertiary);
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  border-bottom: 1px solid var(--border-subtle);
}

.debug-table td {
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: var(--text-xs);
}
.debug-table tr:last-child td { border-bottom: none; }
.debug-table tr.row-due { background: rgba(192, 57, 43, 0.04); }

.td-word { font-family: var(--font-jp); max-width: 180px; word-break: break-all; font-weight: 600; }
.td-lesson { color: var(--text-tertiary); max-width: 120px; }
.td-due { color: var(--color-danger); font-weight: 600; }
.td-correct { color: var(--color-success-dark); font-weight: 600; }
.td-wrong { color: var(--color-danger); font-weight: 600; }
.td-empty { text-align: center; color: var(--text-tertiary); padding: var(--space-8); }

/* ── Danger Zone ──────────────────────────────────────────────────── */
.danger-zone {
  border: 1px solid rgba(192, 57, 43, 0.25);
  background: rgba(192, 57, 43, 0.03);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  margin-top: var(--space-4);
}

.danger-title {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-danger);
  margin-bottom: var(--space-5);
}

.danger-btns { display: flex; gap: var(--space-4); flex-wrap: wrap; }

.btn-danger {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-xs);
  border: 1px solid rgba(192, 57, 43, 0.30);
  background: transparent;
  color: var(--color-danger);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.btn-danger:hover { background: rgba(192, 57, 43, 0.10); }
.btn-danger-all { font-weight: 700; border-color: var(--color-danger); }

/* ── Confirm Dialog ───────────────────────────────────────────────── */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.confirm-box {
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-9) var(--space-8);
  max-width: 340px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-deep);
}

.confirm-step-indicator {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.step-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.12);
  transition: background var(--transition-base);
}
.step-dot.active { background: var(--color-danger); }

.confirm-icon { font-size: 2rem; margin-bottom: var(--space-5); }

.confirm-msg {
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}
.confirm-msg b { color: var(--color-danger); font-weight: 700; }

.confirm-btns { display: flex; gap: var(--space-4); }

.btn-cancel {
  flex: 1;
  padding: var(--space-4);
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-default);
  background: var(--surface-secondary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-cancel:hover { border-color: var(--border-medium); color: var(--text-primary); }

.btn-confirm-danger {
  flex: 1;
  padding: var(--space-4);
  border-radius: var(--radius-xs);
  border: none;
  background: var(--color-danger);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.btn-confirm-danger:hover { background: #a32b20; }
</style>
