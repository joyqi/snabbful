# Snabbful

Snabbful is a simple, fast, and flexible library for building user interfaces by using [Snabbdom](https://github.com/snabbdom/snabbdom).
We add a state management layer on top of Snabbdom, and we provide a simple API for building user interfaces.

## Installation

```bash
npm install snabbful
```

## Table of Contents

- [Usage](#usage)
- [Ref API](#ref-api)
  - [watch](#watch)
  - [commit](#commit)
  - [snapshot](#snapshot)
  - [emit](#emit)
  - [on](#on)
  - [keep](#keep)
  - [lose](#lose)

## Usage

### State management

There's no need to use `useState` or `useReducer` hooks, you can change the state directly.

```typescript
import { initComponent } from 'snabbful';
import { h } from 'snabbdom';

const component = initComponent([eventListenersModule]);

interface State {
  count: number;
}

function View(state: State) {
  return h('div', [
    h('button', {
      on: {
        click: () => {
          state.count++;
        },
      },
    }, 'Increment'),
    h('div', `Count: ${state.count}`),
  ]);
}

const [ViewComponent, viewState] = component(View, { count: 0 });

setInterval(() => {
  viewState.count++;
}, 1000);
```

### JSX rendering

```typescript
import { initComponent } from 'snabbful';
import { jsx, init, toVNode, eventListenersModule } from 'snabbdom';

const component = initComponent([eventListenersModule]);
const patch = init([eventListenersModule]);
const div = document.querySelector('#app');

interface State {
  count: number;
}

function View(state: State) {
  return (
    <div>
      <button
        on={{
          click: () => {
            state.count++;
          },
        }}
      >
        Increment
      </button>
      <div>{`Count: ${state.count}`}</div>
    </div>
  );
}

const [ViewComponent, viewState] = component(View, { count: 0 });

setInterval(() => {
  viewState.count++;
}, 1000);

patch(toVNode(div), <ViewComponent></ViewComponent>);
```

## Ref API

Use `ref` to get the reference of the state.

```typescript
import { initComponent, ref } from 'snabbful';

interface State {
  count: number;
}

function View(state: State) {
  return <div>{`Count: ${state.count}`}</div>;
}

const [ViewComponent, viewState] = component(View, { count: 0 });

// Get the reference of the state
const r = ref(viewState);
```

### `watch`

Use `watch` to watch the state changes.

```typescript
viewState.count ++;

// Watch the state changes
ref(viewState).watch(() => {
  console.log(`State has changed`);
});
```

You can also watch the specific property of the state.

```typescript
viewState.count ++;

// Watch the specific property of the state
ref(viewState).watch(() => {
  console.log(`Count property has changed`);
}, 'count');
```

NOTE: The re-rendering listener is also a state watcher.

### `commit`

Use `commit` to commit the state changes.

In normal cases, you don't need to use `commit`, because the state changes will be committed automatically.
But if there're many state changes, you can use `commit` to avoid unnecessary re-rendering.

```typescript
// This will cause re-rendering only once
ref(viewState).commit((state) => {
  state.count++;
  state.count+=2;
  state.count-=3;
});
```

You can also disable re-rendering by passing `true` as the second argument, and that will also cancel all state watchers.

```typescript
// Cancel all state watchers
ref(viewState).commit((state) => {
  state.count++;
}, true);
```

### `snapshot`

Use `snapshot` to take a snapshot of the state. A snapshot is a copy of the state.

```typescript
const s = ref(viewState).snapshot();
```

### `emit`

Use `emit` to emit an event. This is useful when you want to communicate between components.

```typescript
ref(viewState).emit('event', 'data');
```

### `on`

Use `on` to listen to an event.

```typescript
ref(viewState).on('event', (data) => {
  console.log(data);
});
```

### `keep`

Use `keep` to persist the data between re-rendering.

```typescript
function View(state: State) {
  // child will be initialized only once
  const child = ref(state).keep(() => <div>Child</div>);
  return <div>{child}</div>;
}
```

### `lose`

Use `lose` to erase the persisted data.

```typescript
function View(state: State) {
  const child = ref(state).keep(() => <div>Child</div>, 'child');
  ref(state).lose('child');
  return <div>{child}</div>;
}
```
