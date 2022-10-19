import { toVNode, VNode, Fragment, Module, attributesModule, classModule, eventListenersModule, propsModule, datasetModule, styleModule, init } from "snabbdom";

/**
 * Query selector
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

export function detectModules(vnode: VNode) {
    const modules: Module[] = [];

    if (vnode.data?.attrs) {
        modules.push(attributesModule);
    }

    if (vnode.data?.class) {
        modules.push(classModule);
    }

    if (vnode.data?.on) {
        modules.push(eventListenersModule);
    }

    if (vnode.data?.props) {
        modules.push(propsModule);
    }

    if (vnode.data?.dataset) {
        modules.push(datasetModule);
    }

    if (vnode.data?.style) {
        modules.push(styleModule);
    }

    if (vnode.children && vnode.children.length > 0) {
        for (const child of vnode.children) {
            if (typeof child === 'string') {
                continue;
            }

            const childModules = detectModules(child);

            childModules.forEach(module => {
                if (!modules.includes(module)) {
                    modules.push(module);
                }
            });
        }
    }

    return modules;
}

export function patchDom(parent: Element | string, vnode: VNode) {
    const modules = detectModules(vnode);
    const patch = init(modules);

    if (typeof parent === 'string') {
        const node = $(parent);

        if (!node) {
            return;
        }

        parent = node;
    }

    patch(parent, vnode);
}

/**
 * Create a VNode from a html string
 * 
 * @param html html string
 */
export function htmlVNode(html: string): VNode {
    const el = document.createElement('div');
    el.innerHTML = html;
    const vnode = toVNode(el);

    return Fragment(null, vnode.children);
}