import Dexie from 'dexie';
class TangoDB extends Dexie {
    sectionProgress;
    vocabProgress;
    constructor() {
        super('tango');
        this.version(1).stores({
            sectionProgress: 'id, lessonId, status',
            vocabProgress: 'id, lessonId, nextReview',
        });
    }
}
export const db = new TangoDB();
// ── Section helpers ────────────────────────────────────────────────────
export function sectionId(lessonId, idx) {
    return `${lessonId}:${idx}`;
}
export async function getSectionProgress(lessonId, idx) {
    return db.sectionProgress.get(sectionId(lessonId, idx));
}
export async function markSectionRead(lessonId, idx) {
    const id = sectionId(lessonId, idx);
    const existing = await db.sectionProgress.get(id);
    if (existing?.status === 'read' || existing?.status === 'reviewing')
        return;
    await db.sectionProgress.put({
        id, lessonId, sectionIndex: idx,
        status: 'read', readAt: Date.now(),
    });
}
export async function unmarkSectionRead(lessonId, idx) {
    await db.sectionProgress.delete(sectionId(lessonId, idx));
}
export async function getLessonProgress(lessonId) {
    return db.sectionProgress.where('lessonId').equals(lessonId).toArray();
}
// ── Vocab helpers ──────────────────────────────────────────────────────
export function vocabId(lessonId, word) {
    return `${lessonId}:${word}`;
}
export async function getDueVocab(limit = 20) {
    const now = Date.now();
    return db.vocabProgress
        .where('nextReview').belowOrEqual(now)
        .limit(limit)
        .toArray();
}
export async function recordVocabResult(lessonId, word, correct) {
    const id = vocabId(lessonId, word);
    const existing = await db.vocabProgress.get(id);
    const prev = existing ?? {
        id, lessonId, word,
        correct: 0, incorrect: 0,
        interval: 1, nextReview: Date.now(),
    };
    // Simple SM-2-like scheduling
    const interval = correct
        ? Math.min(prev.interval * 2.5, 60)
        : 1;
    await db.vocabProgress.put({
        ...prev,
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
        interval,
        nextReview: Date.now() + interval * 86_400_000,
    });
}
