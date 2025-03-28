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

  expectType<React.FC>(VariableInput);
}

// variant catches incompatible props between cases
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
      // @ts-expect-error
      datetime: DateTime,
    },
  });

  expectType<React.FC>(VariableInput);
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

  expectType<React.FC>(CurrentPage);
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

  expectType<React.FC>(CurrentPage);
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
  expectType<React.FC>(CurrentPageThenElse);

  const CurrentPageOnlyThen = variant({
    if: $enabled,
    then: HomePage,
    bind: { context: $ctx },
  });
  expectType<React.FC>(CurrentPageOnlyThen);
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
      // @ts-expect-error
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
      // @ts-expect-error
      a: Button<'a'>,
    },
  });

  const IfElseVariant = variant({
    if: createStore(true),
    then: Button<'button'>,
    // @ts-expect-error
    else: Button<'a'>,
  });
}
