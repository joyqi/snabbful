export type State = Record<string, any>;

type Watcher<T> = (k: '' | keyof T, s: T) => void;

type WatcherRegister<T> = (fn: Watcher<T>) => void;

/**
 * Commit a state change.
 */
type Committer<T> = (s: T) => void;

/**
 * Perform a batch commit.
 */
type CommitterRunner<T> = (fn: Committer<T>) => void;

enum Effector {
    Watcher = 0,
    Committer,
}

// Store the state and its watchers, keyed by the state object.
const effectorMap = new WeakMap();

function peekEffector<T extends State>(state: T, t: Effector): WatcherRegister<T> | CommitterRunner<T> {
    const map = effectorMap.get(state);

    if (!map) {
        throw new Error('State not found.');
    }

    return map[t];
}

export function createState<T extends State>(init: T): T {
    const t = {} as T, state: State = {};
    let watchers: Watcher<T>[] = [];
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
    const watch: WatcherRegister<T> = (fn) => {
        watchers.push(fn) 
    };

    // Trigger the watcher for the given key.
    const triggerWatcher = (k: string) => {
        if (!isLocked) {
            watchers.forEach(fn => fn(k, t));
        }
    };

    // Trigger the commit function atomically.
    const commit: CommitterRunner<T> = (fn) => {
        isLocked = true;
        fn(t);
        isLocked = false;
            
        triggerWatcher('');
    };

    effectorMap.set(t, [watch, commit]);
    return t;
}

export function commit<T extends State>(state: T, fn: Committer<T>) {
    (peekEffector(state, Effector.Committer) as CommitterRunner<T>)(fn);
}

export function watch<T extends State>(state: T, fn: Watcher<T>) {
    (peekEffector(state, Effector.Watcher) as WatcherRegister<T>)(fn);
}