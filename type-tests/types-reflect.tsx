/* eslint-disable @typescript-eslint/ban-ts-comment */
import { reflect } from '@effector/reflect';
import { Button } from '@mantine/core';
import { createEvent, createStore } from 'effector';
import React, {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  FC,
  LabelHTMLAttributes,
  PropsWithChildren,
  ReactNode,
} from 'react';
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

// reflect should not allow wrong props in final types
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
    return (
      <ReflectedInput
        // @ts-expect-error
        color="blue"
      />
    );
  };
  expectType<React.FC>(App);
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

// reflect should make "binded" props optional - so it is allowed to overwrite them in react anyway
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
    return <ReflectedInput value="kek" color="red" />;
  };

  const AppFixed: React.FC = () => {
    return <ReflectedInput color="red" />;
  };
  expectType<React.FC>(App);
  expectType<React.FC>(AppFixed);
}

// reflect should not allow to override "binded" props with wrong types
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

  const App: React.FC = () => {
    return (
      <ReflectedInput
        // @ts-expect-error
        color="blue"
      />
    );
  };
  expectType<React.FC>(App);
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

// reflect should allow passing Event<void> as callback to optional event handlers
{
  const Button: React.FC<{
    onOptional?: React.EventHandler<React.MouseEvent<HTMLButtonElement>>;
    onNull: React.MouseEventHandler<HTMLButtonElement> | null;
  }> = () => null;

  const event = createEvent<void>();

  const ReflectedButton = reflect({
    view: Button,
    bind: {
      onOptional: event,
      onNull: event,
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

  expectType<React.FC>(ReflectedText);
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

// should allow store with a function as a callback value
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const $changed = createStore<(newValue: string) => void>(() => {});

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: $changed,
    },
  });

  expectType<React.FC>(ReflectedInput);
}

function localize<T extends 'b'>(value: T): { lol: boolean };
function localize<T extends 'a'>(value: T): { kek: boolean };
function localize(value: string): unknown {
  return value;
}

// should allow store with generics
{
  const Input: React.FC<{
    value: string;
    onChange: typeof localize;
  }> = () => null;
  const $changed = createStore<typeof localize>(localize);

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: $changed,
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

// reflect fits ComponentType
{
  const Input = (props: PropsWithChildren<{ value: string }>) => null;

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
    },
  });

  const Test: ComponentType<{ value: string; children: ReactNode }> = Input;
}

// reflect supports mounted as EventCallable<void>
{
  type Props = { loading: boolean };

  const mounted = createEvent();
  const unmounted = createEvent();

  const Foo: FC<Props> = (props) => <></>;

  const $loading = createStore(true);

  const Bar = reflect({
    view: Foo,
    bind: {
      loading: $loading,
    },
    hooks: { mounted, unmounted },
  });
}

// reflect supports mounted as EventCallable<Props>
{
  type Props = { loading: boolean };

  const mounted = createEvent<Props>();
  const unmounted = createEvent<Props>();

  const Foo: FC<Props> = (props) => <></>;

  const $loading = createStore(true);

  const Bar = reflect({
    view: Foo,
    bind: {
      loading: $loading,
    },
    hooks: { mounted, unmounted },
  });
}

// should error if mounted event doesn't satisfy component props
{
  const mounted = createEvent<{ foo: string }>();
  const unmounted = createEvent<{ foo: string }>();

  const Foo: FC<{ bar: number }> = () => null;

  const Bar = reflect({
    view: Foo,
    // @ts-expect-error
    hooks: { mounted, unmounted },
  });
}

// reflect supports partial match of mounted event and component props
{
  const mounted = createEvent<{ foo: string }>();
  const unmounted = createEvent<{ foo: string }>();

  const Foo: FC<{ foo: string; bar: number }> = () => null;

  const Bar = reflect({
    view: Foo,
    bind: {
      foo: 'foo',
      bar: 42,
    },
    hooks: { mounted, unmounted },
  });
}

// reflect supports partial match of mounted callback and component props
{
  const mounted = (args: { foo: string }) => {};
  const unmounted = (args: { foo: string }) => {};

  const Foo: FC<{ foo: string; bar: number }> = () => null;

  const Bar = reflect({
    view: Foo,
    bind: {
      foo: 'foo',
      bar: 42,
    },
    hooks: { mounted, unmounted },
  });
}

// Edge-case: Mantine Button weird polymorphic factory
{
  const ReflectedManitneButton = reflect({
    view: Button<'button'>,
    bind: {
      children: 'foo',
      size: 'md',
      onClick: (e) => {
        expectType<number>(e.clientX);
      },
    },
  });

  const ReflectedManitneButtonBad = reflect({
    view: Button<'button'>,
    bind: {
      children: 'foo',
      // @ts-expect-error
      size: 42,
      onClick: (e) => {
        expectType<number>(e.clientX);
      },
    },
  });

  <ReflectedManitneButton
    component="button"
    onClick={(e) => {
      expectType<number>(e.clientX);
    }}
  />;
}

// Edge-case (BROKEN): Mantine Button weird polymorphic factory
// without explicit type argument
//
// This test is failing - it is left here for future reference, in case if there is a way to fix it
// If you use a Mantine polymorphic components or anything similiar - check test above for a currently working solution
{
  const ReflectedManitneButton = reflect({
    view: Button,
    bind: {
      children: 'foo',
      // @ts-expect-error
      onClick: (e) => {
        expectType<number>(e.clientX);
      },
    },
  });

  <ReflectedManitneButton
    // @ts-expect-error
    component="button"
    // @ts-expect-error
    onClick={(e) => {
      expectType<number>(e.clientX);
    }}
  />;
}

// edge-case: polymorphic props
{
  interface CommonProps {
    inline?: boolean;
    progress?: boolean;
    enabledOnProgress?: boolean;
    floating?: boolean;
    showSpinnerIcon?: boolean;
    onBright?: boolean;
  }
  type HTMLButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
  interface ButtonButtonProps extends CommonProps, Omit<HTMLButtonProps, 'size'> {
    tag?: 'button';
    href?: never;
  }
  type HTMLAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;
  interface AnchorButtonProps extends CommonProps, HTMLAnchorProps {
    tag?: 'a';
  }
  type HTMLLabelProps = LabelHTMLAttributes<HTMLLabelElement>;
  interface LabelButtonProps extends CommonProps, HTMLLabelProps {
    tag?: 'label';
    disabled?: boolean;
  }
  type ButtonProps = ButtonButtonProps | AnchorButtonProps | LabelButtonProps;

  const TestButton = (props: ButtonProps) => {
    return null;
  };

  const ReflectedTestButton1 = reflect({
    view: TestButton,
    bind: {
      inline: true,
      progress: true,
      tag: 'a',
      href: 'test',
    },
  });
  const ReflectedTestButton2 = reflect({
    view: TestButton,
    // @ts-expect-error
    bind: {
      inline: true,
      progress: true,
      tag: 'button',
      href: 'test',
    },
  });
}
