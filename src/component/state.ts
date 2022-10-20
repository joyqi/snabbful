export type State = Record<string, any>;
type CallbackFn<T> = (s: T) => void;

type GeneralWatcherRegister<T> = (fn: CallbackFn<T>) => void;

type SpecifiedWatcherRegister<T, K extends keyof T> = (key: K, fn: CallbackFn<T[K]>) => void;

type WatcherRegister<T> = (k: CallbackFn<T> | keyof T, v?: CallbackFn<T>) => void;

/**
 * Commit a state change.
 */
type BatchCommitter<T> = (s: T) => void;

/**
 * Commit a single value change.
 */
type SingleCommitter<T> = (v: T) => T;

/**
 * Perform a batch commit.
 */
type BatchedCommitRunner<T> = (fn: BatchCommitter<T>, _: undefined) => void;

/**
 * Perform a single value changing commit function.
 */
type SingleCommitRunner<T, K extends keyof T> = (key: K, fn: SingleCommitter<T[K]>) => void;

/**
 * Perform a commit action.
 */
type CommitRunner<T> = BatchedCommitRunner<T> & SingleCommitRunner<T, keyof T>;

type StateMap<T extends State> = WeakMap<T, [WatcherRegister<T>, CommitRunner<T>]>;

// Store the state and its watchers, keyed by the state object.
const stateMap = new WeakMap();

export function createState<T extends State>(init: T): T {
    const t = {} as T, state: State = {};
    let watchers: [string, CallbackFn<T>][] = [];
    let isLocked = false;

    Object.keys(init).forEach((key: string) => {
        state[key] = init[key];

        Object.defineProperty(t, key, {
            enumerable: true,
            set: (v) => {
                state[key] = v;
                triggerWatcher(key);
            },
            get: () => state[key]
        });
    });

    // Register a watcher for the given key.
    // If the key is a function, it will be called when the state is changed.
    const watch: WatcherRegister<T> = (k, v) => {
        let key: string, fn: CallbackFn<T>;

        if (typeof k === 'string' && typeof v === 'function') {
            key = k;
            fn = v;
        } else if (typeof k === 'function') {
            key = '';
            fn = k;
        } else {
            throw new Error('Invalid arguments');
        }

        watchers.push([key, fn]);
    };

    // Trigger the watcher for the given key.
    const triggerWatcher = (k: string) => {
        if (!isLocked) {
            watchers.forEach(fn => {
                if (fn[0] === k) {
                    fn[1](t[k]);
                } else if (fn[0] === '') {
                    fn[1](t);
                }
            });
        }
    };

    // Trigger the commit function atomically.
    const commit: CommitRunner<T> = (k, v) => {
        if (typeof k === 'string' && typeof v === 'function') {
            t[k as keyof T] = v(t[k]);
        } else if (typeof k === 'function') {
            isLocked = true;
            k(t);
            isLocked = false;
            
            triggerWatcher('');
        } else {
            throw new Error('Invalid arguments');
        }
    };

    stateMap.set(t, [watch, commit]);
    return t;
}

export function useState<T extends State>(state: T): [WatcherRegister<T>, CommitRunner<T>] {
    const value = (stateMap as StateMap<T>).get(state);

    if (!value) {
        throw new Error('State is not initialized');
    }

    return value;
}
