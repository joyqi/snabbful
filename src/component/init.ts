import { VNode, init, Module } from 'snabbdom';
import { detectModules } from '../helpers';
import { createState, State, ref } from './state';

type NullParams = {};
type TypedFunctionComponent<T> = (props: T, children?: VNode[]) => VNode;
type NulledFunctionComponent = (props: NullParams, children?: VNode[]) => VNode;

export function initComponent(modules?: Module[]) {
    return <T extends State>(fn: TypedFunctionComponent<T>, params: T): [NulledFunctionComponent, T] => {
        const state = createState(params);

        return [(_: NullParams, children?: VNode[]): VNode => {
            let vnode = fn(state, children);
            const patch = init(modules || detectModules(vnode), undefined, { experimental: { fragments: true } });

            ref(state).watch(() => {
                const newVnode = patch(vnode, fn(state, children));
                Object.assign(vnode, newVnode);
            });

            return vnode;
        }, state];
    };
}