/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../home/node/.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const __VLS_props = defineProps();
function playAudio(key) {
    const base = import.meta.env.BASE_URL + 'audio/' + key;
    const audio = new Audio(base + '.mp3');
    audio.play().catch(() => {
        new Audio(base + '.ogg').play().catch(() => { });
    });
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
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "inlines" },
});
/** @type {__VLS_StyleScopedClasses['inlines']} */ ;
for (const [token, i] of __VLS_vFor((__VLS_ctx.inlines))) {
    (i);
    if (token.type === 'text') {
        (token.content);
    }
    else if (token.type === 'ruby') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.ruby, __VLS_intrinsics.ruby)({
            ...{ class: "jp-ruby" },
            title: ([token.reading, token.meaning].filter(Boolean).join(' — ')),
        });
        /** @type {__VLS_StyleScopedClasses['jp-ruby']} */ ;
        (token.text);
        __VLS_asFunctionalElement1(__VLS_intrinsics.rp, __VLS_intrinsics.rp)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.rt, __VLS_intrinsics.rt)({});
        (token.reading ?? token.meaning ?? '');
        __VLS_asFunctionalElement1(__VLS_intrinsics.rp, __VLS_intrinsics.rp)({});
    }
    else if (token.type === 'bold') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (token.content);
    }
    else if (token.type === 'italic') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({});
        (token.content);
    }
    else if (token.type === 'underline') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.u, __VLS_intrinsics.u)({});
        (token.content);
    }
    else if (token.type === 'br') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    }
    else if (token.type === 'link') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (token.href),
            target: "_blank",
            rel: "noopener",
        });
        (token.content);
    }
    else if (token.type === 'audio') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(token.type === 'text'))
                        return;
                    if (!!(token.type === 'ruby'))
                        return;
                    if (!!(token.type === 'bold'))
                        return;
                    if (!!(token.type === 'italic'))
                        return;
                    if (!!(token.type === 'underline'))
                        return;
                    if (!!(token.type === 'br'))
                        return;
                    if (!!(token.type === 'link'))
                        return;
                    if (!(token.type === 'audio'))
                        return;
                    __VLS_ctx.playAudio(token.key);
                    // @ts-ignore
                    [inlines, playAudio,];
                } },
            ...{ class: "audio-btn" },
        });
        /** @type {__VLS_StyleScopedClasses['audio-btn']} */ ;
        (token.text);
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
