export const VIDEO_DEFAULTS = {
    editmode: false,
    videoIdExtractor: {},
    resources: {
        youtube: 'https://www.youtube.com/iframe_api',
        vimeo: 'https://player.vimeo.com/api/player.js',
    },
    apiParameter: {
        youtube: {},
        vimeo: {},
    },
    pingAutoPlayOnScroll: false,
    assetLightbox: (videoId, posterPath) => {
    },
    assetInline: (videoId) => {
    },
    assetPlay: () => {
    },
    assetPause: () => {
    },
    youtubeLightbox: (videoId, posterPath, YT) => {
    },
    vimeoLightbox: (videoId, posterPath, Vimeo) => {
    },
    customVideoSetup: () => {
    },
    customVideoPlay: () => {
    },
    customVideoPause: () => {
    },
};

export const GOOGLE_MAPS_DEFAULTS = {
    emptyInfoWindowHtml: '<div class="info-window"><div class="loading"></div></div>',
};

export const GOOGLE_OPT_OUT_LINK_DEFAULTS = {
    editmode: false,
    notify: null,
};

export const IFRAME_DEFAULTS = {
    invalidClass: 'iframe-invalid',
    loadedClass: 'iframe-loaded',
    onLoad: (iframe) => {
    },
    onLoaded: (iframe) => {
    },
};
