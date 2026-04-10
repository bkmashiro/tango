/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch } from 'vue';
import { speakJapanese } from '../../utils/speak';
const props = defineProps();
const emit = defineEmits();
const added = ref(new Set());
// Sync when parent finishes loading DB words
watch(() => props.addedWords, (val) => {
    if (val && val.size > 0)
        added.value = new Set(val);
}, { immediate: true });
function onAdd(item) {
    if (added.value.has(item.word))
        return;
    emit('addToSRS', item);
    const next = new Set(added.value);
    next.add(item.word);
    added.value = next;
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "block-vocab" },
});
/** @type {__VLS_StyleScopedClasses['block-vocab']} */ ;
if (__VLS_ctx.block.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "vocab-label" },
    });
    /** @type {__VLS_StyleScopedClasses['vocab-label']} */ ;
    (__VLS_ctx.block.label);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
    ...{ class: "vocab-list" },
});
/** @type {__VLS_StyleScopedClasses['vocab-list']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.block.items))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
        key: (item.word),
        ...{ class: "vocab-item" },
    });
    /** @type {__VLS_StyleScopedClasses['vocab-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.speakJapanese(item.word);
                // @ts-ignore
                [block, block, block, speakJapanese,];
            } },
        ...{ class: "vocab-word speakable" },
    });
    /** @type {__VLS_StyleScopedClasses['vocab-word']} */ ;
    /** @type {__VLS_StyleScopedClasses['speakable']} */ ;
    (item.word);
    if (item.reading_display) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(item.reading_display))
                        return;
                    __VLS_ctx.speakJapanese(item.reading_display);
                    // @ts-ignore
                    [speakJapanese,];
                } },
            ...{ class: "vocab-reading speakable" },
            title: "点击朗读读音",
        });
        /** @type {__VLS_StyleScopedClasses['vocab-reading']} */ ;
        /** @type {__VLS_StyleScopedClasses['speakable']} */ ;
        (item.reading_display);
    }
    if (item.type) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "vocab-type" },
        });
        /** @type {__VLS_StyleScopedClasses['vocab-type']} */ ;
        (item.type);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "vocab-sep" },
    });
    /** @type {__VLS_StyleScopedClasses['vocab-sep']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "vocab-meaning" },
    });
    /** @type {__VLS_StyleScopedClasses['vocab-meaning']} */ ;
    (item.meaning);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.onAdd(item);
                // @ts-ignore
                [onAdd,];
            } },
        ...{ class: "vocab-add" },
        ...{ class: ({ added: __VLS_ctx.added.has(item.word) }) },
        title: (__VLS_ctx.added.has(item.word) ? '已加入复习' : '加入单词复习'),
    });
    /** @type {__VLS_StyleScopedClasses['vocab-add']} */ ;
    /** @type {__VLS_StyleScopedClasses['added']} */ ;
    (__VLS_ctx.added.has(item.word) ? '✓' : '＋');
    // @ts-ignore
    [added, added, added,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
