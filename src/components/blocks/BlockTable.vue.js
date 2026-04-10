/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import InlineRenderer from './InlineRenderer.vue';
import { speakJapanese } from '../../utils/speak';
const __VLS_props = defineProps();
const JP_RE = /[\u3040-\u30ff\u4e00-\u9fff]/;
function cellText(inlines) {
    return inlines.map(t => {
        if (t.type === 'text')
            return t.content ?? '';
        if (t.type === 'ruby')
            return t.text ?? '';
        if (t.type === 'bold' || t.type === 'italic' || t.type === 'underline')
            return t.content ?? '';
        return '';
    }).join('');
}
function trySpeak(inlines) {
    const text = cellText(inlines);
    if (JP_RE.test(text))
        speakJapanese(text);
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "block-table-wrap" },
});
/** @type {__VLS_StyleScopedClasses['block-table-wrap']} */ ;
if (__VLS_ctx.block.caption) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "table-caption" },
    });
    /** @type {__VLS_StyleScopedClasses['table-caption']} */ ;
    (__VLS_ctx.block.caption);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
    ...{ class: "block-table" },
});
/** @type {__VLS_StyleScopedClasses['block-table']} */ ;
if (__VLS_ctx.block.headers.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    for (const [cell, i] of __VLS_vFor((__VLS_ctx.block.headers))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.block.headers.length))
                        return;
                    __VLS_ctx.trySpeak(cell);
                    // @ts-ignore
                    [block, block, block, block, trySpeak,];
                } },
            key: (i),
            ...{ class: ({ speakable: __VLS_ctx.JP_RE.test(__VLS_ctx.cellText(cell)) }) },
        });
        /** @type {__VLS_StyleScopedClasses['speakable']} */ ;
        const __VLS_0 = InlineRenderer;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            inlines: (cell),
        }));
        const __VLS_2 = __VLS_1({
            inlines: (cell),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        // @ts-ignore
        [JP_RE, cellText,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
for (const [row, ri] of __VLS_vFor((__VLS_ctx.block.rows))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
        key: (ri),
    });
    for (const [cell, ci] of __VLS_vFor((row))) {
        (ci);
        if (__VLS_ctx.block.headers.length && ci === 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.block.headers.length && ci === 0))
                            return;
                        __VLS_ctx.trySpeak(cell);
                        // @ts-ignore
                        [block, block, trySpeak,];
                    } },
                scope: "row",
                ...{ class: ({ speakable: __VLS_ctx.JP_RE.test(__VLS_ctx.cellText(cell)) }) },
            });
            /** @type {__VLS_StyleScopedClasses['speakable']} */ ;
            const __VLS_5 = InlineRenderer;
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
                inlines: (cell),
            }));
            const __VLS_7 = __VLS_6({
                inlines: (cell),
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.block.headers.length && ci === 0))
                            return;
                        __VLS_ctx.trySpeak(cell);
                        // @ts-ignore
                        [trySpeak, JP_RE, cellText,];
                    } },
                ...{ class: ({ speakable: __VLS_ctx.JP_RE.test(__VLS_ctx.cellText(cell)) }) },
            });
            /** @type {__VLS_StyleScopedClasses['speakable']} */ ;
            const __VLS_10 = InlineRenderer;
            // @ts-ignore
            const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
                inlines: (cell),
            }));
            const __VLS_12 = __VLS_11({
                inlines: (cell),
            }, ...__VLS_functionalComponentArgsRest(__VLS_11));
        }
        // @ts-ignore
        [JP_RE, cellText,];
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
