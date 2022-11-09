# Snabbful

Snabbful is a simple, fast, and flexible library for building user interfaces by using [Snabbdom](https://github.com/snabbdom/snabbdom).
We add a state management layer on top of Snabbdom, and we provide a simple API for building user interfaces.

[toc]

## Installation

```bash
npm install snabbful
```

## Usage

### State management

There's no need to use `useState` or `useReducer` hooks, you can change the state directly.

```typescript
import { ref } from 'snabbful';
import { h } from 'snabbdom';

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
```

The state inside or outside the component is transparent, so you can change the state directly.

```typescript
import { initComponent, ref } from 'snabbful';
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