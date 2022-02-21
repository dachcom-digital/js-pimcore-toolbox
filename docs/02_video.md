# Video Component

This component will enable the video rendering.

## Enable Extension

```js
import {Video} from 'js-pimcore-toolbox';
```

```js
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toolbox-video').forEach((el) => {
        new Video(el);
    });
});
```

## Extended Usage

```js
new Video(el, {
    editmode: false,
    videoIdExtractor: {
        custom: function (videoId) {
            console.log(videoId);
            return videoId;
        }
    },
    resources: {
        youtube: 'https://www.youtube.com/iframe_api',
        vimeo: 'https://player.vimeo.com/api/player.js',
    },
    apiParameter: {
        youtube: {
            rel: 0 //disable related videos
        },
        vimeo: {}
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
});
```

### Video Extended I: Open Video in a Light Box

If you have selected the Light Box option, you need to take care about the video by yourself:

```js
new Video(el, {
    youtubeLightbox: (videoId, posterPath) => {
        // implement your own openVideo() function somewhere.
        openVideo('https://youtube.com/watch?v=' + videoId);
    },
    vimeoLightbox: (videoId, posterPath) => {
        // implement your own openVideo() function somewhere.
        openVideo('https://vimeo.com/' + videoId);
    }
});
```

### Video Extended II: Use Pimcore Assets as Video

If you're using pimcore video assets, you need to provide your own player api. Pimcore will render a default html5 video tag in
frontend.

If you want to add the autoplay function, you need to add a play and pause event:

```js
new Video(el, {
    assetPlay: () => {
        // hit the play button of your html5 video.
        // this is also the place where to trigger the play state for your custom framework (video.js for example)
        video.querySelector('video').play();
    },
    assetPause: () => {
        // hit the pause button of your html5 video.
        video.querySelector('video').pause();
    }
});
```

### Video Extended III: Use a custom player engine

If you have a different engine, you need to do some further work.

#### Add some markup

```twig
<div class="toolbox-element toolbox-video" data-type="custom">
    <div class="video-inner">
        <div class="player" data-play-in-lightbox="false" data-video-uri="Ue80bTM1vmc"></div>
    </div>
</div>
```

#### Initialize Player

```js
new Video(el, {
    videoIdExtractor: {
        custom: function (videoId) {
            // parse your video id
            console.log(videoId);
            return videoId;
        }
    },
    customVideoSetup: () => {
    },
    customVideoPlay: () => {
    },
    customVideoPause: () => {
    },
});
```
