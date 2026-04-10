/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import InlineRenderer from './InlineRenderer.vue';
const __VLS_props = defineProps();
const isJapanese = (s) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(s);
const hasZh = (s) => !!(s && s.trim().length > 0);
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
    ...{ class: "block-sumbox" },
});
/** @type {__VLS_StyleScopedClasses['block-sumbox']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sumbox-title" },
});
/** @type {__VLS_StyleScopedClasses['sumbox-title']} */ ;
(__VLS_ctx.block.title);
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
    ...{ class: "sumbox-rules" },
});
/** @type {__VLS_StyleScopedClasses['sumbox-rules']} */ ;
for (const [rule, ri] of __VLS_vFor((__VLS_ctx.block.rules))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
        key: (ri),
        ...{ class: "sumbox-rule" },
    });
    /** @type {__VLS_StyleScopedClasses['sumbox-rule']} */ ;
    if (rule.rule) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "rule-text" },
        });
        /** @type {__VLS_StyleScopedClasses['rule-text']} */ ;
        (rule.rule);
    }
    if (rule.examples.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.ol, __VLS_intrinsics.ol)({
            ...{ class: "rule-examples" },
        });
        /** @type {__VLS_StyleScopedClasses['rule-examples']} */ ;
        for (const [ex, ei] of __VLS_vFor((rule.examples.filter(e => __VLS_ctx.isJapanese(e.jp))))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (ei),
                ...{ class: "example-item" },
            });
            /** @type {__VLS_StyleScopedClasses['example-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "example-jp" },
            });
            /** @type {__VLS_StyleScopedClasses['example-jp']} */ ;
            if (ex.inlines?.length) {
                const __VLS_0 = InlineRenderer;
                // @ts-ignore
                const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                    inlines: (ex.inlines),
                }));
                const __VLS_2 = __VLS_1({
                    inlines: (ex.inlines),
                }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            }
            else {
                (ex.jp);
            }
            if (__VLS_ctx.hasZh(ex.zh)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "example-zh" },
                });
                /** @type {__VLS_StyleScopedClasses['example-zh']} */ ;
                (ex.zh);
            }
            // @ts-ignore
            [block, block, isJapanese, hasZh,];
        }
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
