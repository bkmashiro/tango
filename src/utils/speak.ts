/**
 * Speak Japanese text using the Web Speech Synthesis API.
 * Falls back silently if not supported.
 */
export function speakJapanese(text: string) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ja-JP'
  utter.rate = 0.9
  speechSynthesis.speak(utter)
}
