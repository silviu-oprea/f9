import {createElement} from "../utils";

export function buttonFactory(text, icon, aClss) {
    const a = createElement('a', {classList: aClss.concat(['waves-effect', 'waves-light', 'btn-small'])});
    const i = createElement('i', {classList: ['material-icons', 'left']}, icon);
    const span = createElement('span', {}, text);
    a.appendChild(span);
    a.appendChild(i);
    return a;
}