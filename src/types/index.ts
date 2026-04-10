// ── Inline tokens ──────────────────────────────────────────────────────
export type InlineText      = { type: 'text';      content: string }
export type InlineRuby      = { type: 'ruby';      text: string; reading: string | null; meaning: string | null }
export type InlineBold      = { type: 'bold';      content: string }
export type InlineItalic    = { type: 'italic';    content: string }
export type InlineUnderline = { type: 'underline'; content: string }
export type InlineLink      = { type: 'link';      content: string; href: string }
export type InlineBr        = { type: 'br' }
export type InlineAudio     = { type: 'audio'; key: string; text: string }

export type Inline =
  | InlineText | InlineRuby | InlineBold
  | InlineItalic | InlineUnderline | InlineLink | InlineBr | InlineAudio

// ── Vocab ──────────────────────────────────────────────────────────────
export interface VocabItem {
  word: string
  reading: string | null
  reading_display: string | null
  type: string | null      // "る动词" | "う动词" | "例外" | null
  meaning: string
}

// ── Example sentence ───────────────────────────────────────────────────
export interface Example {
  jp: string
  zh: string
  inlines: Inline[]
}

// ── Block types ────────────────────────────────────────────────────────
export interface BlockVocabList  { type: 'vocab-list';   label: string | null; items: VocabItem[] }
export interface BlockParagraph  { type: 'paragraph';    inlines: Inline[] }
export interface BlockHeading    { type: 'heading';      level: number; inlines: Inline[] }
export interface BlockNote       { type: 'note';         inlines: Inline[] }
export interface BlockExamples   { type: 'example-list'; items: Example[] }
export interface BlockTable      { type: 'table';        caption: string | null; headers: Inline[][]; rows: Inline[][][] }
export interface BlockSumbox     { type: 'sumbox';       title: string; rules: { rule: string; examples: Example[] }[] }
export interface BlockVideo      { type: 'video';        url: string }

export type Block =
  | BlockVocabList | BlockParagraph | BlockHeading
  | BlockNote | BlockExamples | BlockTable | BlockSumbox | BlockVideo

// ── Exercise types ─────────────────────────────────────────────────────
export interface ExerciseConjugationForm {
  label: string
  answer: string
}

export interface ExerciseConjugation {
  type: 'conjugation'
  word: string
  forms: ExerciseConjugationForm[]
}

export interface ExerciseQA {
  type: 'qa'
  question: string
  answer: string
}

export type Exercise = ExerciseConjugation | ExerciseQA

// ── Section / Lesson / Chapter ─────────────────────────────────────────
export interface Section {
  title: string | null
  blocks: Block[]
  vocab: VocabItem[]
  examples: Example[]
}

export interface Lesson {
  id: string
  title: string
  chapter: string
  totalVocab: number
  totalExamples: number
  sections: Section[]
  exercises?: Exercise[]
}

export interface Chapter {
  id: string
  title: string
  lessons: string[]
}

export interface LessonsData {
  meta: { totalLessons: number; totalVocab: number; totalExamples: number }
  chapters: Chapter[]
  lessons: Lesson[]
}

// ── Progress (IndexedDB) ───────────────────────────────────────────────
export type SectionStatus = 'unread' | 'read' | 'reviewing'

export interface SectionProgress {
  id: string          // `${lessonId}:${sectionIndex}`
  lessonId: string
  sectionIndex: number
  status: SectionStatus
  readAt: number | null
}

export interface VocabProgress {
  id: string          // `${lessonId}:${word}`
  lessonId: string
  word: string
  correct: number
  incorrect: number
  nextReview: number  // timestamp
  interval: number    // days
}
