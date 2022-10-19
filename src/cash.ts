import { toVNode, VNode, Fragment } from "snabbdom";

/**
 * 
 * @param sel selector
 * @param parent parent node
 */
export function $<T extends Element>(sel: string, parent?: string | ParentNode): T | null {
    const root: ParentNode | null = parent ? (typeof parent === 'string' ? document.querySelector(parent) : parent) : document;

    if (!root) {
        return null;
    }

    const node = root.querySelector<T>(sel);

    if (!node) {
        return null;
    }

    return node;
}

export function htmlVNode(html: string): VNode {
    const el = document.createElement('div');
    el.innerHTML = html;
    const vnode = toVNode(el);

    return Fragment(null, vnode.children);
}