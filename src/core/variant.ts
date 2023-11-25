import { Store } from 'effector';
import React from 'react';

import { reflectFactory } from './reflect';
import {
  AtLeastOne,
  BindableProps,
  Context,
  Hooks,
  PartialBoundProps,
  View,
} from './types';

const Default = () => null;

export function variantFactory<Scoped>(context: Context) {
  const reflect = reflectFactory<Scoped>(context);

  return function variant<
    Props,
    Variant extends string,
    Bind extends BindableProps<Props>,
  >(
    config:
      | {
          source: Store<Variant>;
          bind?: Bind;
          cases: AtLeastOne<Record<Variant, View<Props>>>;
          hooks?: Hooks;
          default?: View<Props>;
          forceScope?: Scoped extends true ? never : boolean;
        }
      | {
          if: Store<boolean>;
          then: View<Props>;
          else?: View<Props>;
          hooks?: Hooks;
          bind?: Bind;
          forceScope?: Scoped extends true ? never : boolean;
        },
  ): React.FC<PartialBoundProps<Props, Bind>> {
    let $case: Store<Variant>;
    let cases: AtLeastOne<Record<Variant, View<Props>>>;
    let def: View<Props>;

    // Shortcut for Store<boolean>
    if ('if' in config) {
      $case = config.if.map((value): Variant => (value ? 'then' : 'else') as Variant);

      cases = {
        then: config.then,
        else: config.else,
      } as unknown as AtLeastOne<Record<Variant, View<Props>>>;
      def = Default;
    }
    // Full form for Store<string>
    else {
      $case = config.source;
      cases = config.cases;
      def = config.default ?? Default;
    }

    function View(props: Props) {
      const nameOfCase = context.useUnit($case, { forceScope: config.forceScope });
      const Component = cases[nameOfCase] ?? def;

      return React.createElement(Component as any, props as any);
    }

    const bind = config.bind ?? ({} as Bind);

    return reflect({
      bind,
      view: View,
      hooks: config.hooks,
      forceScope: config.forceScope,
    });
  };
}
