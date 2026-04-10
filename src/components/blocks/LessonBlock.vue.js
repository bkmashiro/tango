/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import BlockHeading from './BlockHeading.vue';
import BlockParagraph from './BlockParagraph.vue';
import BlockNote from './BlockNote.vue';
import BlockVocabList from './BlockVocabList.vue';
import BlockExampleList from './BlockExampleList.vue';
import BlockSumbox from './BlockSumbox.vue';
import BlockTable from './BlockTable.vue';
import BlockVideo from './BlockVideo.vue';
const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.block.type === 'heading') {
    const __VLS_0 = BlockHeading;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        block: (__VLS_ctx.block),
    }));
    const __VLS_2 = __VLS_1({
        block: (__VLS_ctx.block),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_5 = {};
    var __VLS_3;
}
else if (__VLS_ctx.block.type === 'paragraph') {
    const __VLS_6 = BlockParagraph;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        block: (__VLS_ctx.block),
    }));
    const __VLS_8 = __VLS_7({
        block: (__VLS_ctx.block),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    var __VLS_11 = {};
    var __VLS_9;
}
else if (__VLS_ctx.block.type === 'note') {
    const __VLS_12 = BlockNote;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        block: (__VLS_ctx.block),
    }));
    const __VLS_14 = __VLS_13({
        block: (__VLS_ctx.block),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_17 = {};
    var __VLS_15;
}
else if (__VLS_ctx.block.type === 'vocab-list') {
    const __VLS_18 = BlockVocabList;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ 'onAddToSRS': {} },
        block: (__VLS_ctx.block),
        addedWords: (__VLS_ctx.addedWords),
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onAddToSRS': {} },
        block: (__VLS_ctx.block),
        addedWords: (__VLS_ctx.addedWords),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = ({ addToSRS: {} },
        { onAddToSRS: (...[$event]) => {
                if (!!(__VLS_ctx.block.type === 'heading'))
                    return;
                if (!!(__VLS_ctx.block.type === 'paragraph'))
                    return;
                if (!!(__VLS_ctx.block.type === 'note'))
                    return;
                if (!(__VLS_ctx.block.type === 'vocab-list'))
                    return;
                __VLS_ctx.$emit('addToSRS', $event);
                // @ts-ignore
                [block, block, block, block, block, block, block, block, addedWords, $emit,];
            } });
    var __VLS_25 = {};
    var __VLS_21;
    var __VLS_22;
}
else if (__VLS_ctx.block.type === 'example-list') {
    const __VLS_26 = BlockExampleList;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        block: (__VLS_ctx.block),
    }));
    const __VLS_28 = __VLS_27({
        block: (__VLS_ctx.block),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    var __VLS_31 = {};
    var __VLS_29;
}
else if (__VLS_ctx.block.type === 'sumbox') {
    const __VLS_32 = BlockSumbox;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        block: (__VLS_ctx.block),
    }));
    const __VLS_34 = __VLS_33({
        block: (__VLS_ctx.block),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    var __VLS_37 = {};
    var __VLS_35;
}
else if (__VLS_ctx.block.type === 'table') {
    const __VLS_38 = BlockTable;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        block: (__VLS_ctx.block),
    }));
    const __VLS_40 = __VLS_39({
        block: (__VLS_ctx.block),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    var __VLS_43 = {};
    var __VLS_41;
}
else if (__VLS_ctx.block.type === 'video') {
    const __VLS_44 = BlockVideo;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
        block: (__VLS_ctx.block),
    }));
    const __VLS_46 = __VLS_45({
        block: (__VLS_ctx.block),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    var __VLS_49 = {};
    var __VLS_47;
}
// @ts-ignore
[block, block, block, block, block, block, block, block,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
