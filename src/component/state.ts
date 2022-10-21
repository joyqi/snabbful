export type State = Record<string, any>;

type Effector = () => void;

interface Ref<T> {
    readonly effect: (fn: Effector) => void;
    readonly commit: () => void;
    readonly snapshot: () => T;
    readonly emit: (event: string, data?: any) => void;
    readonly on: (event: string, fn: (data?: any) => void) => void;
}

// Store the state and its watchers, keyed by the state object.
const refMap = new WeakMap();

export function ref<T extends State>(state: T): Ref<T> {
    const map = refMap.get(state);

    if (!map) {
        throw new Error('State not found.');
    }

    return map;
}

export function createState<T extends State>(init: T): T {
    const t = {} as T;
    const state: State = {};
    const dom = document.createDocumentFragment();
    let effectors: Effector[] = [];

    Object.keys(init).forEach((key: string) => {
        state[key] = init[key];

        Object.defineProperty(t, key, {
            enumerable: true,
            set: (v) => {
                state[key] = v;
            },
            get: () => state[key]
        });
    });

    // Register a watcher for the given key.
    // If the key is a function, it will be called when the state is changed.
    const effect = (fn: Effector) => {
        effectors.push(fn); 
    };

    // Trigger the commit function atomically.
    const commit = () => {
        effectors.forEach(fn => fn());
    };

    // Snapshot the current state.
    const snapshot = () => {
        const s = {} as T;
        Object.assign(s, state);
        return s;
    };

    const emit = (event: string, data?: any) => {
        const e = new CustomEvent(event, { detail: data });
        dom.dispatchEvent(e);
    };

    const on = (event: string, fn: (data?: any) => void) => {
        dom.addEventListener(event, (e) => {
            fn((e as CustomEvent).detail);
        });
    };

    (refMap as WeakMap<T, Ref<T>>).set(t, {effect, commit, snapshot, emit, on});
    return t;
}
