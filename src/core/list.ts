import React from 'react';
import { Store } from 'effector';

import { reflectFactory } from './reflect';

import {
  BindByProps,
  PropsByBind,
  ReflectCreatorContext,
  View,
  Hooks,
} from './types';

type ReflectListConfig<Props, Item, Bind> = {
  view: View<Props>;
  source: Store<Item[]>;
  bind: Bind;
  hooks?: Hooks;
  getKey?: (item: Item) => React.Key;
  mapItem: {
    [P in keyof PropsByBind<Props, Bind>]: (
      item: Item,
      index: number,
    ) => PropsByBind<Props, Bind>[P];
  };
};

export function listFactory(context: ReflectCreatorContext) {
  const reflect = reflectFactory(context);

  return function list<
    Item,
    Props,
    Bind extends BindByProps<Props> = BindByProps<Props>
  >(config: ReflectListConfig<Props, Item, Bind>): React.FC {
    const ItemView = reflect<Props, Bind>({
      view: config.view,
      bind: config.bind,
      hooks: config.hooks,
    });

    const listConfig = {
      getKey: config.getKey,
      fn: (value: Item, index: number) => {
        const finalProps = React.useMemo(() => {
          const props: any = {};

          for (const prop in config.mapItem) {
            if ({}.hasOwnProperty.call(config.mapItem, prop)) {
              // for some reason TS can't properly infer `prop` type here
              const fn = config.mapItem[prop as keyof typeof config.mapItem];
              const propValue = fn(value, index);

              props[prop] = propValue;
            }
          }

          return props;
        }, [value, index]);

        return React.createElement(ItemView, finalProps);
      },
    };

    return () => context.useList(config.source, listConfig);
  };
}
