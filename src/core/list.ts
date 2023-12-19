import { scopeBind, Store } from 'effector';
import { useProvidedScope } from 'effector-react';
import React from 'react';

import { reflectFactory } from './reflect';
import { BindProps, Context, Hooks, UseUnitConifg, View } from './types';

export function listFactory(context: Context) {
  const reflect = reflectFactory(context);

  return function list<
    Item extends Record<any, any>,
    Props,
    Bind extends BindProps<Props>,
  >(config: {
    source: Store<Item[]>;
    view: View<Props>;
    bind?: Bind;
    mapItem?: {
      [K in keyof Props]: (item: Item, index: number) => Props[K];
    };
    getKey?: (item: Item) => React.Key;
    hooks?: Hooks;
    useUnitConfig?: UseUnitConifg;
  }): React.FC {
    const ItemView = reflect<Props, Bind>({
      view: config.view,
      bind: config.bind ? config.bind : ({} as Bind),
      hooks: config.hooks,
      useUnitConfig: config.useUnitConfig,
    });

    const listConfig = {
      getKey: config.getKey,
      fn: (value: Item, index: number) => {
        const scope = useProvidedScope();
        const finalProps = React.useMemo(() => {
          const props: any = {};

          if (config.mapItem) {
            forIn(config.mapItem, (prop) => {
              const fn =
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                config.mapItem![prop];
              const propValue = fn(value, index);

              if (typeof propValue === 'function') {
                props[prop] = scopeBind(propValue, {
                  safe: true,
                  scope: scope || undefined,
                });
              } else {
                props[prop] = propValue;
              }
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
