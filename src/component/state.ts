export interface State {
    [key: string]: any
}

type CallbackFn = () => void
type RegisterWatcherFn<T> = (k: CallbackFn | keyof T, v?: CallbackFn) => void
type CommitFn = (fn: CallbackFn) => void

const stateMap = new WeakMap()

export function createState<T extends State>(init: T): T {
    const t: T = {} as T, state: State = {};
    let watchers: [string, CallbackFn][] = [];
    let isLocked = false;

    Object.keys(init).forEach((key: string) => {
        state[key] = init[key];

        Object.defineProperty(t, key, {
            enumerable: true,
            set: (v) => {
                state[key] = v;
                runWatcher(key);
            },
            get: () => state[key]
        });
    });

    const watch: RegisterWatcherFn<T> = (k, v) => {
        watchers.push(typeof k === 'string' ? [k, v as CallbackFn] : ['', k as CallbackFn]);
    }

    const runWatcher = (k: string) => {
        if (!isLocked) {
            watchers.forEach(fn => {
                if (fn[0] === k || fn[0] === '') {
                    fn[1]();
                }
            });
        }
    }

    const commit: CommitFn = (fn) => {
        isLocked = true;
        fn();
        isLocked = false;
        runWatcher('');
    }

    stateMap.set(t, [watch, commit]);
    return t;
}

export function useState<T extends State>(state: T): [RegisterWatcherFn<T>, CommitFn] {
    const value = stateMap.get(state);

    if (!value) {
        throw new Error('State is not initialized');
    }

    return value;
}
