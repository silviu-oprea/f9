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