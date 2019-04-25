export function createElement(type, options, innerText) {
    const el = document.createElement(type);

    if (typeof options !== "undefined") {
        if (typeof options.classList !== "undefined") {
            el.classList.add(...options.classList);
        }

        if (typeof options.attrs !== "undefined") {
            Object.keys(options.attrs).forEach(key => {
                el.setAttribute(key, options.attrs[key]);
            });
        }
    }

    if (typeof innerText !== "undefined") {
        el.innerText = innerText;
    }
    return el;
}

export function showElement(toShow, toHide) {
    if (typeof toHide !== "undefined") {
        for (const el of toHide) {
            el.classList.add('hide');
        }
    }
    toShow.classList.remove('hide');
}

export function clearElement(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

export function setElementContent(el, ...children) {
    clearElement(el);
    for (const child of children) {
        el.appendChild(child);
    }
}

export function stringIsPositiveInteger(s) {
    return /^\+?[1-9][\d]*$/.test(s);
}
