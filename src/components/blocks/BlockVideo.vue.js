/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
const __VLS_props = defineProps();
const expanded = ref(false);
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
    ...{ class: "block-video" },
});
/** @type {__VLS_StyleScopedClasses['block-video']} */ ;
if (!__VLS_ctx.expanded) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.expanded))
                    return;
                __VLS_ctx.expanded = true;
                // @ts-ignore
                [expanded, expanded,];
            } },
        ...{ class: "video-thumb" },
    });
    /** @type {__VLS_StyleScopedClasses['video-thumb']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "video-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['video-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.iframe)({
        src: (__VLS_ctx.block.url),
        allowfullscreen: true,
        frameborder: "0",
        ...{ class: "video-frame" },
    });
    /** @type {__VLS_StyleScopedClasses['video-frame']} */ ;
}
// @ts-ignore
[block,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
