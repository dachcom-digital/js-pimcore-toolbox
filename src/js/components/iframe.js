import {IFRAME_DEFAULTS} from '../constants/defaults';

export default class Iframe {

    constructor(tbElement, options = {}) {
        this.options = Object.assign(IFRAME_DEFAULTS, options);
        this.tbElement = tbElement;
        this.iframe = this.tbElement.querySelector('iframe');

        this.init();
    }

    init() {
        if (!this.iframe) {
            this.tbElement.classList.add(this.options.invalidClass);
            return;
        }

        this.options.onLoad(this.iframe);

        this.iframe.addEventListener('load', () => {
            this.tbElement.classList.add(this.options.loadedClass);
            this.options.onLoaded(this.iframe);
        });
    }
}
