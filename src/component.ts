import { VNode, init, Module } from "snabbdom";

type TypedFunctionComponent<T> = (props: T, children?: VNode[]) => VNode
type NulledFunctionComponent = (props: null, children?: VNode[]) => VNode

interface State {
    [key: string]: any
}

type WatcherFn<T> = (data: T) => void
type RegisterWatcherFn<T> = (fn: WatcherFn<T>) => void
type CommitFn = (fn: () => void) => void

function createState<T extends State>(init: T): [T, RegisterWatcherFn<T>, CommitFn] {
    const t: T = {} as T, state: State = {};
    let watcher: WatcherFn<T> | null = null;
    let isLocked = false;

    Object.keys(init).forEach((key: string) => {
        state[key] = init[key];

        Object.defineProperty(t, key, {
            enumerable: true,
            set: (v) => {
                state[key] = v;
                runWatcher()
            },
            get: () => state[key]
        });
    });

    const watch: RegisterWatcherFn<T> = (fn) => {
        watcher = fn
    }

    const runWatcher = () => {
        if (!isLocked && watcher) {
            watcher(t)
        }
    }

    const commit: CommitFn = (fn) => {
        isLocked = true
        fn();
        isLocked = false
        runWatcher()
    }

    return [t, watch, commit];
}

export function initComponent(modules: Module[]) {
    const patch = init(modules);

    return <T extends State>(fn: TypedFunctionComponent<T>, init: T): [NulledFunctionComponent, T, CommitFn] => {
        const [state, watch, commit] = createState(init)

        return [(_: null, children?: VNode[]): VNode => {
            let vnode = fn(init, children)

            watch((data) => {
                vnode = patch(vnode, fn(data, children))
            })

            return vnode
        }, state, commit]
    }
}
