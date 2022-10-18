/**
 * 
 * @param sel selector
 * @param parent parent node
 */
export function $<T extends Element>(sel: string | Element | Node, parent?: string | Element | Document | Node): T {
    const root = parent ? (typeof parent === 'string' ? document.querySelector(parent) : parent) : document;

    if (!root) {
        throw new Error('No parents found');
    }

    const node = typeof sel === 'string' ? (root as Document).querySelector(sel) : sel;

    if (!node) {
        throw new Error('Not found: ' + sel);
    }

    return node as T;
}
