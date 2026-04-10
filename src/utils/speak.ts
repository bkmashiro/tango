import { getSetting } from './settings'

/**
 * Speak Japanese text using the Web Speech Synthesis API.
 * Rate and pitch are read from user settings.
 */
export function speakJapanese(text: string) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang  = 'ja-JP'
  utter.rate  = getSetting('ttsRate')
  utter.pitch = getSetting('ttsPitch')
  speechSynthesis.speak(utter)
}
