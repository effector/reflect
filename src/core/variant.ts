import { Store } from 'effector';
import React from 'react';

import { reflectFactory } from './reflect';
import { BindProps, Context, Hooks, View } from './types';

const Default = () => null;

export function variantFactory(context: Context) {
  const reflect = reflectFactory(context);

  return function variant<
    Props,
    Variant extends string,
    Bind extends BindProps<Props>,
  >(
    config:
      | {
          source: Store<Variant>;
          bind?: Bind;
          cases: Record<Variant, View<Props>>;
          hooks?: Hooks;
          default?: View<Props>;
        }
      | {
          if: Store<boolean>;
          then: View<Props>;
          else?: View<Props>;
          hooks?: Hooks;
          bind?: Bind;
        },
  ): (p: Props) => React.ReactNode {
    let $case: Store<Variant>;
    let cases: Record<Variant, View<Props>>;
    let def: View<Props>;

    // Shortcut for Store<boolean>
    if ('if' in config) {
      $case = config.if.map((value): Variant => (value ? 'then' : 'else') as Variant);

      cases = {
        then: config.then,
        else: config.else,
      } as unknown as Record<Variant, View<Props>>;
      def = Default;
    }
    // Full form for Store<string>
    else {
      $case = config.source;
      cases = config.cases;
      def = config.default ?? Default;
    }

    function View(props: Props) {
      const nameOfCase = context.useUnit($case);
      const Component = cases[nameOfCase] ?? def;

      return React.createElement(Component as any, props as any);
    }

    const bind = config.bind ?? ({} as Bind);

    return reflect({
      bind,
      view: View,
      hooks: config.hooks,
    }) as unknown as (p: Props) => React.ReactNode;
  };
}
