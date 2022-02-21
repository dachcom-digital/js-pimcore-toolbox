import {VIDEO_DEFAULTS} from '../constants/defaults';
import {isFunction} from '../utils/helpers';

class VideoIdExtractor {
    constructor(options) {
        this.userMethods = options;
        this.extrator = {
            asset: function (videoId) {
                return videoId;
            },
            youtube: (urlParam) => {
                let regExp, match, url = urlParam.toString();
                if (!url.match(/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/)) {
                    return url;
                } else {
                    regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\??v?=?))([^#\&\?]*).*/;
                    match = url.match(regExp);
                    if (match && match[7]) {
                        return match[7];
                    } else {
                        console.error('toolbox error: unable to parse video id from url: ' + url);
                    }
                }
            },

            vimeo: (urlParam) => {
                let regExp, match, url = urlParam.toString();
                if (!url.match(/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/)) {
                    return url;
                } else {
                    regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
                    match = url.match(regExp);
                    if (match && match[3]) {
                        return match[3];
                    } else {
                        console.error('toolbox error: unable to parse video id from url: ' + url);
                    }
                }
            },
        };

        this.getVideoId = function () {

            let args = Array.prototype.slice.call(arguments),
                type = args.shift();

            if (isFunction(this.userMethods[type])) {
                return this.userMethods[type](args);
            }

            if (isFunction(this.extrator[type])) {
                return this.extrator[type](args);
            }

            console.error('toolbox error: no valid video id extractor for ' + type + ' found!');

            return null;
        };
    }
}

export default class Video {
    constructor(element, options = {}) {
        this.element = element;
        this.options = Object.assign(VIDEO_DEFAULTS, options);
        this.editMode = this.options.editmode;
        this.videoIdExtractor = new VideoIdExtractor(this.options.videoIdExtractor);

        if (this.editMode === true) {
            return;
        }

        this.setupVideoElement();

        if (this.options.pingAutoPlayOnScroll) {
            window.addEventListener('scroll', this.pingAutoPlay.bind(this));
        }
    }

    setupVideoElement() {
        this.elementId = this.element.dataset.tbExtVideoIndex;
        this.videoType = this.element.dataset.type;

        if (this.element.classList.contains('autoplay')) {
            this.autoPlay = true;
        }

        this.player = this.element.querySelector('.player');
        if (!this.player) {
            return;
        }

        this.videoId = this.getVideoId(this.player.dataset.videoUri);
        this.playInLightBox = this.player.dataset.playInLightbox;
        this.posterPath = this.player.dataset.posterPath;

        if (this.player.dataset.videoParameter) {
            this.videoParameter = this.player.dataset.videoParameter;
        }

        if (this.posterPath) {
            this.hasPoster = true;
        }

        switch (this.videoType) {
            case 'youtube' :
                this.setupYoutubeVideo();
                break;
            case 'asset' :
                this.setupAssetVideo();
                break;
            case 'vimeo':
                this.setupVimeoVideo();
                break;
            default:
                this.setupCustomVideo();
        }
    }

    setupAssetVideo() {
        if (this.playInLightBox && this.hasPoster) {
            this.element.addEventListener('click', (ev) => {
                ev.preventDefault();
                this.options.assetLightbox(this.videoId, this.posterPath);
            });
        } else {
            if (!this.hasPoster) {
                this.isReady = true;
                this.element.classList.add('player-ready');
                this.options.assetInline(this.videoId);
            } else {
                this.element.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.isReady = true;
                    this.element.querySelector('.poster-overlay').remove();
                    this.element.classList.add('player-ready');
                    this.options.assetInline(this.videoId);
                }, {once: true});
            }
        }
    }

    loadScript(type) {
        return new Promise((resolve) => {
            if (document.querySelectorAll('script.tb-video-youtube-api').length) {
                resolve();
            }

            let tag = document.createElement('script');
            tag.src = this.options.resources[type];
            tag.type = 'text/javascript';
            tag.className = `tb-video-${type}-api`;
            document.head.append(tag);

            tag.addEventListener('load', () => {
                document.body.dataset[`toolbox${type}ApiReady`] = 'true';
                resolve();
            });
        });
    }

    setupYoutubeVideo() {
        this.loadScript('youtube').then(() => {
            if (this.playInLightBox && this.hasPoster) {
                this.element.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.options.youtubeLightbox(this.videoId, this.posterPath, window.YT);
                });
            } else {
                let initPlayer = (el, autostart) => {
                    let player,
                        playerlets = Object.assign({}, this.options.apiParameter.youtube, this.videoParameter),
                        options = {
                            videoId: this.videoId,
                            host: 'https://www.youtube-nocookie.com',
                            events: {
                                'onReady': () => {
                                    this.isReady = true;
                                    this.playerEngine = player;
                                    this.element.classList.add('player-ready');
                                    if (autostart === true) {
                                        this.playVideo();
                                    }
                                },
                            },
                        };

                    window.YT.ready(() => {
                        player = new window.YT.Player(
                            el, Object.assign({}, {playerlets: playerlets}, options),
                        );
                    });
                };

                if (!this.hasPoster) {
                    initPlayer(this.player, this.autoPlay);
                } else {
                    this.element.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        initPlayer(this.player, true);
                        this.element.querySelector('.poster-overlay').remove();
                    }, {once: true});
                }
            }
        });

    }

    setupVimeoVideo() {

        this.loadScript('vimeo').then(() => {
            if (this.playInLightBox && this.hasPoster) {
                this.element.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.options.vimeoLightbox(this.videoId, this.posterPath, Vimeo.Player);
                });
            } else {
                let initPlayer = (el, autostart) => {
                    let player,
                        options = {
                            id: this.videoId,
                        };
                    player = new Vimeo.Player(
                        el, Object.assign({}, this.options.apiParameter.vimeo, this.videoParameter, options),
                    );
                    player.on('loaded', () => {
                        this.isReady = true;
                        this.playerEngine = player;
                        this.element.classList.add('player-ready');
                        if (autostart) {
                            this.playVideo();
                        }
                    });
                };
                if (!this.hasPoster) {
                    initPlayer(this.player, this.autoPlay);
                } else {
                    this.element.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        initPlayer(this.player, true);
                        this.element.querySelector('.poster-overlay').remove();
                    }, {once: true});
                }
            }
        });
    }

    setupCustomVideo() {
        this.options.customVideoSetup();
    }

    play() {
        this.playVideo();
    }

    playVideo() {
        if (!this.isReady) {
            return;
        }
        switch (this.videoType) {
            case 'youtube' :
                if (isFunction(this.playerEngine.getPlayerState)) {
                    if (this.playerEngine.getPlayerState() !== window.YT.PlayerState.PLAYING) {
                        this.playerEngine.playVideo();
                    }
                }
                break;
            case 'vimeo':
                if (isFunction(this.playerEngine.getPaused)) {
                    this.playerEngine.getPaused().then((paused) => {
                        if (paused) {
                            this.playerEngine.play();
                        }
                    }).catch(function (error) {
                        // fail silently
                    });
                }
                break;
            case 'asset' :
                this.options.assetPlay();
                break;
            default:
                this.options.customVideoPlay();
        }
    }

    pause() {
        this.pauseVideo();
    }

    pauseVideo() {
        if (!this.isReady) {
            return;
        }
        switch (this.videoType) {
            case 'youtube' :
                if (isFunction(this.playerEngine.getPlayerState)) {
                    if (this.playerEngine.getPlayerState() === window.YT.PlayerState.PLAYING) {
                        this.playerEngine.pauseVideo();
                    }
                }
                break;
            case 'vimeo':
                if (isFunction(this.playerEngine.getPaused)) {
                    this.playerEngine.getPaused().then((paused) => {
                        if (!paused) {
                            this.playerEngine.pause();
                        }
                    }).catch(function (error) {
                        // fail silently
                    });
                }
                break;
            case 'asset' :
                this.options.assetPause();
                break;
            default:
                this.options.customVideoPause();
        }
    }

    getVideoId(url) {
        return this.videoIdExtractor.getVideoId(this.videoType, url);
    }

    pingAutoPlay() {
        if (!this.isReady || !this.autoPlay) {
            return;
        }

        let tolerancePixel = 40,
            rect = this.element.getBoundingClientRect();

        if (rect.bottom >= tolerancePixel && rect.top <= window.innerHeight - tolerancePixel) {
            this.playVideo();
        } else {
            this.pauseVideo();
        }
    }
}
