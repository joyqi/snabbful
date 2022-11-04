import { VNode, init, Module } from 'snabbdom';
import { detectModules } from '../helpers';
import { stateModule } from './module';
import { createState, State, ref } from './state';

type NullParams = {};
type TypedFunctionComponent<T> = (props: T, children?: VNode[]) => VNode;
type NulledFunctionComponent = (props: NullParams, children?: VNode[]) => VNode;

export function initComponent(modules?: Module[]) {
    return <T extends State>(fn: TypedFunctionComponent<T>, params: T): [NulledFunctionComponent, T] => {
        const state = createState(params);

        return [(_: NullParams, children?: VNode[]): VNode => {
            let vnode = fn(state, children);
            const componentModules = modules || detectModules(vnode);

            componentModules.push(stateModule(state));
            const patch = init(componentModules, undefined, { experimental: { fragments: true } });

            ref(state).watch(() => {
                const newVnode = patch(vnode, fn(state, children));
                Object.assign(vnode, newVnode);
            });

            return vnode;
        }, state];
    };
}