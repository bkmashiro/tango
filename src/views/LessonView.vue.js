/// <reference types="../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadData, getLesson, lessons } from '../stores/data';
import { markSectionRead, unmarkSectionRead, getLessonProgress, db, vocabId } from '../stores/db';
import LessonBlock from '../components/blocks/LessonBlock.vue';
import BlockExercises from '../components/blocks/BlockExercises.vue';
const route = useRoute();
const router = useRouter();
const lessonId = computed(() => route.params.id);
const lesson = computed(() => getLesson(lessonId.value));
const sectionStatuses = ref({});
const addedWords = ref(new Set());
// Prev / Next lesson
const allLessons = computed(() => lessons.value);
const currentIdx = computed(() => allLessons.value.findIndex(l => l.id === lessonId.value));
const prevLesson = computed(() => currentIdx.value > 0 ? allLessons.value[currentIdx.value - 1] : null);
const nextLesson = computed(() => currentIdx.value >= 0 && currentIdx.value < allLessons.value.length - 1
    ? allLessons.value[currentIdx.value + 1] : null);
async function loadProgress() {
    sectionStatuses.value = {};
    const progress = await getLessonProgress(lessonId.value);
    for (const p of progress) {
        sectionStatuses.value[p.sectionIndex] = p.status;
    }
    const vocab = await db.vocabProgress
        .where('lessonId').equals(lessonId.value).toArray();
    const next = new Set();
    for (const v of vocab)
        next.add(v.word);
    addedWords.value = next;
}
onMounted(async () => {
    await loadData();
    await loadProgress();
    // Save last visited lesson
    localStorage.setItem('lastLesson', lessonId.value);
});
// Reload progress when lesson changes (router navigation)
watch(lessonId, async () => {
    await loadData();
    await loadProgress();
    localStorage.setItem('lastLesson', lessonId.value);
    window.scrollTo(0, 0);
});
async function toggleSectionRead(idx) {
    const isRead = sectionStatuses.value[idx] === 'read' || sectionStatuses.value[idx] === 'reviewing';
    if (isRead) {
        await unmarkSectionRead(lessonId.value, idx);
        const next = { ...sectionStatuses.value };
        delete next[idx];
        sectionStatuses.value = next;
    }
    else {
        await markSectionRead(lessonId.value, idx);
        sectionStatuses.value[idx] = 'read';
    }
}
async function addToSRS(item) {
    if (addedWords.value.has(item.word))
        return;
    const id = vocabId(lessonId.value, item.word);
    await db.vocabProgress.put({
        id,
        lessonId: lessonId.value,
        word: item.word,
        correct: 0, incorrect: 0,
        interval: 1,
        nextReview: Date.now(),
    });
    const next = new Set(addedWords.value);
    next.add(item.word);
    addedWords.value = next;
}
function scrollToSection(i) {
    const el = document.getElementById(`section-${i}`);
    if (el)
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.lesson) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "lesson-view" },
    });
    /** @type {__VLS_StyleScopedClasses['lesson-view']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "lesson-nav" },
    });
    /** @type {__VLS_StyleScopedClasses['lesson-nav']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.lesson))
                    return;
                __VLS_ctx.router.push('/');
                // @ts-ignore
                [lesson, router,];
            } },
        ...{ class: "btn-back" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-back']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "lesson-title" },
    });
    /** @type {__VLS_StyleScopedClasses['lesson-title']} */ ;
    (__VLS_ctx.lesson.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        ...{ class: "section-toc" },
    });
    /** @type {__VLS_StyleScopedClasses['section-toc']} */ ;
    for (const [sec, i] of __VLS_vFor((__VLS_ctx.lesson.sections))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.lesson))
                        return;
                    __VLS_ctx.scrollToSection(i);
                    // @ts-ignore
                    [lesson, lesson, scrollToSection,];
                } },
            key: (i),
            href: "#",
            ...{ class: "toc-item" },
            ...{ class: (__VLS_ctx.sectionStatuses[i]) },
        });
        /** @type {__VLS_StyleScopedClasses['toc-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "toc-dot" },
        });
        /** @type {__VLS_StyleScopedClasses['toc-dot']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "toc-label" },
        });
        /** @type {__VLS_StyleScopedClasses['toc-label']} */ ;
        (sec.title ?? '概述');
        // @ts-ignore
        [sectionStatuses,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "lesson-content" },
    });
    /** @type {__VLS_StyleScopedClasses['lesson-content']} */ ;
    for (const [sec, i] of __VLS_vFor((__VLS_ctx.lesson.sections))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            id: (`section-${i}`),
            key: (i),
            ...{ class: "lesson-section" },
            ...{ class: (__VLS_ctx.sectionStatuses[i] ?? 'unread') },
        });
        /** @type {__VLS_StyleScopedClasses['lesson-section']} */ ;
        if (sec.title) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
                ...{ class: "section-title" },
            });
            /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
            (sec.title);
        }
        for (const [block, bi] of __VLS_vFor((sec.blocks))) {
            const __VLS_0 = LessonBlock;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                ...{ 'onAddToSRS': {} },
                key: (bi),
                block: (block),
                addedWords: (__VLS_ctx.addedWords),
            }));
            const __VLS_2 = __VLS_1({
                ...{ 'onAddToSRS': {} },
                key: (bi),
                block: (block),
                addedWords: (__VLS_ctx.addedWords),
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            let __VLS_5;
            const __VLS_6 = ({ addToSRS: {} },
                { onAddToSRS: (__VLS_ctx.addToSRS) });
            var __VLS_3;
            var __VLS_4;
            // @ts-ignore
            [lesson, sectionStatuses, addedWords, addToSRS,];
        }
        if (sec.title) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "section-footer" },
            });
            /** @type {__VLS_StyleScopedClasses['section-footer']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.lesson))
                            return;
                        if (!(sec.title))
                            return;
                        __VLS_ctx.toggleSectionRead(i);
                        // @ts-ignore
                        [toggleSectionRead,];
                    } },
                ...{ class: "btn-read" },
                ...{ class: ({ 'btn-read--done': __VLS_ctx.sectionStatuses[i] === 'read' || __VLS_ctx.sectionStatuses[i] === 'reviewing' }) },
            });
            /** @type {__VLS_StyleScopedClasses['btn-read']} */ ;
            /** @type {__VLS_StyleScopedClasses['btn-read--done']} */ ;
            ((__VLS_ctx.sectionStatuses[i] === 'read' || __VLS_ctx.sectionStatuses[i] === 'reviewing') ? '✓ 已读' : '✓ 标记已读');
        }
        // @ts-ignore
        [sectionStatuses, sectionStatuses, sectionStatuses, sectionStatuses,];
    }
    if (__VLS_ctx.lesson.exercises?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "lesson-exercises" },
        });
        /** @type {__VLS_StyleScopedClasses['lesson-exercises']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "section-title" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
        const __VLS_7 = BlockExercises;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            key: (__VLS_ctx.lessonId),
            exercises: (__VLS_ctx.lesson.exercises),
        }));
        const __VLS_9 = __VLS_8({
            key: (__VLS_ctx.lessonId),
            exercises: (__VLS_ctx.lesson.exercises),
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "lesson-pagination" },
    });
    /** @type {__VLS_StyleScopedClasses['lesson-pagination']} */ ;
    if (__VLS_ctx.prevLesson) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.lesson))
                        return;
                    if (!(__VLS_ctx.prevLesson))
                        return;
                    __VLS_ctx.router.push(`/lesson/${__VLS_ctx.prevLesson.id}`);
                    // @ts-ignore
                    [lesson, lesson, router, lessonId, prevLesson, prevLesson,];
                } },
            ...{ class: "btn-page btn-prev" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-page']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-prev']} */ ;
        (__VLS_ctx.prevLesson.title);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "btn-page-placeholder" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-page-placeholder']} */ ;
    }
    if (__VLS_ctx.nextLesson) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.lesson))
                        return;
                    if (!(__VLS_ctx.nextLesson))
                        return;
                    __VLS_ctx.router.push(`/lesson/${__VLS_ctx.nextLesson.id}`);
                    // @ts-ignore
                    [router, prevLesson, nextLesson, nextLesson,];
                } },
            ...{ class: "btn-page btn-next" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-page']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-next']} */ ;
        (__VLS_ctx.nextLesson.title);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "btn-page-placeholder" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-page-placeholder']} */ ;
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading" },
    });
    /** @type {__VLS_StyleScopedClasses['loading']} */ ;
}
// @ts-ignore
[nextLesson,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
