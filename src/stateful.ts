import { VNode, init, classModule, eventListenersModule, attributesModule, Module } from "snabbdom";

type TypedFunctionComponent<T> = (props: T, children?: VNode[]) => VNode
type NulledFunctionComponent = (props: null, children?: VNode[]) => VNode

interface State {
    [key: string]: any
}

type BatchSetter<T> = (s: T) => void
type SingleSetter<T, K extends keyof T> = (s: T[K]) => void

type Setter<T> = <K extends keyof T>(k: K | BatchSetter<T>, v?: T[K] | SingleSetter<T, K>) => void
type Subscriber = () => void
type Subscribe = (fn: Subscriber) => void

function createSetter<T>(init: T): [Setter<T>, Subscribe] {
    let subscriber: Subscriber | null = null

    const subscribe: Subscribe = (fn) => {
        subscriber = fn
    }

    const setter: Setter<T> = (k, v) => {

    }

    return [setter, subscribe]
}

export function Stateful(modules: Module[]) {
    const patch = init(modules);


    return <T extends State>(fn: TypedFunctionComponent<T>, init?: T, root?: VNode): [NulledFunctionComponent, Setter<T>] => {
        const [setter, subscribe] = createSetter(init ? init : {} as T)

        return [(_: null, children?: VNode[]): VNode => {
            let vnode = fn(init, children)

            if (root) {
                vnode = patch(root, vnode)
            }

            watch((data) => {
                vnode = patch(vnode, fn(data, children))
            }, false)

            return vnode
        }, setter]
    }
}
