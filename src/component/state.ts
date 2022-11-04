export type State = Record<string, any>;

type Watcher = () => void;

interface Ref<T> {
    readonly watch: (fn: Watcher, key?: string) => void;
    readonly commit: (key?: string) => void;
    readonly snapshot: () => T;
    readonly emit: (event: string, data?: any) => void;
    readonly on: (event: string, fn: (data?: any) => void) => void;
    readonly keep: <T>(value: T | {(): T}, key?: string) => T;
    readonly lose: (key: string) => void;
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
    const keepers = new Map<string, any>();
    const dom = document.createDocumentFragment();
    let watchers: Record<string, Watcher[]> = {};

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

    const getWatchers = (key: string): Watcher[] => {
        if (!watchers[key]) {
            watchers[key] = [];
        }

        return watchers[key];
    };

    // Register a watcher for the given key.
    // If the key is a function, it will be called when the state is changed.
    const watch = (fn: Watcher, key = '') => {
        let watchers = getWatchers(key);
        watchers.push(fn); 
    };

    // Trigger the commit function atomically.
    const commit = (key = '') => {
        getWatchers('').forEach(fn => fn());

        if (key != '') {
            getWatchers(key).forEach(fn => fn());
        }
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

    const keep = (value: any, key = '') => {
        if (!keepers.has(key)) {
            keepers.set(key, typeof value === 'function' ? value() : value);
        }

        return keepers.get(key);
    };

    const lose = (key: string) => {
        keepers.delete(key);
    };

    (refMap as WeakMap<T, Ref<T>>).set(t, {watch, commit, snapshot, emit, on, keep, lose});
    return t;
}
