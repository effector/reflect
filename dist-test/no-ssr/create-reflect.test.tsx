import { createReflect } from '../../dist/reflect';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createEffect, createEvent, createStore, fork, restore } from 'effector';
import React, { FC, InputHTMLAttributes } from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'effector-react';

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

const inputCustom = createReflect(InputCustom);

test('InputCustom', async () => {
  const change = createEvent<string>();
  const $name = restore(change, '');

  const Name = inputCustom({ value: $name, onChange: change });

  const container = render(<Name testId="name" />);

  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  expect($name.getState()).toBe('Bob');

  const inputName = container.container.firstChild as HTMLInputElement;
  expect(inputName.value).toBe('Bob');
});

test('InputCustom [replace value]', async () => {
  const change = createEvent<string>();
  const $name = createStore<string>('');

  $name.on(change, (_, next) => next);

  const Name = inputCustom({ name: $name, onChange: change });

  const container = render(<Name testId="name" value="Alise" />);

  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  expect($name.getState()).toBe('Aliseb');

  const inputName = container.container.firstChild as HTMLInputElement;
  expect(inputName.value).toBe('Alise');
});

// Example 2 (InputBase)
const InputBase: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input {...props} />;
};

const inputBase = createReflect(InputBase);

test('InputBase', async () => {
  const changeName = createEvent<string>();
  const $name = restore(changeName, '');

  const Name = inputBase({
    value: $name,
    onChange: (event) => changeName(event.currentTarget.value),
  });

  const changeAge = createEvent<number>();
  const $age = restore(changeAge, 0);
  const Age = inputBase({
    value: $age,
    onChange: (event) => {
      changeAge(Number.parseInt(event.currentTarget.value, 10));
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

  const inputName = container.getByTestId('name') as HTMLInputElement;
  expect(inputName.value).toBe('Bob');

  const inputAge = container.getByTestId('age') as HTMLInputElement;
  expect(inputAge.value).toBe('25');
});

describe('hooks', () => {
  describe('mounted', () => {
    test('callback', () => {
      const changeName = createEvent<string>();
      const $name = restore(changeName, '');

      const mounted = jest.fn(() => {});

      const Name = inputBase(
        {
          value: $name,
          onChange: changeName.prepend((event) => event.currentTarget.value),
        },
        { hooks: { mounted } },
      );

      render(<Name data-testid="name" />);

      expect(mounted.mock.calls.length).toBe(1);
    });

    test('event', () => {
      const changeName = createEvent<string>();
      const $name = restore(changeName, '');
      const mounted = createEvent<void>();

      const fn = jest.fn(() => {});

      mounted.watch(fn);

      const Name = inputBase(
        {
          value: $name,
          onChange: changeName.prepend((event) => event.currentTarget.value),
        },
        { hooks: { mounted } },
      );

      render(<Name data-testid="name" />);

      expect(fn.mock.calls.length).toBe(1);
    });
  });

  describe('unmounted', () => {
    const changeVisible = createEffect<boolean, void>({ handler: () => {} });
    const $visible = restore(
      changeVisible.finally.map(({ params }) => params),
      true,
    );

    const Branch = createReflect<{ visible: boolean }>(({ visible, children }) =>
      visible ? <>{children}</> : null,
    )({
      visible: $visible,
    });

    beforeEach(() => {
      act(() => {
        changeVisible(true);
      });
    });

    test('callback', () => {
      const changeName = createEvent<string>();
      const $name = restore(changeName, '');

      const unmounted = jest.fn(() => {});

      const Name = inputBase(
        {
          value: $name,
          onChange: changeName.prepend((event) => event.currentTarget.value),
        },
        { hooks: { unmounted } },
      );

      render(<Name data-testid="name" />, { wrapper: Branch });

      act(() => {
        changeVisible(false);
      });

      expect(unmounted.mock.calls.length).toBe(1);
    });

    test('event', () => {
      const changeName = createEvent<string>();
      const $name = restore(changeName, '');

      const unmounted = createEvent<void>();
      const fn = jest.fn(() => {});

      unmounted.watch(fn);

      const Name = inputBase(
        {
          value: $name,
          onChange: changeName.prepend((event) => event.currentTarget.value),
        },
        { hooks: { unmounted } },
      );

      render(<Name data-testid="name" />, { wrapper: Branch });

      act(() => {
        changeVisible(false);
      });

      expect(fn.mock.calls.length).toBe(1);
    });
  });
});


describe('forceScope', () => {
  test('without provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    const Input = inputBase({}, { forceScope: true });

    expect(() => render(<Input />)).toThrowError(/no scope found/i);

    spy.mockRestore();
  });

  test('with provider', () => {
    const scope = fork();

    const Input = inputBase({}, { forceScope: true });

    const container = render(
      <Provider value={scope}>
        <Input data-testid="name" />
      </Provider>,
    );

    expect(container.getByTestId('name')).toBeDefined();
  });
});