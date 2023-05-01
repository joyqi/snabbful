import { VNode, init, Module, classModule, propsModule, attributesModule, eventListenersModule } from 'snabbdom';
import { createState, State, ref } from './state';

type NullParams = {};
type TypedFunctionComponent<T> = (props: T, children?: VNode[]) => VNode;
type NulledFunctionComponent = (props: NullParams, children?: VNode[]) => VNode;

export function initComponent(modules: Module[]) {
    return <T extends State>(fn: TypedFunctionComponent<T>, params: T): [NulledFunctionComponent, T] => {
        const state = createState(params);

        return [(_: NullParams, children?: VNode[]): VNode => {
            let vnode = fn(state, children);
            const patch = init(modules, undefined, { experimental: { fragments: true } });

            ref(state).watch(() => {
                const newVnode = patch(vnode, fn(state, children));
                Object.assign(vnode, newVnode);
            });

            return vnode;
        }, state];
    };
}

export function bindComponent(src: VNode, modules?: Module[]) {
    modules = modules || [classModule, propsModule, attributesModule, eventListenersModule];
    const patch = init(modules, undefined, { experimental: { fragments: true } });
    const component = initComponent(modules);

    return <T extends State>(fn: TypedFunctionComponent<T>, params: T) => {
        const [comp, state] = component(fn, params);
        const vnode = comp({});

        patch(src, vnode);

        return state;
    };
}