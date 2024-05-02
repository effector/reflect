import { Store, StoreWritable } from 'effector';
import { createElement, ReactNode } from 'react';

import { reflectFactory } from './reflect';
import { BindProps, Context, Hooks, UseUnitConfig, View } from './types';

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
          source: StoreWritable<Variant>;
          bind?: Bind;
          cases: Record<Variant, View<Props>>;
          hooks?: Hooks<Props>;
          default?: View<Props>;
          useUnitConfig?: UseUnitConfig;
        }
      | {
          if: StoreWritable<boolean>;
          then: View<Props>;
          else?: View<Props>;
          hooks?: Hooks<Props>;
          bind?: Bind;
          useUnitConfig?: UseUnitConfig;
        },
  ): (p: Props) => ReactNode {
    let $case: Store<Variant>;
    let cases: Record<Variant, View<Props>>;
    let def: View<Props>;

    // Shortcut for StoreWritableWritable<boolean>
    if ('if' in config) {
      $case = config.if.map((value): Variant => (value ? 'then' : 'else') as Variant);

      cases = {
        then: config.then,
        else: config.else,
      } as unknown as Record<Variant, View<Props>>;
      def = Default;
    }
    // Full form for StoreWritableWritable<string>
    else {
      $case = config.source;
      cases = config.cases;
      def = config.default ?? Default;
    }

    function View(props: Props) {
      const nameOfCase = context.useUnit($case, config.useUnitConfig);
      const Component = cases[nameOfCase] ?? def;

      return createElement(Component as any, props as any);
    }

    const bind = config.bind ?? ({} as Bind);

    return reflect({
      bind,
      view: View,
      hooks: config.hooks,
      useUnitConfig: config.useUnitConfig,
    }) as unknown as (p: Props) => ReactNode;
  };
}
