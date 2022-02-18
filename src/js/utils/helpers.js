export function isString(s) {
    return typeof s === 'string';
}

export function isFunction(f) {
    return typeof f === 'function';
}

export function isNumeric(x) {
    return parseFloat(x).toString() === x.toString();
}
