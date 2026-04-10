import { ref, computed } from 'vue'
import type { LessonsData, Lesson, Chapter } from '../types'

const data = ref<LessonsData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export async function loadData() {
  if (data.value) return
  loading.value = true
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'lessons.json')
    data.value = await res.json()
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

export const lessons   = computed(() => data.value?.lessons ?? [])
export const chapters  = computed(() => data.value?.chapters ?? [])
export const meta      = computed(() => data.value?.meta)
export const isLoading = computed(() => loading.value)
export const dataError = computed(() => error.value)

export function getLesson(id: string): Lesson | undefined {
  return lessons.value.find(l => l.id === id)
}

export function getChapter(id: string): Chapter | undefined {
  return chapters.value.find(c => c.id === id)
}

export function getLessonsForChapter(chapterId: string): Lesson[] {
  const chapter = getChapter(chapterId)
  if (!chapter) return []
  return chapter.lessons
    .map(id => getLesson(id))
    .filter(Boolean) as Lesson[]
}
