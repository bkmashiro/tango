<script setup lang="ts">
import { ref } from 'vue'
import { speakJapanese } from '../../utils/speak'

interface ConjugationExercise {
  type: 'conjugation'
  word: string
  forms: { label: string; answer: string }[]
}
interface QAExercise {
  type: 'qa'
  question: string
  answer: string
}
type Exercise = ConjugationExercise | QAExercise

const props = defineProps<{ exercises: Exercise[] }>()
const revealed = ref<Set<string>>(new Set())

function toggle(key: string) {
  const next = new Set(revealed.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  revealed.value = next
}

function revealAll() {
  const all = new Set<string>()
  props.exercises.forEach((ex, ei) => {
    if (ex.type === 'conjugation') {
      ex.forms.forEach((_, fi) => all.add(`${ei}-${fi}`))
    } else {
      all.add(`${ei}`)
    }
  })
  revealed.value = all
}

function reset() {
  revealed.value = new Set()
}
</script>

<template>
  <div v-if="exercises.length" class="block-exercises">
    <div class="exercises-header">
      <span class="exercises-label">📝 练习</span>
      <div class="exercises-controls">
        <button class="ex-ctrl-btn" @click="revealAll">全部显示</button>
        <button class="ex-ctrl-btn" @click="reset">重置</button>
      </div>
    </div>

    <div v-for="(ex, ei) in exercises" :key="ei" class="exercise-item">
      <!-- Conjugation exercise -->
      <template v-if="ex.type === 'conjugation'">
        <div class="conj-word" @click="speakJapanese(ex.word)">{{ ex.word }}</div>
        <div class="conj-grid">
          <div v-for="(form, fi) in ex.forms" :key="fi" class="conj-row">
            <span class="conj-label">{{ form.label }}</span>
            <span class="conj-eq">＝</span>
            <span
              class="conj-answer"
              :class="{ hidden: !revealed.has(`${ei}-${fi}`) }"
              @click="toggle(`${ei}-${fi}`)"
            >
              <template v-if="revealed.has(`${ei}-${fi}`)">
                <span @click.stop="speakJapanese(form.answer)" style="cursor:pointer">{{ form.answer }}</span>
              </template>
              <template v-else>点击查看</template>
            </span>
          </div>
        </div>
      </template>

      <!-- QA exercise -->
      <template v-else-if="ex.type === 'qa'">
        <div class="qa-row">
          <span class="qa-question">{{ ex.question }}</span>
          <span class="qa-eq">＝</span>
          <span
            class="qa-answer"
            :class="{ hidden: !revealed.has(`${ei}`) }"
            @click="toggle(`${ei}`)"
          >
            <template v-if="revealed.has(`${ei}`)">
              <span @click.stop="speakJapanese(ex.answer)" style="cursor:pointer">{{ ex.answer }}</span>
            </template>
            <template v-else>点击查看</template>
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
