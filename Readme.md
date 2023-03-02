# @effector/reflect

☄️ Attach effector stores to react components without hooks.

## Install

```sh
npm install @effector/reflect
# or
pnpm add @effector/reflect
```

## Motivation

What's the point of reflect?

It's the API design that, using the classic HOC pattern, allows you to write React components with Effector in an efficient and composable way.

### The usual way

Let's take a look at typical example of hooks usage:

```tsx
import { Input, Button, FormContainer, ErrorMessage } from "ui-lib"
import { useUnit } from "effector-react"

import * as model from "./form-model"

export function UserForm() {
  const {
    formValid,
    name,
    nameChanged,
    lastName,
    lastNameChanged,
    formSubmitted,
    error,
  } = useUnit({
    formValid: model.$formValid,
    name: model.$name,
    nameChanged: model.nameChanged,
    lastName: model.lastNameChanged,
    formSubmitted: model.formSubmitted,
    error: model.$error,
  })

  return (
    <FormContainer>
      <Input value={name} onChange={nameChanged} />
      <Input value={lastName} onChange={lastNameChanged} />
      {error && (<ErrorMessage text={error} />)}
      <Button type="submit" disabled={!formValid} onClick={formSubmitted} />
    </FormContainer>
  )
}
```

Here we have a fairly typical structure: the user form is represented by one big component tree, which takes all its subscriptions at the top level, and then the data is provided down the tree via props.

As you can see, the disadvantage of this approach is that any update to `$formValid` or `$name` will cause a full rendering of that component tree, even though each of those stores is only needed for one specific input or submit button at the bottom. This means that React will have to do more work on diffing to create the update in the DOM.

This can be fixed by moving the subscriptions further down the component tree by creating separate components, as done here

```tsx
function UserFormSubmitButton() {
  const {
    formValid,
    formSubmitted,
  } = useUnit({
    formValid: model.$formValid,
    formSubmitted: model.formSubmitted
  })

  return <Button type="submit" disabled={!formValid} onClick={formSubmitted} />
}
```

However, it's very often not very convenient to create a separate component with a separate subscription, because it produces more code that's a little harder to read and modify. Since it's essentially mapping store values to props - it's easier to do it just once at the very top.

Also, in most cases it's not a big problem, since React is pretty fast at diffing. But as the application gets bigger, there are more and more of these small performance problems in the code, and more and more of them combine into bigger performance issues.

### Reflect's way

That's where reflect comes to the rescue:

```tsx
import { reflect, variant } from "@effector/reflect"

export function UserForm() {
  return (
    <FormContainer>
      <Name />
      <LastName />
      <Error />
      <SubmitButton />
    </FormContainer>
  )
}

const Name = reflect({
  view: Input,
  bind: {
    value: model.$name,
    onChange: model.nameChanged
  }
})

const LastName = reflect({
  view: Input,
  bind: {
    value: model.$lastName,
    onChange: model.lastNameChanged
  }
})

const Error = variant({
  if: model.$error,
  then: reflect({
    view: ErrorMessage,
    bind: {
      text: model.$error,
    }
  })
})

const SubmitButton = reflect({
  view: Button,
  bind: {
    type: "submit", // plain values are allowed too!
    disabled: model.$formValid.map(valid => !valid),
    onClick: model.formSubmitted
  }
})
```

Here we've separated this component into small parts, which were created in a convenient way using `reflect` operators, which is a very simple description of the `props -> values` mapping, which is easier to read and modify.

Also, these components are combined into one pure `UserForm` component, which handles only the component structure and has no subscriptions to external sources.

In this way, we have achieved a kind of _"fine-grained"_ subscriptions - each component listens only to the relevant stores, and each update will cause only small individual parts of the component tree to be rendered.

React handles such updates much better than updating one big tree, because it requires it to check and compare many more things than is necessary in this case. You can learn more about React's rendering behavior [from this awesome article](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)

With `@effector/reflect`, our `$formValid` update will only cause the SubmitButton to be re-rendered, and for all other parts of our <UserForm /> there will literally be **zero** React work.

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
    placeholder: "Name",
    onChange: changeName.prepend(inputChanged),
  },
});

const Age = reflect({
  view: Input,
  bind: {
    value: $age,
    placeholder: "Age",
    onChange: changeAge.prepend(parseInt).prepend(inputChanged),
  },
});

export const User: FC = () => {
  return (
    <div>
      <Name />
      <Age />
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

#### `variant` shorthand for boolean cases

When you have only two cases, you can use `variant` shorthand.

```tsx
const Component = variant({
  if: $isError,
  then: ErrorComponent,
  else: SuccessComponent,
});
```

This is equivalent to

```tsx
const Component = variant({
  source: $isError.map((isError) => (isError ? 'error' : 'success')),
  cases: {
    error: ErrorComponent,
    success: SuccessComponent,
  },
});
```

This shorthand supports `bind` and `hooks` fields as well.

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
  getKey: (item: Item) => React.Key // optional, will use index by default
});
```

Method creates component, which renders list of `view` components based on items in array in `source` store, each item content's will be mapped to View props by `mapItem` rules. On changes to `source` store, rendered list will be updated too

#### Arguments

1. `source` — Store of `Item[]` value.
1. `view` — A react component, will be used to render list items
1. `mapItem` — Object `{ propName: (Item, index) => propValue }` that defines rules, by which every `Item` will be mapped to props of each rendered list item.
1. `bind` — Optional object of stores, events, and static values that will be bound as props to every list item.
1. `hooks` — Optional object `{ mounted, unmounted }` to handle when any list item component is mounted or unmounted.
1. `getKey` - Optional function `(item: Item) => React.Key` to set key for every item in the list to help React with effecient rerenders. If not provided, index is used. See [`effector-react`](https://effector.dev/docs/api/effector-react/useList) docs for more details.

#### Returns

- A react component that renders a list of `view` components based on items of array in `source` store. Every `view` component props are bound to array item contents by the rules in `mapItem`, and to stores and events in `bind`, like with regular `reflect`

#### Example

```tsx
import React from 'react';
import { createStore, createEvent } from 'effector';
import { list } from '@effector/reflect';

const $color = createStore('red');

const $users = createStore([
  { id: 1, name: 'Yung' },
  { id: 2, name: 'Lean' },
  { id: 3, name: 'Kyoto' },
  { id: 4, name: 'Sesh' },
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
    color: $color,
  },
  mapItem: {
    id: (user) => user.id,
    name: (user) => user.name,
  },
  getKey: (user) => `${user.id}${user.name}`,
});

<List>
  <Items />
</List>;
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
  onClick: submit,
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


### SSR and tests via Fork API


Since [effector-react 22.5.0](https://github.com/effector/effector/releases/tag/effector-react%4022.5.0) it is no longer necessary to use `@effector/reflect/ssr` due to isomorphic nature of `effector-react` hooks after this release, you can just use `@effector/reflect` main imports.

Just add `Provider` from `effector-react` to your app root, and you are good to go.

For [SSR](https://effector.dev/docs/api/effector-react/useEvent) and `effector-react` before `2.5.0` release you will need to replace imports `@effector/reflect` -> `@effector/reflect/ssr`.

Also for this case you need to use `event.prepend(params => params.something)` instead `(params) => event(params.something)` in `bind` - this way `reflect` can detect effector's events and properly bind them to the current [scope](https://effector.dev/docs/api/effector/scope)

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
import { createEvent, restore, sample, Scope } from 'effector';
import { reflect } from '@effector/reflect';
import { Provider } from 'effector-react';

import { Input } from './ui';

// Model
export const appStarted = createEvent<{name: string}>()

const changeName = createEvent<string>();
const $name = restore(changeName, '');

sample({
  clock: appStarted,
  fn: ctx => ctx.name,
  target: changeName,
})

// Component
const Name = reflect({
  view: Input,
  bind: {
    value: $name,
    onChange: changeName.prepend((event) => event.target.value),
  },
});

export const App: FC<{ scope: Scope }> = ({ scope }) => {
  return (
    <Provider value={scope}>
      <Name />
    </Provider>
  );
};
```

```tsx
// ./server.tsx
import { fork, serialize, allSettled } from 'effector';

import { App, appStarted } from './app';

const render = async (reqCtx) => {
  const serverScope = fork();

  await allSettled(appStarted, {
    scope: serverScope,
    params: {
      name: reqCtx.cookies.name,
    }
  });

  const content = renderToString(<App scope={serverScope} />);
  const data = serialize(scope);

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

```tsx
// client.tsx
import { fork } from 'effector';
import { hydrateRoot } from 'react-dom/client'

import { App, appStarted } from './app';

const clientScope = fork({
  values: window.__initialState__
})

hydrateRoot(document.body, <App scope={clientScope} />)
```

## Release process

1. Check out the [draft release](https://github.com/effector/reflect/releases).
1. All PRs should have correct labels and useful titles. You can [review available labels here](https://github.com/effector/reflect/blob/master/.github/release-drafter.yml).
1. Update labels for PRs and titles, next [manually run the release drafter action](https://github.com/effector/reflect/actions/workflows/release-drafter.yml) to regenerate the draft release.
1. Review the new version and press "Publish"
1. If required check "Create discussion for this release"
