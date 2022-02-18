import {GOOGLE_OPT_OUT_LINK_DEFAULTS} from '../constants/defaults';
import {isFunction} from '../utils/helpers';

export default class GoogleOptOutLink {

    constructor(element, options = {}) {
        this.translations = window['toolboxJsFrontend'] ? window['toolboxJsFrontend']['translations'] : {};
        this.options = Object.assign(GOOGLE_OPT_OUT_LINK_DEFAULTS, options);
        this.editMode = this.options.editmode;

        if (this.editMode) {
            return;
        }

        if (this.readCookie('tb-google-opt-out-link') !== null) {
            element.classList.add('disabled');
        }

        element.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (this.readCookie('tb-google-opt-out-link') !== null) {
                this.notify(this.translations['toolbox.goptout_already_opt_out']);
            } else {
                this.createCookie('tb-google-opt-out-link', element.getAttribute('name'), 999);
                this.notify(this.translations['toolbox.goptout_successfully_opt_out']);
                element.classList.add('disabled');
            }
        });
    }

    notify(message) {
        if (isFunction(this.options.notify)) {
            this.options.notify(message);
        } else {
            alert(message);
        }
    }

    readCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    createCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }
        document.cookie = name + '=' + value + expires + '; path=/';
    }

}
