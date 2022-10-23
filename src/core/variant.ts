import React from 'react';
import { Store } from 'effector';

import { reflectFactory } from './reflect';

import {
  BindableProps,
  Hooks,
  PartialBoundProps,
  ReflectCreatorContext,
  View,
  AtLeastOne,
} from './types';

const Default = () => null;

export function variantFactory(context: ReflectCreatorContext) {
  const reflect = reflectFactory(context);

  return function variant<
    Props,
    Variant extends string,
    Bind extends BindableProps<Props>
  >(config: {
    source: Store<Variant>;
    bind?: Bind;
    cases: AtLeastOne<Record<Variant, View<Props>>>;
    hooks?: Hooks;
    default?: View<Props>;
  }): React.FC<PartialBoundProps<Props, Bind>> {
    function View(props: Props) {
      const nameOfCase = context.useUnit(config.source);
      const Component = config.cases[nameOfCase] ?? config.default ?? Default;

      return React.createElement(Component, props);
    }

    const bind = config.bind ?? ({} as Bind);

    return reflect({
      bind,
      view: View,
      hooks: config.hooks,
    });
  };
}
