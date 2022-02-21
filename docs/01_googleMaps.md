# Google Maps Component

This component will enable the google maps rendering.

## Enable Component

```js
import {GoogleMaps} from 'js-pimcore-toolbox';
```

```js
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toolbox-googlemap').forEach((el) => {
        new GoogleMaps(el);
    });
});
```

## Extended Usage

```js
let map = new GoogleMaps(el, {
    emptyInfoWindowHtml: '<div class="info-window"><div class="loading"></div></div>',
});

map.resize()
```

Use resize method e.g. for Bootstrap collapsed elements:
```js
document.addEventListener('shown.bs.collapse', (ev) => {
    map.resize()
});
```
