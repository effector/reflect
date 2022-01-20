import React from 'react';
import { Store } from 'effector';

import { reflectFactory } from './reflect';

import {
  BindByProps,
  Hooks,
  PropsByBind,
  ReflectCreatorContext,
  View,
} from './types';

const Default = () => null;

export function casesFactory(context: ReflectCreatorContext) {
  const reflect = reflectFactory(context);

  return function cases<Props, S, Bind extends BindByProps<Props>>(config: {
    source: Store<S>;
    bind?: Bind;
    cases: { view: View<Props>; filter: (_: S) => boolean }[];
    hooks?: Hooks;
    default?: View<Props>;
  }): React.FC<PropsByBind<Props, Bind>> {
    function View(props: Props) {
      const value = context.useStore(config.source);
      const variant = config.cases.find((variant) => variant.filter(value));
      const Component = variant?.view ?? config.default ?? Default;

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
