/// <reference types="../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { loadData, chapters, getLessonsForChapter, meta, getLesson } from '../stores/data';
import { db } from '../stores/db';
const router = useRouter();
const dueCount = ref(0);
const lastLesson = ref(null);
const lastLessonTitle = ref('');
const lessonProgress = ref({});
// Global progress totals
const globalProgress = ref({ sectionsRead: 0, totalSections: 0, vocabAdded: 0, totalVocab: 0 });
onMounted(async () => {
    await loadData();
    dueCount.value = await db.vocabProgress
        .where('nextReview').belowOrEqual(Date.now()).count();
    // Last lesson
    const last = localStorage.getItem('lastLesson');
    if (last) {
        const l = getLesson(last);
        if (l) {
            lastLesson.value = last;
            lastLessonTitle.value = l.title;
        }
    }
    // Load all progress in two queries
    const [allSections, allVocab] = await Promise.all([
        db.sectionProgress.toArray(),
        db.vocabProgress.toArray(),
    ]);
    // Count by lessonId
    const secByLesson = {};
    for (const s of allSections) {
        if (s.status === 'read' || s.status === 'reviewing') {
            secByLesson[s.lessonId] = (secByLesson[s.lessonId] ?? 0) + 1;
        }
    }
    const vocabByLesson = {};
    for (const v of allVocab) {
        vocabByLesson[v.lessonId] = (vocabByLesson[v.lessonId] ?? 0) + 1;
    }
    // Build progress map for all lessons + global totals
    let gSecRead = 0, gSecTotal = 0, gVocabAdded = 0, gVocabTotal = 0;
    for (const ch of chapters.value) {
        for (const lid of ch.lessons) {
            const l = getLesson(lid);
            if (!l)
                continue;
            const p = {
                sectionsRead: secByLesson[lid] ?? 0,
                totalSections: l.sections.length,
                vocabAdded: vocabByLesson[lid] ?? 0,
                totalVocab: l.totalVocab,
            };
            lessonProgress.value[lid] = p;
            gSecRead += p.sectionsRead;
            gSecTotal += p.totalSections;
            gVocabAdded += p.vocabAdded;
            gVocabTotal += p.totalVocab;
        }
    }
    globalProgress.value = { sectionsRead: gSecRead, totalSections: gSecTotal, vocabAdded: gVocabAdded, totalVocab: gVocabTotal };
});
function progressPct(p) {
    const total = p.totalSections + Math.min(p.totalVocab, 10);
    if (total === 0)
        return 0;
    const done = p.sectionsRead + Math.min(p.vocabAdded, 10);
    return Math.round((done / total) * 100);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "home" },
});
/** @type {__VLS_StyleScopedClasses['home']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "home-header" },
});
/** @type {__VLS_StyleScopedClasses['home-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "app-title" },
});
/** @type {__VLS_StyleScopedClasses['app-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "app-sub" },
});
/** @type {__VLS_StyleScopedClasses['app-sub']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "app-desc" },
});
/** @type {__VLS_StyleScopedClasses['app-desc']} */ ;
if (__VLS_ctx.meta) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "meta-badges" },
    });
    /** @type {__VLS_StyleScopedClasses['meta-badges']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "badge" },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    (__VLS_ctx.meta.totalLessons);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "badge" },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    (__VLS_ctx.meta.totalVocab);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "badge" },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    (__VLS_ctx.meta.totalExamples);
}
if (__VLS_ctx.globalProgress.totalSections > 0 && (__VLS_ctx.globalProgress.sectionsRead > 0 || __VLS_ctx.globalProgress.vocabAdded > 0)) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "global-progress" },
    });
    /** @type {__VLS_StyleScopedClasses['global-progress']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "global-progress-header" },
    });
    /** @type {__VLS_StyleScopedClasses['global-progress-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "global-progress-label" },
    });
    /** @type {__VLS_StyleScopedClasses['global-progress-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "global-progress-pct" },
    });
    /** @type {__VLS_StyleScopedClasses['global-progress-pct']} */ ;
    (Math.round((__VLS_ctx.globalProgress.sectionsRead / __VLS_ctx.globalProgress.totalSections) * 100));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "global-progress-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['global-progress-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "global-progress-fill" },
        ...{ style: ({ width: Math.round((__VLS_ctx.globalProgress.sectionsRead / __VLS_ctx.globalProgress.totalSections) * 100) + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['global-progress-fill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "global-progress-stats" },
    });
    /** @type {__VLS_StyleScopedClasses['global-progress-stats']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.globalProgress.sectionsRead);
    (__VLS_ctx.globalProgress.totalSections);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.globalProgress.vocabAdded);
    (__VLS_ctx.globalProgress.totalVocab);
}
if (__VLS_ctx.lastLesson) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.lastLesson))
                    return;
                __VLS_ctx.router.push(`/lesson/${__VLS_ctx.lastLesson}`);
                // @ts-ignore
                [meta, meta, meta, meta, globalProgress, globalProgress, globalProgress, globalProgress, globalProgress, globalProgress, globalProgress, globalProgress, globalProgress, globalProgress, globalProgress, lastLesson, lastLesson, router,];
            } },
        ...{ class: "continue-banner" },
    });
    /** @type {__VLS_StyleScopedClasses['continue-banner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "continue-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['continue-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "continue-text" },
    });
    /** @type {__VLS_StyleScopedClasses['continue-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "continue-label" },
    });
    /** @type {__VLS_StyleScopedClasses['continue-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "continue-title" },
    });
    /** @type {__VLS_StyleScopedClasses['continue-title']} */ ;
    (__VLS_ctx.lastLessonTitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "continue-arrow" },
    });
    /** @type {__VLS_StyleScopedClasses['continue-arrow']} */ ;
}
if (__VLS_ctx.dueCount > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.dueCount > 0))
                    return;
                __VLS_ctx.router.push('/review');
                // @ts-ignore
                [router, lastLessonTitle, dueCount,];
            } },
        ...{ class: "review-banner" },
    });
    /** @type {__VLS_StyleScopedClasses['review-banner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "review-fire" },
    });
    /** @type {__VLS_StyleScopedClasses['review-fire']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.dueCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "review-arrow" },
    });
    /** @type {__VLS_StyleScopedClasses['review-arrow']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "chapters" },
});
/** @type {__VLS_StyleScopedClasses['chapters']} */ ;
for (const [chapter] of __VLS_vFor((__VLS_ctx.chapters))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        key: (chapter.id),
        ...{ class: "chapter-section" },
    });
    /** @type {__VLS_StyleScopedClasses['chapter-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "chapter-title" },
    });
    /** @type {__VLS_StyleScopedClasses['chapter-title']} */ ;
    (chapter.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "lesson-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['lesson-grid']} */ ;
    for (const [lesson] of __VLS_vFor((__VLS_ctx.getLessonsForChapter(chapter.id)))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.router.push(`/lesson/${lesson.id}`);
                    // @ts-ignore
                    [router, dueCount, chapters, getLessonsForChapter,];
                } },
            key: (lesson.id),
            ...{ class: "lesson-card" },
        });
        /** @type {__VLS_StyleScopedClasses['lesson-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "lesson-card-title" },
        });
        /** @type {__VLS_StyleScopedClasses['lesson-card-title']} */ ;
        (lesson.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "lesson-card-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['lesson-card-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (lesson.totalVocab);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (lesson.totalExamples);
        if (__VLS_ctx.lessonProgress[lesson.id] && (__VLS_ctx.lessonProgress[lesson.id].sectionsRead > 0 || __VLS_ctx.lessonProgress[lesson.id].vocabAdded > 0)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "lesson-progress-bar" },
            });
            /** @type {__VLS_StyleScopedClasses['lesson-progress-bar']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
                ...{ class: "lesson-progress-fill" },
                ...{ style: ({ width: __VLS_ctx.progressPct(__VLS_ctx.lessonProgress[lesson.id]) + '%' }) },
            });
            /** @type {__VLS_StyleScopedClasses['lesson-progress-fill']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "lesson-progress-text" },
            });
            /** @type {__VLS_StyleScopedClasses['lesson-progress-text']} */ ;
            if (__VLS_ctx.lessonProgress[lesson.id].sectionsRead > 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.lessonProgress[lesson.id].sectionsRead);
                (__VLS_ctx.lessonProgress[lesson.id].totalSections);
            }
            if (__VLS_ctx.lessonProgress[lesson.id].vocabAdded > 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.lessonProgress[lesson.id].vocabAdded);
            }
        }
        // @ts-ignore
        [lessonProgress, lessonProgress, lessonProgress, lessonProgress, lessonProgress, lessonProgress, lessonProgress, lessonProgress, lessonProgress, progressPct,];
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
    ...{ class: "credits" },
});
/** @type {__VLS_StyleScopedClasses['credits']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "http://www.guidetojapanese.org/learn/grammar",
    target: "_blank",
    rel: "noopener",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://github.com/pizzamx/jpgramma",
    target: "_blank",
    rel: "noopener",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "credits-repo" },
});
/** @type {__VLS_StyleScopedClasses['credits-repo']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "https://github.com/bkmashiro/tango",
    target: "_blank",
    rel: "noopener",
});
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
