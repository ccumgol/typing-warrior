// Small DOM helpers.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Create an element: el('div', { class: 'x', onclick: fn }, 'text', child) */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (name.startsWith('on')) node.addEventListener(name.slice(2), value);
    else if (name === 'dataset') Object.assign(node.dataset, value);
    else node.setAttribute(name, value === true ? '' : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** A row of pill buttons; calls onSelect(value) when one is clicked. */
export function pills(options, selected, onSelect) {
  return el(
    'div',
    { class: 'pills' },
    options.map(({ value, label }) =>
      el('button', {
        class: `pill${value === selected ? ' active' : ''}`,
        type: 'button',
        tabindex: '-1',
        onclick: () => onSelect(value),
      }, label),
    ),
  );
}

export const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
