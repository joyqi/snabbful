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
    styleModule
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