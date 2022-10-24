import {
    toVNode,
    VNode,
    Fragment,
    Module,
    attributesModule,
    classModule,
    eventListenersModule,
    propsModule,
    datasetModule,
    styleModule,
    init
} from 'snabbdom';

/**
 * Query selector
 */
export function $<T extends Element>(sel: string, parent?: string | ParentNode): T {
    const root: ParentNode | null = parent ?
        (typeof parent === 'string' ? document.querySelector(parent) : parent) : document;

    if (!root) {
        throw new Error('Root element not found');
    }

    const node = root.querySelector<T>(sel);

    if (!node) {
        throw new Error(`Element not found: ${sel}`);
    }

    return node;
}

/**
 * Detect the modules by the given vnode.
 * This function will be triggered recursively, if the vnode has children.
 * Please note the performance issue.
 */
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

/**
 * Patch the vnode to the given element.
 * The element can be a selector or an element.
 */
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
 */
export function htmlVNode(html: string): VNode {
    const el = document.createElement('div');
    el.innerHTML = html.trim();
    const vnode = toVNode(el);

    if (vnode.children && vnode.children.length === 1) {
        const firstChild = vnode.children[0];

        if (typeof firstChild === 'string') {
            throw new Error('The html string must have a root element');
        }

        return firstChild;
    } else {
        return Fragment(null, vnode.children);
    }
}