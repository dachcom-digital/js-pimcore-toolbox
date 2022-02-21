# Iframe Component

This component will enable the iframe rendering. We can't provide any out-of-the-box solution for changing the iframe height
dynamically (cross-domain policy), so you need to take care about that by yourself.

## Enable Extension

```js
import {Iframe} from 'js-pimcore-toolbox';
```

```js
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toolbox-iframe').forEach((el) => {
        new Iframe(el);
    });
});
```

## Extended Usage

```js
new Iframe(el, {
    invalidClass: 'iframe-invalid',
    loadedClass: 'iframe-loaded',
    onLoad: (iframe) => {
    },
    onLoaded: (iframe) => {
    },
});
```
