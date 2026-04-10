<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loadSettings, saveSettings } from '../utils/settings'
import { db } from '../stores/db'
import { loadData, getLesson } from '../stores/data'
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

async function doClear() {
  if (!confirmClear.value) return
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
  await loadDebug()
}

async function clearLesson(lessonId: string) {
  await db.vocabProgress.where('lessonId').equals(lessonId).delete()
  await db.sectionProgress.where('lessonId').equals(lessonId).delete()
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
</script>

<template>
  <div class="settings-view">
    <nav class="review-nav">
      <button class="btn-back" @click="router.push('/')">← 返回</button>
      <span class="review-progress">设置 &amp; 调试</span>
    </nav>

    <!-- ── Settings ────────────────────────────────────────────────── -->
    <section class="settings-section">
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

    <!-- ── Debug ───────────────────────────────────────────────────── -->
    <section class="settings-section">
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
            @click="clearLesson(filterLesson)">清除该课程数据</button>
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
            <button class="btn-danger" @click="confirmClear = 'vocab'">清除复习进度</button>
            <button class="btn-danger" @click="confirmClear = 'sections'">清除阅读进度</button>
            <button class="btn-danger btn-danger-all" @click="confirmClear = 'all'">清除全部数据</button>
          </div>
        </div>

      </template>
    </section>

    <!-- Confirm dialog -->
    <div v-if="confirmClear" class="confirm-overlay" @click.self="confirmClear = null">
      <div class="confirm-box">
        <div class="confirm-icon">⚠️</div>
        <div class="confirm-msg">
          <template v-if="confirmClear === 'all'">确认清除<b>全部学习数据</b>？此操作不可撤销。</template>
          <template v-else-if="confirmClear === 'vocab'">确认清除所有<b>复习进度</b>？</template>
          <template v-else>确认清除所有<b>阅读进度</b>？</template>
        </div>
        <div class="confirm-btns">
          <button class="btn-cancel" @click="confirmClear = null">取消</button>
          <button class="btn-confirm-danger" @click="doClear">确认清除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 16px 60px;
}

.settings-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  margin-top: 24px;
}

.settings-h2 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: var(--text1);
}

/* Setting rows */
.setting-row {
  margin-bottom: 20px;
}
.setting-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text2);
  margin-bottom: 10px;
}
.setting-value {
  color: var(--accent);
  font-weight: 600;
}
.setting-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text2);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all .15s;
}
.chip.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.chip:hover:not(.active) {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-save {
  margin-top: 8px;
  padding: 10px 28px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s;
}
.btn-save:hover { opacity: .85; }

/* Debug */
.debug-loading { color: var(--text2); padding: 12px 0; }

.debug-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.debug-stat {
  background: var(--bg);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.debug-stat-num {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--accent);
}
.debug-stat-label {
  font-size: 0.75rem;
  color: var(--text2);
  margin-top: 4px;
}

.debug-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.btn-export, .btn-refresh {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text1);
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color .15s;
}
.btn-export:hover, .btn-refresh:hover { border-color: var(--accent); color: var(--accent); }

.debug-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.debug-filter-label { font-size: 0.85rem; color: var(--text2); white-space: nowrap; }
.debug-select {
  flex: 1;
  min-width: 160px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text1);
  font-size: 0.85rem;
}
.danger-sm {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #7f1d1d;
  background: transparent;
  color: var(--red);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
}
.danger-sm:hover { background: #3b1515; }

.debug-table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border);
  margin-bottom: 24px;
}
.debug-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}
.debug-table th {
  background: var(--bg);
  padding: 8px 10px;
  text-align: left;
  color: var(--text2);
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 1px solid var(--border);
}
.debug-table td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--border);
  color: var(--text1);
}
.debug-table tr:last-child td { border-bottom: none; }
.debug-table tr.row-due { background: rgba(239, 68, 68, 0.05); }

.td-word { font-family: var(--font-jp); max-width: 180px; word-break: break-all; }
.td-lesson { color: var(--text2); max-width: 120px; font-size: 0.78rem; }
.td-due { color: var(--red); font-weight: 600; }
.td-correct { color: var(--green); }
.td-wrong { color: var(--red); }
.td-empty { text-align: center; color: var(--text2); padding: 24px; }

/* Danger zone */
.danger-zone {
  border: 1px solid #7f1d1d;
  border-radius: 10px;
  padding: 16px;
  margin-top: 8px;
}
.danger-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--red);
  margin-bottom: 12px;
}
.danger-btns { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-danger {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #7f1d1d;
  background: transparent;
  color: var(--red);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background .15s;
}
.btn-danger:hover { background: #3b1515; }
.btn-danger-all { border-color: var(--red); font-weight: 700; }

/* Confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.confirm-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px 28px;
  max-width: 320px;
  text-align: center;
}
.confirm-icon { font-size: 2rem; margin-bottom: 12px; }
.confirm-msg { font-size: 0.95rem; color: var(--text1); margin-bottom: 24px; line-height: 1.5; }
.confirm-msg b { color: var(--red); }
.confirm-btns { display: flex; gap: 12px; }
.btn-cancel {
  flex: 1; padding: 10px; border-radius: 8px;
  border: 1px solid var(--border); background: transparent;
  color: var(--text1); cursor: pointer;
}
.btn-confirm-danger {
  flex: 1; padding: 10px; border-radius: 8px;
  border: none; background: var(--red);
  color: #fff; font-weight: 700; cursor: pointer;
}
</style>
