import React from 'react';
import { createEvent, restore } from 'effector';

import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { variant } from '../index';

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

test('hooks works once on mount', async () => {
  const changeType = createEvent<'first' | 'second' | 'third'>();
  const $type = restore(changeType, 'first');
  const mounted = createEvent();
  const fn = jest.fn();
  mounted.watch(fn);

  const Input = variant({
    source: $type,
    bind: { value: '', onChange: Function },
    hooks: { mounted },
    cases: {
      first: InputCustom,
      second: InputCustom2,
      third: InputCustom3,
    },
  });

  expect(fn).not.toBeCalled();

  render(<Input testId="check" />);
  expect(fn).toBeCalledTimes(1);

  act(() => {
    changeType('second');
  });
  expect(fn).toBeCalledTimes(1);
});

test('hooks works once on unmount', async () => {
  const changeType = createEvent<'first' | 'second' | 'third'>();
  const $type = restore(changeType, 'first');
  const unmounted = createEvent();
  const fn = jest.fn();
  unmounted.watch(fn);
  const setVisible = createEvent<boolean>();
  const $visible = restore(setVisible, true);

  const Input = variant({
    source: $type,
    bind: { value: '', onChange: Function },
    hooks: { unmounted },
    cases: {
      first: InputCustom,
      second: InputCustom2,
      third: InputCustom3,
    },
  });

  const Component = variant({
    source: $visible.map(String),
    cases: {
      true: Input,
    },
  });

  expect(fn).not.toBeCalled();

  render(<Component />);
  expect(fn).not.toBeCalled();

  act(() => {
    setVisible(false);
  });
  expect(fn).toBeCalledTimes(1);
});

test('hooks works on remount', async () => {
  const changeType = createEvent<'first' | 'second' | 'third'>();
  const $type = restore(changeType, 'first');

  const unmounted = createEvent();
  const onUnmount = jest.fn();
  unmounted.watch(onUnmount);
  const mounted = createEvent();
  const onMount = jest.fn();
  mounted.watch(onMount);

  const setVisible = createEvent<boolean>();
  const $visible = restore(setVisible, true);

  const Input = variant({
    source: $type,
    bind: { value: '', onChange: Function },
    hooks: { unmounted, mounted },
    cases: {
      first: InputCustom,
      second: InputCustom2,
      third: InputCustom3,
    },
  });

  const Component = variant({
    source: $visible.map(String),
    cases: {
      true: Input,
    },
  });

  expect(onMount).not.toBeCalled();
  expect(onUnmount).not.toBeCalled();

  render(<Component />);
  expect(onMount).toBeCalledTimes(1);
  expect(onUnmount).not.toBeCalled();

  act(() => {
    setVisible(false);
  });
  expect(onUnmount).toBeCalledTimes(1);

  act(() => {
    setVisible(true);
  });
  expect(onMount).toBeCalledTimes(2);
  expect(onUnmount).toBeCalledTimes(1);
});

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
