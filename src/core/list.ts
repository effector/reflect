import { Store } from 'effector';
import { useList } from 'effector-react';
import React from 'react';

import { reflect } from './reflect';
import { BindableProps, Hooks, PartialBoundProps, View } from './types';

type ReflectListConfig<Props, Item, Bind> = Item extends Props
  ? {
      view: View<Props>;
      source: Store<Item[]>;
      bind?: Bind;
      hooks?: Hooks;
      getKey?: (item: Item) => React.Key;
      mapItem?: {
        [P in keyof PartialBoundProps<Props, Bind>]: (
          item: Item,
          index: number,
        ) => PartialBoundProps<Props, Bind>[P];
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
            [P in keyof PartialBoundProps<Props, Bind>]: (
              item: Item,
              index: number,
            ) => PartialBoundProps<Props, Bind>[P];
          };
        };

const isClientSide = typeof window !== 'undefined';

export function list<
  Item extends Record<any, any>,
  Props,
  Bind extends BindableProps<Props> = BindableProps<Props>,
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

  return () => useList(config.source, listConfig, { forceScope: !isClientSide });
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
