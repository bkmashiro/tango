import Dexie, { type Table } from 'dexie'
import type { SectionProgress, VocabProgress } from '../types'

class TangoDB extends Dexie {
  sectionProgress!: Table<SectionProgress>
  vocabProgress!: Table<VocabProgress>

  constructor() {
    super('tango')
    this.version(1).stores({
      sectionProgress: 'id, lessonId, status',
      vocabProgress:   'id, lessonId, nextReview',
    })
  }
}

export const db = new TangoDB()

// ── Section helpers ────────────────────────────────────────────────────
export function sectionId(lessonId: string, idx: number) {
  return `${lessonId}:${idx}`
}

export async function getSectionProgress(lessonId: string, idx: number) {
  return db.sectionProgress.get(sectionId(lessonId, idx))
}

export async function markSectionRead(lessonId: string, idx: number) {
  const id = sectionId(lessonId, idx)
  const existing = await db.sectionProgress.get(id)
  if (existing?.status === 'read' || existing?.status === 'reviewing') return
  await db.sectionProgress.put({
    id, lessonId, sectionIndex: idx,
    status: 'read', readAt: Date.now(),
  })
}

export async function getLessonProgress(lessonId: string) {
  return db.sectionProgress.where('lessonId').equals(lessonId).toArray()
}

// ── Vocab helpers ──────────────────────────────────────────────────────
export function vocabId(lessonId: string, word: string) {
  return `${lessonId}:${word}`
}

export async function getDueVocab(limit = 20) {
  const now = Date.now()
  return db.vocabProgress
    .where('nextReview').belowOrEqual(now)
    .limit(limit)
    .toArray()
}

export async function recordVocabResult(
  lessonId: string, word: string, correct: boolean
) {
  const id = vocabId(lessonId, word)
  const existing = await db.vocabProgress.get(id)

  const prev = existing ?? {
    id, lessonId, word,
    correct: 0, incorrect: 0,
    interval: 1, nextReview: Date.now(),
  }

  // Simple SM-2-like scheduling
  const interval = correct
    ? Math.min(prev.interval * 2.5, 60)
    : 1

  await db.vocabProgress.put({
    ...prev,
    correct:    prev.correct    + (correct ? 1 : 0),
    incorrect:  prev.incorrect  + (correct ? 0 : 1),
    interval,
    nextReview: Date.now() + interval * 86_400_000,
  })
}
