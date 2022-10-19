import { VNode, init, Module } from "snabbdom";
import { detectModules } from "../helpers";
import { createState, State, useState } from "./state";

type NullParams = {}
type TypedFunctionComponent<T> = (props: T, children?: VNode[]) => VNode
type NulledFunctionComponent = (props: NullParams, children?: VNode[]) => VNode

export function initComponent(modules?: Module[]) {
    let defaultPatch = modules ? init(modules) : null;

    return <T extends State>(fn: TypedFunctionComponent<T>, params: T): [NulledFunctionComponent, T] => {
        const state = createState(params);

        return [(_: NullParams, children?: VNode[]): VNode => {
            let vnode = fn(state, children);
            const patch = defaultPatch || init(detectModules(vnode));
            const [watch] = useState(state);

            watch(() => {
                vnode = patch(vnode, fn(state, children));
            })

            return vnode;
        }, state]
    }
}