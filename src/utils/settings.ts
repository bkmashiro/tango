/** Persistent settings stored in localStorage */

export interface AppSettings {
  reviewLimit: number    // cards per review session
  ttsRate: number        // speech rate (0.5–2.0)
  ttsPitch: number       // speech pitch (0.5–2.0)
  autoReveal: boolean    // auto-show answer after card shown
}

const DEFAULTS: AppSettings = {
  reviewLimit: 30,
  ttsRate: 1.0,
  ttsPitch: 1.0,
  autoReveal: false,
}

const KEY = 'tango-settings'

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULTS }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  return loadSettings()[key]
}
