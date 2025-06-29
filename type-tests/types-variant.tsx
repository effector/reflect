/* eslint-disable @typescript-eslint/ban-ts-comment */
import { reflect, variant } from '@effector/reflect';
import { Button } from '@mantine/core';
import { createEvent, createStore } from 'effector';
import React, { FC, PropsWithChildren, ReactNode } from 'react';
import { expectType } from 'tsd';

// basic variant usage
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const DateTime: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();
  const $type = createStore<'input' | 'datetime'>('input');

  const VariableInput = variant({
    source: $type,
    bind: {
      value: $value,
      onChange: changed,
    },
    cases: {
      input: Input,
      datetime: DateTime,
    },
  });

  <VariableInput />;
}

// variant allows to pass incompatible props between cases - resulting component will have union of all props from all cases
{
  const Input: React.FC<{
    value: string;
    onChange: (event: { target: { value: string } }) => void;
  }> = () => null;
  const DateTime: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();
  const $type = createStore<'input' | 'datetime'>('input');

  const VariableInput = variant({
    source: $type,
    bind: {
      value: $value,
      onChange: changed,
    },
    cases: {
      input: Input,
      datetime: DateTime,
    },
  });

  <VariableInput />;
  <VariableInput value="test" />;
  <VariableInput
    value="test"
    onChange={(event: { target: { value: string } }) => {
      event.target.value;
    }}
  />;
  <VariableInput
    value="test"
    onChange={() => {
      // ok
    }}
  />;
  <VariableInput
    value="test"
    onChange={(event: string) => {
      event;
    }}
  />;
  <VariableInput
    // @ts-expect-error
    value={42}
    // @ts-expect-error
    onChange={(event: number) => {
      event;
    }}
  />;
}

// variant allows not to set every possble case
// for e.g. if we want to cover only specific ones and render default for the rest
{
  type PageProps = {
    context: {
      route: string;
    };
  };

  const HomePage: React.FC<PageProps> = () => null;
  const FaqPage: React.FC<PageProps> = () => null;
  const NotFoundPage: React.FC<PageProps> = () => null;
  const $page = createStore<'home' | 'faq' | 'profile' | 'products'>('home');
  const $pageContext = $page.map((route) => ({ route }));

  const CurrentPage = variant({
    source: $page,
    bind: { context: $pageContext },
    cases: {
      home: HomePage,
      faq: FaqPage,
    },
    default: NotFoundPage,
  });

  <CurrentPage />;
  <CurrentPage context={{ route: 'home' }} />;
  // @ts-expect-error
  <CurrentPage context="kek" />;
}

// variant warns about wrong cases
{
  type PageProps = {
    context: {
      route: string;
    };
  };

  const HomePage: React.FC<PageProps> = () => null;
  const FaqPage: React.FC<PageProps> = () => null;
  const NotFoundPage: React.FC<PageProps> = () => null;
  const $page = createStore<'home' | 'profile' | 'products'>('home');
  const $pageContext = $page.map((route) => ({ route }));

  const CurrentPage = variant({
    source: $page,
    bind: { context: $pageContext },
    cases: {
      home: HomePage,
      // @ts-expect-error
      faq: FaqPage,
    },
    default: NotFoundPage,
  });

  <CurrentPage />;
  <CurrentPage context={{ route: 'home' }} />;
  // @ts-expect-error
  <CurrentPage context="kek" />;
}

// overload for boolean source
{
  type PageProps = {
    context: {
      route: string;
    };
  };

  const $ctx = createStore({ route: 'home' });

  const HomePage: React.FC<PageProps> = () => null;
  const FallbackPage: React.FC<PageProps> = () => null;
  const $enabled = createStore(true);

  const CurrentPageThenElse = variant({
    if: $enabled,
    then: HomePage,
    else: FallbackPage,
    bind: { context: $ctx },
  });

  <CurrentPageThenElse />;
  <CurrentPageThenElse context={{ route: 'home' }} />;
  // @ts-expect-error
  <CurrentPageThenElse context="kek" />;

  const CurrentPageOnlyThen = variant({
    if: $enabled,
    then: HomePage,
    bind: { context: $ctx },
  });
  <CurrentPageOnlyThen />;
  <CurrentPageOnlyThen context={{ route: 'home' }} />;
  // @ts-expect-error
  <CurrentPageOnlyThen context="kek" />;
}

// supports nesting
{
  const Test = (props: { test: string }) => <></>;

  const $test = createStore('test');
  const $bool = createStore(true);

  const NestedVariant = variant({
    source: $test,
    cases: {
      test: variant({
        if: $bool,
        then: reflect({
          view: Test,
          bind: {},
        }),
      }),
    },
  });

  <NestedVariant />;
}

// allows variants of compatible types
{
  const Test = (props: PropsWithChildren<{ test: string }>) => <div>content</div>;
  const Loader = () => <>loader</>;

  const $test = createStore(false);

  const View = variant({
    if: $test,
    then: reflect({
      view: Test,
      bind: {
        test: $test.map(() => 'test'),
      },
    }),
    else: Loader,
  });

  <View test="test" />;
  // @ts-expect-error
  <View test={42} />;
}

// Issue #81 reproduce 1
{
  const Component = (props: { name: string }) => {
    return null;
  };

  const Variant = variant({
    source: createStore<'a'>('a'),
    cases: { a: Component },
  });

  // should not report error here
  const element = <Variant name="test" />;
}

// Issue #81 reproduce 2
{
  const $enabled = createStore(true);
  const $name = createStore('reflect');

  const MyView: FC<{ name: string; slot: ReactNode }> = ({ name, slot }) => {
    return (
      <div>
        <h1>Hello, {name}!</h1>
        {slot}
      </div>
    );
  };

  const ComponentWithReflectOnly = reflect({
    bind: {
      name: $name,
    },
    view: MyView,
  });

  const ComponentWithVariantAndReflect = variant({
    if: $enabled,
    then: reflect({
      bind: {
        name: $name,
      },
      view: MyView,
    }),
  });

  // Should not report error for "Another slot type"
  const App = () => {
    return (
      <main>
        <ComponentWithReflectOnly slot={<h2>Good slot type</h2>} />
        <ComponentWithVariantAndReflect slot={<h2>Another slot type(</h2>} />
        <ComponentWithVariantAndReflect
          slot={<h2>Should report error for "name"</h2>}
          name="kek"
        />
      </main>
    );
  };
}

// Edge-case: Mantine Button with weird polymorphic factory (fails)
//
// This case is broken because Button has a weird polymorphic factory
// that is not compatible with `variant` as of now - it produces weird and broken types for resulting component
// Test is left here for the future reference, in case if it will be possible to fix
{
  const ReflectedVariant = variant({
    source: createStore<'button' | 'a'>('button'),
    bind: {
      size: 'xl',
    },
    cases: {
      button: Button<'button'>,
      a: Button<'a'>,
    },
  });

  const ReflectedVariantBad = variant({
    source: createStore<'button' | 'a'>('button'),
    bind: {
      // @ts-expect-error
      size: 52,
    },
    cases: {
      button: Button<'button'>,
      a: Button<'a'>,
    },
  });

  <ReflectedVariantBad />;
  <ReflectedVariantBad size="xl" />;
  // @ts-expect-error
  <ReflectedVariantBad size={52} />;

  const IfElseVariant = variant({
    if: createStore(true),
    then: Button<'button'>,
    // @ts-expect-error
    else: Button<'a'>,
  });

  <IfElseVariant />;
  <IfElseVariant size="xl" />;
  // @ts-expect-error
  <IfElseVariant size={52} />;
}

// variant should allow not-to pass required props - as they can be added later in react
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $variants = createStore<'input' | 'fallback'>('input');
  const Fallback: React.FC<{ kek?: string }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const InputBase = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
    },
  });

  const ReflectedInput = variant({
    source: $variants,
    cases: {
      input: InputBase,
      fallback: Fallback,
    },
  });

  const App: React.FC = () => {
    // missing prop must still be required in react
    // but in this case it is not required, as props are conditional union
    return <ReflectedInput />;
  };

  <ReflectedInput kek="kek" />;

  const AppFixed: React.FC = () => {
    return <ReflectedInput color="red" />;
  };
  expectType<React.FC>(App);
  expectType<React.FC>(AppFixed);
}
