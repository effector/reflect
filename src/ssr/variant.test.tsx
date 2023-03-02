import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { allSettled, createDomain, fork, restore } from 'effector';
import { Provider } from 'effector-react/ssr';
import React from 'react';

import { variant } from '../ssr';

test('matches first', async () => {
  const app = createDomain();
  const changeValue = app.createEvent<string>();
  const changeType = app.createEvent<'first' | 'second' | 'third'>();
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

  const scope = fork(app);

  const container = render(
    <Provider value={scope}>
      <Input testId="check" />
    </Provider>,
  );

  await userEvent.type(container.getByTestId('check'), 'ForExample');
  expect(scope.getState($value)).toBe('ForExample');

  const input = container.container.firstChild as HTMLInputElement;
  expect(input.className).toBe('first');

  await act(async () => {
    await allSettled(changeType, { scope, params: 'second' });
  });

  expect(scope.getState($value)).toBe('ForExample');
  const updatedInput = container.container.firstChild as HTMLInputElement;
  expect(updatedInput.className).toBe('second');
});

test.todo('rerenders only once after change source');
test.todo('rerenders only once on type');
test.todo('renders default if no match');
test.todo('works on nested matches');

test('hooks works once on mount', async () => {
  const app = createDomain();
  const changeType = app.createEvent<'first' | 'second' | 'third'>();
  const $type = restore(changeType, 'first');
  const mounted = app.createEvent();
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

  const scope = fork(app);

  expect(fn).not.toBeCalled();

  render(
    <Provider value={scope}>
      <Input testId="check" />
    </Provider>,
  );
  expect(fn).toBeCalledTimes(1);

  await act(async () => {
    await allSettled(changeType, { scope, params: 'second' });
  });
  expect(fn).toBeCalledTimes(1);
});

test('hooks works once on unmount', async () => {
  const app = createDomain();
  const changeType = app.createEvent<'first' | 'second' | 'third'>();
  const $type = restore(changeType, 'first');
  const unmounted = app.createEvent();
  const fn = jest.fn();
  unmounted.watch(fn);
  const setVisible = app.createEvent<boolean>();
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

  const scope = fork(app);

  expect(fn).not.toBeCalled();

  render(
    <Provider value={scope}>
      <Component />
    </Provider>,
  );
  expect(fn).not.toBeCalled();

  await act(async () => {
    await allSettled(setVisible, { scope, params: false });
  });
  expect(fn).toBeCalledTimes(1);
});

test('hooks works on remount', async () => {
  const app = createDomain();
  const changeType = app.createEvent<'first' | 'second' | 'third'>();
  const $type = restore(changeType, 'first');

  const unmounted = app.createEvent();
  const onUnmount = jest.fn();
  unmounted.watch(onUnmount);
  const mounted = app.createEvent();
  const onMount = jest.fn();
  mounted.watch(onMount);

  const setVisible = app.createEvent<boolean>();
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

  const scope = fork(app);

  render(
    <Provider value={scope}>
      <Component />
    </Provider>,
  );
  expect(onMount).toBeCalledTimes(1);
  expect(onUnmount).not.toBeCalled();

  await act(async () => {
    await allSettled(setVisible, { scope, params: false });
  });
  expect(onUnmount).toBeCalledTimes(1);

  await act(async () => {
    await allSettled(setVisible, { scope, params: true });
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
