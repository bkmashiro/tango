/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { speakJapanese } from '../../utils/speak';
const props = defineProps();
const revealed = ref(new Set());
function toggle(key) {
    const next = new Set(revealed.value);
    if (next.has(key))
        next.delete(key);
    else
        next.add(key);
    revealed.value = next;
}
function revealAll() {
    const all = new Set();
    props.exercises.forEach((ex, ei) => {
        if (ex.type === 'conjugation') {
            ex.forms.forEach((_, fi) => all.add(`${ei}-${fi}`));
        }
        else {
            all.add(`${ei}`);
        }
    });
    revealed.value = all;
}
function reset() {
    revealed.value = new Set();
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.exercises.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "block-exercises" },
    });
    /** @type {__VLS_StyleScopedClasses['block-exercises']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "exercises-header" },
    });
    /** @type {__VLS_StyleScopedClasses['exercises-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "exercises-label" },
    });
    /** @type {__VLS_StyleScopedClasses['exercises-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "exercises-controls" },
    });
    /** @type {__VLS_StyleScopedClasses['exercises-controls']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.revealAll) },
        ...{ class: "ex-ctrl-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['ex-ctrl-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.reset) },
        ...{ class: "ex-ctrl-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['ex-ctrl-btn']} */ ;
    for (const [ex, ei] of __VLS_vFor((__VLS_ctx.exercises))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (ei),
            ...{ class: "exercise-item" },
        });
        /** @type {__VLS_StyleScopedClasses['exercise-item']} */ ;
        if (ex.type === 'conjugation') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.exercises.length))
                            return;
                        if (!(ex.type === 'conjugation'))
                            return;
                        __VLS_ctx.speakJapanese(ex.word);
                        // @ts-ignore
                        [exercises, exercises, revealAll, reset, speakJapanese,];
                    } },
                ...{ class: "conj-word" },
            });
            /** @type {__VLS_StyleScopedClasses['conj-word']} */ ;
            (ex.word);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "conj-grid" },
            });
            /** @type {__VLS_StyleScopedClasses['conj-grid']} */ ;
            for (const [form, fi] of __VLS_vFor((ex.forms))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (fi),
                    ...{ class: "conj-row" },
                });
                /** @type {__VLS_StyleScopedClasses['conj-row']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "conj-label" },
                });
                /** @type {__VLS_StyleScopedClasses['conj-label']} */ ;
                (form.label);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "conj-eq" },
                });
                /** @type {__VLS_StyleScopedClasses['conj-eq']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.exercises.length))
                                return;
                            if (!(ex.type === 'conjugation'))
                                return;
                            __VLS_ctx.toggle(`${ei}-${fi}`);
                            // @ts-ignore
                            [toggle,];
                        } },
                    ...{ class: "conj-answer" },
                    ...{ class: ({ hidden: !__VLS_ctx.revealed.has(`${ei}-${fi}`) }) },
                });
                /** @type {__VLS_StyleScopedClasses['conj-answer']} */ ;
                /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
                if (__VLS_ctx.revealed.has(`${ei}-${fi}`)) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.exercises.length))
                                    return;
                                if (!(ex.type === 'conjugation'))
                                    return;
                                if (!(__VLS_ctx.revealed.has(`${ei}-${fi}`)))
                                    return;
                                __VLS_ctx.speakJapanese(form.answer);
                                // @ts-ignore
                                [speakJapanese, revealed, revealed,];
                            } },
                        ...{ style: {} },
                    });
                    (form.answer);
                }
                else {
                }
                // @ts-ignore
                [];
            }
        }
        else if (ex.type === 'qa') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "qa-row" },
            });
            /** @type {__VLS_StyleScopedClasses['qa-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "qa-question" },
            });
            /** @type {__VLS_StyleScopedClasses['qa-question']} */ ;
            (ex.question);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "qa-eq" },
            });
            /** @type {__VLS_StyleScopedClasses['qa-eq']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.exercises.length))
                            return;
                        if (!!(ex.type === 'conjugation'))
                            return;
                        if (!(ex.type === 'qa'))
                            return;
                        __VLS_ctx.toggle(`${ei}`);
                        // @ts-ignore
                        [toggle,];
                    } },
                ...{ class: "qa-answer" },
                ...{ class: ({ hidden: !__VLS_ctx.revealed.has(`${ei}`) }) },
            });
            /** @type {__VLS_StyleScopedClasses['qa-answer']} */ ;
            /** @type {__VLS_StyleScopedClasses['hidden']} */ ;
            if (__VLS_ctx.revealed.has(`${ei}`)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.exercises.length))
                                return;
                            if (!!(ex.type === 'conjugation'))
                                return;
                            if (!(ex.type === 'qa'))
                                return;
                            if (!(__VLS_ctx.revealed.has(`${ei}`)))
                                return;
                            __VLS_ctx.speakJapanese(ex.answer);
                            // @ts-ignore
                            [speakJapanese, revealed, revealed,];
                        } },
                    ...{ style: {} },
                });
                (ex.answer);
            }
            else {
            }
        }
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
