# Google Opt-Out Link Component

This component searches for google opt-out links. By clicking on a link with the class `a.google-opt-out-link` a cookie will be
stored to prevent future analytic tracking.

## Enable Extension

```js
import {GoogleOptOutLink} from 'js-pimcore-toolbox';
```

```js
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.google-opt-out-link').forEach((el) => {
        new GoogleOptOutLink(el);
    });
});
```

## Extended Usage

```js
new GoogleOptOutLink(el, {
    editmode: false,
    notify: function (message) {
        // implement your message style here
        console.log(message);
    }
});
```
