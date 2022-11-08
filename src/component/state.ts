export type State = Record<string, any>;

type Watcher = () => void;

interface Ref<T> {
    readonly watch: (fn: Watcher, key?: string) => this;
    readonly commit: (key?: string) => this;
    readonly snapshot: () => T;
    readonly emit: (event: string, data?: any) => this;
    readonly on: (event: string, fn: (data?: any) => void) => this;
    readonly keep: <T>(value: T | {(): T}, key?: string) => T;
    readonly lose: (key: string) => this;
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

    const r: Ref<T> = {
        watch: (fn: Watcher, key = '') => {
            let watchers = getWatchers(key);
            watchers.push(fn);
            return r;
        },

        commit: (key = '') => {
            getWatchers('').forEach(fn => fn());

            if (key != '') {
                getWatchers(key).forEach(fn => fn());
            }
            
            return r;
        },

        snapshot: () => {
            const s = {} as T;
            Object.assign(s, state);
            return s;
        },

        emit: (event: string, data?: any) => {
            const e = new CustomEvent(event, { detail: data });
            dom.dispatchEvent(e);
            return r;
        },

        on: (event: string, fn: (data?: any) => void) => {
            dom.addEventListener(event, (e) => {
                fn((e as CustomEvent).detail);
            });

            return r;
        },

        keep: (value: any, key = '') => {
            if (!keepers.has(key)) {
                keepers.set(key, typeof value === 'function' ? value() : value);
            }

            return keepers.get(key);
        },

        lose: (key: string) => {
            keepers.delete(key);
            return r;
        },
    };

    (refMap as WeakMap<T, Ref<T>>).set(t, r);
    return t;
}
