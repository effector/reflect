# Effector-reflect

☄️ Render react components by effector stores. So you shouldn't use hooks, for get values of stores or map ui event.

## Install

### Npm

```sh
npm install effector-reflect
```

### Yarn

```sh
yarn add effector-reflect
```

## Reflect

Method for bind stores to view.

```ts
// ./user.tsx
import React, { FC, useCallback, ChangeEvent } from 'react';
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

const changeAge = createEvent<number>();
const $age = restore(changeAge, 0);

// Components
const Name = reflect({
  view: Input,
  bind: {
    value: $name,
    onChange: (event) => changeName(event.target.value),
  },
});

const Age = reflect({
  view: Input,
  bind: {
    value: $name,
    onChange: (event) => changeAge(parsetInt(event.target.value)),
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

## Create reflect

Method for create reflect by view. So you can create ui kit by views and use view with store already.

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
};

const Button: FC<ButtonProps> = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
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
  value: $name,
  onChange: (event) => changeAge(parsetInt(event.target.value)),
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
