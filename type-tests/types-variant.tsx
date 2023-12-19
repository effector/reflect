/* eslint-disable @typescript-eslint/ban-ts-comment */
import { reflect, variant } from '@effector/reflect';
import { createEvent, createStore } from 'effector';
import React, { PropsWithChildren } from 'react';
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
