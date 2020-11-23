import React, { FC, InputHTMLAttributes } from 'react';
import { createStore, createEvent, restore } from 'effector';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { reflect } from './index';

// Example1 (InputCustom)
const InputCustom: FC<{
  value: string | number | string[];
  onChange(value: string): void;
  testId: string;
  placeholder?: string;
}> = (props) => {
  return (
    <input
      data-testid={props.testId}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value)}
    />
  );
};

test('InputCustom', async () => {
  const change = createEvent<string>();
  const $name = restore(change, '');

  const Name = reflect({
    view: InputCustom,
    bind: { value: $name, onChange: change },
  });

  const container = render(<Name testId="name" />);

  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  expect($name.getState()).toBe('Bob');
});

test('InputCustom [replace value]', async () => {
  const change = createEvent<string>();
  const $name = createStore<string>('');

  const Name = reflect({
    view: InputCustom,
    bind: { name: $name, onChange: change },
  });

  const container = render(<Name testId="name" value="Alise" />);

  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  const inputName = container.container.firstChild as HTMLInputElement;
  expect(inputName.value).toBe('Alise');
  expect($name.getState()).toBe('');
});

// Example 2 (InputBase)
const InputBase: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input {...props} />;
};

test('InputBase', async () => {
  const changeName = createEvent<string>();
  const $name = restore(changeName, '');

  const Name = reflect({
    view: InputBase,
    bind: {
      value: $name,
      onChange: (event) => changeName(event.currentTarget.value),
    },
  });

  const changeAge = createEvent<number>();
  const $age = restore(changeAge, 0);
  const Age = reflect({
    view: InputBase,
    bind: {
      value: $age,
      onChange: (event) => {
        changeAge(Number.parseInt(event.currentTarget.value, 10));
      },
    },
  });

  const container = render(
    <>
      <Name data-testid="name" />
      <Age data-testid="age" />
    </>,
  );

  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  expect($name.getState()).toBe('Bob');

  expect($age.getState()).toBe(0);
  await userEvent.type(container.getByTestId('age'), '25');
  expect($age.getState()).toBe(25);
});
