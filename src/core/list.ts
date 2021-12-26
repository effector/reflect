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

type ReflectListConfig<Props, Item, Bind> = Item extends Props
  ? {
      view: View<Props>;
      source: Store<Item[]>;
      bind?: Bind;
      hooks?: Hooks;
      getKey?: (item: Item) => React.Key;
      mapItem?: {
        [P in keyof PropsByBind<Props, Bind>]: (
          item: Item,
          index: number,
        ) => PropsByBind<Props, Bind>[P];
      };
    }
  :
      | {
          view: View<Props>;
          source: Store<Item[]>;
          bind?: undefined;
          hooks?: Hooks;
          getKey?: (item: Item) => React.Key;
          mapItem: {
            [P in keyof Props]: (item: Item, index: number) => Props[P];
          };
        }
      | {
          view: View<Props>;
          source: Store<Item[]>;
          bind: Bind;
          hooks?: Hooks;
          getKey?: (item: Item) => React.Key;
          mapItem?: {
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
      bind: config.bind ? config.bind : ({} as Bind),
      hooks: config.hooks,
    });

    const listConfig = {
      getKey: config.getKey,
      fn: (value: Item, index: number) => {
        const finalProps = React.useMemo(() => {
          const props: any = {};

          if (config.mapItem) {
            forIn(config.mapItem, (prop) => {
              const fn =
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                config.mapItem![prop];
              const propValue = fn(value, index);

              props[prop] = propValue;
            });
          } else {
            forIn(value, (prop) => {
              props[prop] = value[prop];
            });
          }

          return props;
        }, [value, index]);

        return React.createElement(ItemView, finalProps);
      },
    };

    return () => context.useList(config.source, listConfig);
  };
}

function forIn<T extends Record<any, any>, R extends any>(
  target: T,
  fn: (_t: keyof T) => R,
): void {
  const hasProp = {}.hasOwnProperty;
  for (const prop in target) {
    if (hasProp.call(target, prop)) fn(prop);
  }
}
