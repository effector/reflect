import React, { FC, InputHTMLAttributes, ChangeEvent } from 'react';
import { createStore, createEvent, restore, createEffect } from 'effector';

import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { variant } from './index';

test('matches first', async () => {
  const changeValue = createEvent<string>();
  const changeType = createEvent<'first' | 'second' | 'third'>();
  const $value = restore(changeValue, '');
  const $type = restore(changeType, 'first');

  const Input = variant({
    source: $type,
    bind: { value: $value, onChange: changeValue },
    cases: {
      first: InputCustom,
      second: InputCustom2,
      third: InputCustom3,
    },
  });

  const container = render(<Input testId="check" />);

  await userEvent.type(container.getByTestId('check'), 'ForExample');
  expect($value.getState()).toBe('ForExample');

  const input = container.container.firstChild as HTMLInputElement;
  expect(input.className).toBe('first');

  act(() => {
    changeType('second');
  });

  expect($value.getState()).toBe('ForExample');
  const updatedInput = container.container.firstChild as HTMLInputElement;
  expect(updatedInput.className).toBe('second');
});

test.todo('rerenders only once after change source');
test.todo('rerenders only once on type');
test.todo('renders default if no match');
test.todo('works on nested matches');

function InputCustom(props: {
  value: string | number | string[];
  onChange(value: string): void;
  testId: string;
  placeholder?: string;
}) {
  return (
    <input
      className="first"
      data-testid={props.testId}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value)}
    />
  );
}

function InputCustom2(props: {
  value: string | number | string[];
  onChange(value: string): void;
  testId: string;
  placeholder?: string;
}) {
  return (
    <input
      className="second"
      data-testid={props.testId}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value)}
    />
  );
}

function InputCustom3(props: {
  value: string | number | string[];
  onChange(value: string): void;
  testId: string;
  placeholder?: string;
}) {
  return (
    <input
      className="third"
      data-testid={props.testId}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value)}
    />
  );
}
