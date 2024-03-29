export type State = Record<string, any>;
type StateKey<T extends State> = '' | keyof T;

type Watcher = () => void;
type Committer<T> = (value: T) => void;

type WatcherMap<T extends State> = {
    [K in StateKey<T>]?: Watcher[];
};

interface Ref<T extends State> {
    readonly watch: (fn: Watcher, key?: StateKey<T>) => this;
    readonly commit: (fn: Committer<T>, silence: boolean) => this;
    readonly snapshot: () => T;
    readonly emit: (event: string, data?: any) => this;
    readonly on: (event: string, fn: (data?: any) => void) => this;
    readonly once: (event: string, fn: (data?: any) => void) => this;
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
    const state: T = Object.assign({}, init);
    const keepers = new Map<string, any>();
    const dom = document.createDocumentFragment();
    const watchers: WatcherMap<T> = {};
    let lock = false;

    const t = new Proxy(state, {
        set: (target, key, value) => {
            target[key as StateKey<T>] = value;
            callWatchers(key as StateKey<T>);
            return true;
        },
        get: (target, key) => {
            return target[key as StateKey<T>];
        }
    });

    const getWatchers = (key: StateKey<T>): Watcher[] => {
        if (!watchers[key]) {
            watchers[key] = [];
        }

        return watchers[key] as Watcher[];
    };

    const callWatchers = (key: StateKey<T>): void => {
        if (lock) {
            return;
        }

        // Lock the state to prevent infinite loops.
        lock = true;

        getWatchers(key).forEach(fn => fn());

        if (key !== '') {
            getWatchers('').forEach(fn => fn());
        }

        // Unlock the state.
        lock = false;
    };

    const listenEvent = (once: boolean, getter: () => Ref<T>) => {
        return (event: string, fn: (data?: any) => void) => {
            dom.addEventListener(event, (e) => {
                fn((e as CustomEvent).detail);
            }, { once });

            return getter();
        };
    };

    const r: Ref<T> = {
        watch: (fn: Watcher, key = '') => {
            let watchers = getWatchers(key);
            watchers.push(fn);
            return r;
        },

        commit: (fn: Committer<T>, silence = false) => {
            const s = r.snapshot();
            fn(s);
            Object.assign(state, s);

            if (!silence) {
                callWatchers('');
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

        on: listenEvent(false, () => r),

        once: listenEvent(true, () => r),

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

    refMap.set(t, r);
    return t;
}
