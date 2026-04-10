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
    this.version(2).stores({
      sectionProgress: 'id, lessonId, status',
      vocabProgress:   'id, lessonId, nextReview, deck',
    }).upgrade(tx => {
      return tx.table('vocabProgress').toCollection().modify((record: VocabProgress) => {
        if (!record.deck) {
          record.deck = 'favorites'
        }
      })
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

export async function toggleSectionRead(lessonId: string, idx: number) {
  const id = sectionId(lessonId, idx)
  const existing = await db.sectionProgress.get(id)
  if (existing?.status === 'read' || existing?.status === 'reviewing') {
    await db.sectionProgress.delete(id)
  } else {
    await db.sectionProgress.put({
      id, lessonId, sectionIndex: idx,
      status: 'read', readAt: Date.now(),
    })
  }
}

export async function getLessonProgress(lessonId: string) {
  return db.sectionProgress.where('lessonId').equals(lessonId).toArray()
}

// ── Vocab helpers ──────────────────────────────────────────────────────
export function vocabId(lessonId: string, word: string) {
  return `${lessonId}:${word}`
}

/** Remove a vocab word from the review queue entirely. */
export async function removeVocab(lessonId: string, word: string) {
  await db.vocabProgress.delete(vocabId(lessonId, word))
}

/** Bulk-add vocab words for a lesson to the library deck, skipping ones already present. */
export async function bulkAddVocab(lessonId: string, words: string[]) {
  const now = Date.now()
  await db.transaction('rw', db.vocabProgress, async () => {
    for (const word of words.filter(w => !!w)) {
      const id = vocabId(lessonId, word)
      const existing = await db.vocabProgress.get(id)
      if (!existing) {
        await db.vocabProgress.put({
          id, lessonId, word,
          correct: 0, incorrect: 0,
          interval: 1, nextReview: now,
          deck: 'library',
        })
      }
    }
  })
}

export async function getDueVocab(limit = 20, deck?: 'library' | 'favorites' | 'all') {
  const now = Date.now()
  const effectiveDeck = deck ?? 'all'
  if (effectiveDeck === 'all') {
    return db.vocabProgress
      .where('nextReview').belowOrEqual(now)
      .limit(limit)
      .toArray()
  }
  return db.vocabProgress
    .where('nextReview').belowOrEqual(now)
    .filter(v => v.deck === effectiveDeck)
    .limit(limit)
    .toArray()
}

export async function getDueCountByDeck(): Promise<{ library: number; favorites: number; all: number }> {
  const now = Date.now()
  const due = await db.vocabProgress
    .where('nextReview').belowOrEqual(now)
    .toArray()
  let library = 0
  let favorites = 0
  for (const v of due) {
    if (v.deck === 'library') library++
    else favorites++ // 'favorites' or undefined (pre-migration)
  }
  return { library, favorites, all: library + favorites }
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
    deck: 'favorites' as const,
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
