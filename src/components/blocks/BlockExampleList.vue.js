/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import InlineRenderer from './InlineRenderer.vue';
import { speakJapanese } from '../../utils/speak';
const props = defineProps();
// Require kana (not just CJK) so pure Chinese text like "片假名练习" is excluded
const hasKana = (s) => /[\u3040-\u30ff]/.test(s);
const hasZh = (s) => !!(s && s.trim().length > 0);
// Reconstruct full sentence text from inlines for TTS (includes particles/endings)
function inlinesToText(inlines) {
    return inlines.map(t => {
        if (t.type === 'text')
            return t.content;
        if (t.type === 'ruby')
            return t.text;
        if (t.type === 'italic' || t.type === 'bold' || t.type === 'underline')
            return t.content;
        return '';
    }).join('').trim();
}
// Strip parenthetical kana readings like （いちじ・にじゅうよんぷん） from TTS text.
// These are pronunciation hints for human readers; TTS already infers them from kanji.
const PAREN_KANA_RE = /[（(][ぁ-んァ-ヶーｦ-ﾟ・\s]+[）)]/g;
function getReadText(ex) {
    if (ex.inlines.length) {
        const full = inlinesToText(ex.inlines);
        if (full)
            return full.replace(PAREN_KANA_RE, '').trim();
    }
    return ex.jp.replace(PAREN_KANA_RE, '').trim();
}
const items = computed(() => props.block.items.filter(ex => hasKana(ex.jp) || hasKana(inlinesToText(ex.inlines))));
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.items.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.ol, __VLS_intrinsics.ol)({
        ...{ class: "block-examples" },
    });
    /** @type {__VLS_StyleScopedClasses['block-examples']} */ ;
    for (const [ex, i] of __VLS_vFor((__VLS_ctx.items))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (i),
            ...{ class: "example-item" },
        });
        /** @type {__VLS_StyleScopedClasses['example-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.items.length))
                        return;
                    __VLS_ctx.speakJapanese(__VLS_ctx.getReadText(ex));
                    // @ts-ignore
                    [items, items, speakJapanese, getReadText,];
                } },
            ...{ class: "example-jp example-jp--speak" },
            title: "点击朗读",
        });
        /** @type {__VLS_StyleScopedClasses['example-jp']} */ ;
        /** @type {__VLS_StyleScopedClasses['example-jp--speak']} */ ;
        if (ex.inlines.length) {
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
        [hasZh,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
