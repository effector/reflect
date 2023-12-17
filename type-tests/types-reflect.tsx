/* eslint-disable @typescript-eslint/ban-ts-comment */
import { reflect } from '@effector/reflect';
import { createEvent, createStore } from 'effector';
import React from 'react';
import { expectType } from 'tsd';

// basic reflect
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
      color: 'red',
    },
  });

  expectType<React.FC>(ReflectedInput);
}

// reflect allows infer handlers for event.prepend
{
  const Input: React.FC<{
    value: string;
    onChange: (event: { target: { value: string } }) => void;
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      // here typescript should infer types correctly
      onChange: changed.prepend((e) => {
        expectType<string>(e.target.value);
        return e.target.value;
      }),
    },
  });

  expectType<React.FC>(ReflectedInput);
}

// reflect should not allow wrong props
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
      // @ts-expect-error
      color: 'blue',
    },
  });

  expectType<React.FC>(ReflectedInput);
}

// reflect should allow not-to pass required props - as they can be added later in react
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
    },
  });

  const App: React.FC = () => {
    // missing prop must still be required in react
    // @ts-expect-error
    return <ReflectedInput />;
  };

  const AppFixed: React.FC = () => {
    return <ReflectedInput color="red" />;
  };
  expectType<React.FC>(App);
  expectType<React.FC>(AppFixed);
}

// reflect should allow to pass EventCallable<void> as click event handler
{
  const Button: React.FC<{
    onClick: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
  }> = () => null;

  const reactOnClick = createEvent();

  const ReflectedButton = reflect({
    view: Button,
    bind: {
      onClick: reactOnClick,
    },
  });

  expectType<React.FC>(ReflectedButton);
}

// reflect should not allow binding ref
{
  const Text = React.forwardRef(
    (_: { value: string }, ref: React.ForwardedRef<HTMLSpanElement>) => null,
  );

  const ReflectedText = reflect({
    view: Text,
    bind: {
      // @ts-expect-error
      ref: React.createRef<HTMLSpanElement>(),
    },
  });

  expectType<React.VFC>(ReflectedText);
}

// reflect should pass ref through
{
  const $value = createStore<string>('');
  const Text = React.forwardRef(
    (_: { value: string }, ref: React.ForwardedRef<HTMLSpanElement>) => null,
  );

  const ReflectedText = reflect({
    view: Text,
    bind: { value: $value },
  });

  const App: React.FC = () => {
    const ref = React.useRef(null);

    return <ReflectedText ref={ref} />;
  };

  expectType<React.FC>(App);
}

// reflect should allow to pass any callback
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: (e) => {
        expectType<string>(e);
        changed(e);
      },
    },
  });

  expectType<React.FC>(ReflectedInput);
}

// should support useUnit configuration
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: (e) => {
        expectType<string>(e);
        changed(e);
      },
    },
    useUnitConfig: {
      forceScope: true,
    },
  });
}

// should not support invalud useUnit configuration
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: (e) => {
        expectType<string>(e);
        changed(e);
      },
    },
    useUnitConfig: {
      // @ts-expect-error
      forseScope: true,
    },
  });
}
