/// <reference types="../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { loadData, getLesson, lessons } from '../stores/data';
import { getDueVocab, recordVocabResult } from '../stores/db';
const router = useRouter();
const queue = ref([]);
const current = ref(0);
const phase = ref('question');
const done = ref(false);
const correct = ref(0);
const card = computed(() => queue.value[current.value]);
/** Normalize a stored word that may have been saved before parsing improvements.
 *  Handles old formats like "ざ っ し (za-s-shi) - 杂志" → "ざっし" */
function normalizeWord(w) {
    let s = w.replace(/\s*[(\uff08][a-zA-Z][a-zA-Z\s\-.]*[)\uff09]\s*/g, ' ').trim();
    s = s.replace(/([\u3040-\u30ff\u4e00-\u9fff])\s+(?=[\u3040-\u30ff\u4e00-\u9fff])/g, '$1');
    // Strip meaning part if full entry was accidentally stored: "word - meaning"
    s = s.replace(/\s+[-－]\s+.+$/, '');
    // Strip reading brackets if stored with them: "word【reading】"
    s = s.replace(/\s*【[^】]+】.*$/, '');
    return s.trim();
}
const vocabData = computed(() => {
    if (!card.value)
        return null;
    const raw = card.value.word;
    const cleaned = normalizeWord(raw);
    // First try the stored lesson
    const lesson = getLesson(card.value.lessonId);
    if (lesson) {
        for (const sec of lesson.sections) {
            const found = sec.vocab.find(v => v.word === raw || v.word === cleaned || v.reading === cleaned);
            if (found)
                return found;
        }
    }
    // Fallback: search ALL lessons (handles lessonId mismatch or word in wrong lesson)
    for (const l of lessons.value) {
        for (const sec of l.sections) {
            const found = sec.vocab.find(v => v.word === raw || v.word === cleaned || v.reading === cleaned);
            if (found)
                return found;
        }
    }
    return null;
});
onMounted(async () => {
    await loadData();
    queue.value = await getDueVocab(30);
    done.value = queue.value.length === 0;
});
function showAnswer() {
    phase.value = 'answer';
}
async function respond(isCorrect) {
    if (isCorrect)
        correct.value++;
    await recordVocabResult(card.value.lessonId, card.value.word, isCorrect);
    current.value++;
    phase.value = 'question';
    if (current.value >= queue.value.length)
        done.value = true;
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "review-view" },
});
/** @type {__VLS_StyleScopedClasses['review-view']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "review-nav" },
});
/** @type {__VLS_StyleScopedClasses['review-nav']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.push('/');
            // @ts-ignore
            [router,];
        } },
    ...{ class: "btn-back" },
});
/** @type {__VLS_StyleScopedClasses['btn-back']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "review-progress" },
});
/** @type {__VLS_StyleScopedClasses['review-progress']} */ ;
(__VLS_ctx.current);
(__VLS_ctx.queue.length);
if (__VLS_ctx.done) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "review-done" },
    });
    /** @type {__VLS_StyleScopedClasses['review-done']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "done-emoji" },
    });
    /** @type {__VLS_StyleScopedClasses['done-emoji']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.queue.length ? Math.round(__VLS_ctx.correct / __VLS_ctx.queue.length * 100) : 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.done))
                    return;
                __VLS_ctx.router.push('/');
                // @ts-ignore
                [router, current, queue, queue, queue, done, correct,];
            } },
        ...{ class: "btn-primary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
}
else if (__VLS_ctx.card) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['card-wrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "progress-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "progress-fill" },
        ...{ style: ({ width: `${(__VLS_ctx.current / __VLS_ctx.queue.length) * 100}%` }) },
    });
    /** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flash-card" },
    });
    /** @type {__VLS_StyleScopedClasses['flash-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-word" },
    });
    /** @type {__VLS_StyleScopedClasses['card-word']} */ ;
    (__VLS_ctx.vocabData?.word ?? __VLS_ctx.normalizeWord(__VLS_ctx.card.word));
    if (__VLS_ctx.vocabData?.reading_display) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-reading" },
        });
        /** @type {__VLS_StyleScopedClasses['card-reading']} */ ;
        (__VLS_ctx.vocabData.reading_display);
    }
    if (__VLS_ctx.phase === 'question') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-question" },
        });
        /** @type {__VLS_StyleScopedClasses['card-question']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-mask" },
        });
        /** @type {__VLS_StyleScopedClasses['card-mask']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.showAnswer) },
            ...{ class: "btn-reveal" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-reveal']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-answer" },
        });
        /** @type {__VLS_StyleScopedClasses['card-answer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-meaning" },
        });
        /** @type {__VLS_StyleScopedClasses['card-meaning']} */ ;
        (__VLS_ctx.vocabData?.meaning ?? '—');
        if (__VLS_ctx.vocabData?.type) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "card-type" },
            });
            /** @type {__VLS_StyleScopedClasses['card-type']} */ ;
            (__VLS_ctx.vocabData.type);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-btns" },
        });
        /** @type {__VLS_StyleScopedClasses['card-btns']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.done))
                        return;
                    if (!(__VLS_ctx.card))
                        return;
                    if (!!(__VLS_ctx.phase === 'question'))
                        return;
                    __VLS_ctx.respond(false);
                    // @ts-ignore
                    [current, queue, card, card, vocabData, vocabData, vocabData, vocabData, vocabData, vocabData, normalizeWord, phase, showAnswer, respond,];
                } },
            ...{ class: "btn-wrong" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-wrong']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.done))
                        return;
                    if (!(__VLS_ctx.card))
                        return;
                    if (!!(__VLS_ctx.phase === 'question'))
                        return;
                    __VLS_ctx.respond(true);
                    // @ts-ignore
                    [respond,];
                } },
            ...{ class: "btn-correct" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-correct']} */ ;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
