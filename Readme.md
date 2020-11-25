# Effector-reflect

☄️ Render react-components by effector stores.

## Install

### Npm

```sh
npm install effector-reflect
```

### Yarn

```sh
yarn add effector-reflect
```

## Motivation

### Old case

```ts
import React, { FC, ChangeEvent, useCallback } from 'react';
import { createEvent, restore } from 'effector';
import { useStore } from 'effector-react';

// Base components
type InputProps = {
  value: string;
  onChange: ChangeEvent<HTMLInputElement>;
};

const Input: FC<InputProps> = ({ value, onChange }) => {
  return <input value={value} onChange={onChange} />;
};

// Model
const changeName = createEvent<string>();
const $name = restore(changeName, '');

// Component
export const Name: FC = () => {
  const value = useStore($name);
  const changed = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => changeName(event.target.value),
    [],
  );

  return <Input value={value} onChange={changed} />;
};
```

### New case

```ts
// New case
import React, { FC, ChangeEvent } from 'react';
import { createEvent, restore } from 'effector';
import { reflect } from 'effector-reflect';

// Base components
type InputProps = {
  value: string;
  onChange: ChangeEvent<HTMLInputElement>;
};

const Input: FC<InputProps> = ({ value, onChange }) => {
  return <input value={value} onChange={onChange} />;
};

// Model
const changeName = createEvent<string>();
const $name = restore(changeName, '');

// Component
export const Name = reflect({
  view: Input,
  bind: { value: $name, onChange: (event) => changeName(event.target.value) },
});
```

## Reflect

Method for bind stores to a view.

```ts
// ./user.tsx
import React, { FC, useCallback, ChangeEvent } from 'react';
import { createEvent, restore } from 'effector';
import { reflect } from 'effector-reflect';

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

## Create reflect

Method for creating reflect a view. So you can create a UI kit by views and use a view with a store already.

```ts
// ./ui.tsx
import React, { FC, useCallback, ChangeEvent, MouseEvent } from 'react';
import { createReflect } from 'effector-reflect';

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

```ts
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

## Roadmap

- [ ] Add ssr
