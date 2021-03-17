# @effector/reflect

☄️ Attach effector stores to react components without hooks.

## Install

```sh
npm install @effector/reflect
# or
yarn add @effector/reflect
```

## Motivation

### UI library

Let's agree that we have an internal UI library with an input.

```tsx
// ./ui.ts
import React, { FC, ChangeEvent, useCallback } from 'react';

type InputProps = {
  value: string;
  onChange: ChangeEvent<HTMLInputElement>;
};

export const Input: FC<InputProps> = ({ value, onChange }) => {
  return <input value={value} onChange={onChange} />;
};
```

### Before

In common case, you need to use `useStore` and `useEvent` (especially for SSR) to use values and call events from React components.

```tsx
import React, { FC, ChangeEvent, useCallback } from 'react';
import { createEvent, restore } from 'effector';
import { useStore, useEvent } from 'effector-react';

import { Input } from './ui';

// Model
const changeName = createEvent<string>();
const $name = restore(changeName, '');

// Component
export const Name: FC = () => {
  const value = useStore($name);
  const nameChanged = useEvent(changeName);
  const changed = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => nameChanged(event.target.value),
    [],
  );

  return <Input value={value} onChange={changed} />;
};
```

### Now

Now you can create a new component and pass store and event as props without hooks boilerplate.

```tsx
import { createEvent, restore } from 'effector';
import { reflect } from '@effector/reflect';

import { Input } from './ui';

// Model
const changeName = createEvent<string>();
const $name = restore(changeName, '');

// Component
export const Name = reflect({
  view: Input,
  bind: { value: $name, onChange: (event) => changeName(event.target.value) },
});
```

## API

### Reflect

```tsx
const Component = reflect({
  view: SourceComponent,
  bind: Props,
  hooks: Hooks,
});
```

Static method to create a component bound to effector stores and events as stores.

#### Arguments

1. `view` — A react component that should be used to bind to
1. `bind` — Object of effector stores, events or any value
1. `hooks` — Optional object `{ mounted, unmounted }` to handle when component is mounted or unmounted.

#### Returns

- A react component with bound values from stores and events.

#### Example

```tsx
// ./user.tsx
import React, { FC, ChangeEvent } from 'react';
import { createEvent, restore } from 'effector';
import { reflect } from '@effector/reflect';

// Base components
type InputProps = {
  value: string;
  onChange: ChangeEvent<HTMLInputElement>;
  placeholder?: string;
};

const Input: FC<InputProps> = ({ value, onChange, placeholder }) => {
  return <input value={value} onChange={onChange} placeholder={placeholder} />;
};

// Model
const changeName = createEvent<string>();
const $name = restore(changeName, '');

const changeAge = createEvent<number>();
const $age = restore(changeAge, 0);

const inputChanged = (event: ChangeEvent<HTMLInputElement>) => {
  return event.currentTarget.value;
};

// Components
const Name = reflect({
  view: Input,
  bind: {
    value: $name,
    onChange: changeName.prepend(inputChanged),
  },
});

const Age = reflect({
  view: Input,
  bind: {
    value: $age,
    onChange: changeAge.prepend(parseInt).prepend(inputChanged),
  },
});

export const User: FC = () => {
  return (
    <div>
      <Name placeholder="Name" />
      <Age placeholder="Age" />
    </div>
  );
};
```

### Variant

```tsx
const Components = variant({
  source: $typeSelector,
  bind: Props,
  cases: ComponentVariants,
  default: DefaultVariant,
  hooks: Hooks,
});
```

Method allows to change component based on value in `$typeSelector`. Optional `bind` allow to pass props bound to stores or events.

#### Arguments

1. `source` — Store of `string` value. Used to select variant of component to render and bound props to.
1. `bind` — Optional object of stores, events, and static values that would be bound as props.
1. `cases` — Object of components, key will be used to match
1. `default` — Optional component, that would be used if no matched in `cases`
1. `hooks` — Optional object `{ mounted, unmounted }` to handle when component is mounted or unmounted.

#### Example

When `Field` is rendered it checks for `$fieldType` value, selects the appropriate component from `cases` and bound props to it.

```tsx
import React from 'react';
import { createStore, createEvent } from 'effector';
import { variant } from '@effector/reflect';
import { TextInput, Range, DateSelector } from '@org/ui-lib';

const $fieldType = createStore<'date' | 'number' | 'string'>('string');

const valueChanged = createEvent<string>();
const $value = createStore('');

const Field = variant({
  source: $fieldType,
  bind: { onChange: valueChanged, value: $value },
  cases: {
    date: DateSelector,
    number: Range,
  },
  default: TextInput,
});
```

### List

```tsx
const Items: React.FC = list({
  view: React.FC<Props>,
  source: Store<Item[]>,
  bind: { 
    // regular reflect's bind, for list item view
  },
  hooks: {
    // regular reflect's hooks, for list item view
  },
  mapItem: {
    propName: (item: Item, index: number) => propValue, // maps array store item to View props
  },
  getKey: (item: Item, index: number) => React.Key // optional, will use index by default
});
```

Method creates component, which renders list of `view` components based on items in array in `source` store, each item content's will be mapped to View props by `mapItem` rules. On changes to `source` store, rendered list will be updated too

#### Arguments

1. `source` — Store of `Item[]` value. 
1. `view` — A react component, will be used to render list items
1. `mapItem` — Object `{ propName: (Item, index) => propValue }` that defines rules, by which every `Item` will be mapped to props of each rendered list item.
1. `bind` — Optional object of stores, events, and static values that will be bound as props to every list item.
1. `hooks` — Optional object `{ mounted, unmounted }` to handle when any list item component is mounted or unmounted.
1. `getKey` - Optional function `(item: Item, index: number) => React.Key` to set key for every item in the list to help React with effecient rerenders. If not provided, index is used


#### Returns

- A react component that renders a list of `view` components based on items of array in `source` store. Every `view` component props are bound to array item contents by the rules in `mapItem`, and to stores and events in `bind`, like with regular `reflect`

#### Example

```tsx
import React from 'react';
import { createStore, createEvent } from 'effector';
import { list } from '@effector/reflect';

const $color = createStore('red');

const $users = createStore([
  {id: 1, name: 'Yung'},
  {id: 2, name: 'Lean'},
  {id: 3, name: 'Kyoto'},
  {id: 4, name: 'Sesh'},
]);

const Item = ({ id, name, color }) => {
  return (
    <li style={{ color }}>
      {id} - {name}
    </li>
  );
};

const Items = list({
  view: Item,
  source: $users,
  bind: {
    color: $color
  },
  mapItem: {
    id: (user) => user.id,
    name: (user) => user.name
  },
  getKey: (user) => `${user.id}${user.name}`
});

<List>
  <Items />
</List>
```

### Create reflect

Method for creating reflect a view. So you can create a UI kit by views and use a view with a store already.

```tsx
// ./ui.tsx
import React, { FC, useCallback, ChangeEvent, MouseEvent } from 'react';
import { createReflect } from '@effector/reflect';

// Input
type InputProps = {
  value: string;
  onChange: ChangeEvent<HTMLInputElement>;
};

const Input: FC<InputProps> = ({ value, onChange }) => {
  return <input value={value} onChange={onChange} />;
};

export const reflectInput = createReflect(Input);

// Button
type ButtonProps = {
  onClick: MouseEvent<HTMLButtonElement>;
  title?: string;
};

const Button: FC<ButtonProps> = ({ onClick, children, title }) => {
  return (
    <button onClick={onClick} title={title}>
      {children}
    </button>
  );
};

export const reflectButton = createReflect(Button);
```

```tsx
// ./user.tsx
import React, { FC } from 'react';
import { createEvent, restore } from 'effector';

import { reflectInput, reflectButton } from './ui';

// Model
const changeName = createEvent<string>();
const $name = restore(changeName, '');

const changeAge = createEvent<number>();
const $age = restore(changeAge, 0);

const submit = createEvent<void>();

// Components
const Name = reflectInput({
  value: $name,
  onChange: (event) => changeName(event.target.value),
});

const Age = reflectInput({
  value: $age,
  onChange: (event) => changeAge(parsetInt(event.target.value)),
});

const Submit = reflectButton({
  onClick: () => submit(),
});

export const User: FC = () => {
  return (
    <div>
      <Name />
      <Age />
      <Submit title="Save left">Save left</Submit>
      <Submit title="Save right">Save right</Submit>
    </div>
  );
};
```

### SSR

For SSR need to replace imports `@effector/reflect` -> `@effector/reflect/ssr`.
Also use `event.prepend(params => params)` instead `(params) => event(params)`.

```tsx
// ./ui.tsx
import React, { FC, useCallback, ChangeEvent, MouseEvent } from 'react';

// Input
type InputProps = {
  value: string;
  onChange: ChangeEvent<HTMLInputElement>;
};

const Input: FC<InputProps> = ({ value, onChange }) => {
  return <input value={value} onChange={onChange} />;
};
```

```tsx
// ./app.tsx
import React, { FC } from 'react';
import { createEvent, restore, Fork, createDomain } from 'effector';
import { reflect } from '@effector/reflect/ssr';
import { Provider } from 'effector-react/ssr';

import { Input } from './ui';

// Model
export const app = createDomain();

export const changeName = app.createEvent<string>();
const $name = restore(changeName, '');

// Component
const Name = reflect({
  view: Input,
  bind: {
    value: $name,
    onChange: changeName.prepend((event) => event.target.value),
  },
});

export const App: FC<{ data: Fork }> = ({ data }) => {
  return (
    <Provider value={data}>
      <Name />
    </Provider>
  );
};
```

```tsx
// ./server.ts
import { fork, serialize, allSettled } from 'effector/fork';

import { App, app, changeName } from './app';

const render = async () => {
  const scope = fork(app);

  await allSettled(changeName, { scope, params: 'Bob' });

  const data = serialize(scope);

  const content = renderToString(<App data={scope} />);

  return `
    <body>
      ${content}
      <script>
        window.__initialState__ = ${JSON.stringify(data)};
      </script>
    </body>
  `;
};
```

### Hooks

Hooks is an object passed to `variant()` or `match()` with properties `mounted` and `unmounted` all optional.

#### Example

```tsx
import { createStore, createEvent } from 'effector';
import { reflect, variant } from '@effector/reflect';
import { TextInput, Range } from '@org/my-ui';

const $type = createStore<'text' | 'range'>('text');
const $value = createStore('');
const valueChange = createEvent<string>();
const rangeMounted = createEvent();
const fieldMounted = createEvent();

const RangePrimary = reflect({
  view: Range,
  bind: { style: 'primary' },
  hooks: { mounted: rangeMounted },
});

const Field = variant({
  source: $type,
  bind: { value: $value, onChange: valueChange },
  cases: {
    text: TextInput,
    range: RangePrimary,
  },
  hooks: { mounted: fieldMounted },
});
```

When `Field` is mounted, `fieldMounted` and `rangeMounted` would be called.

## Roadmap

- [] Auto moving test from ./src to ./dist-test
