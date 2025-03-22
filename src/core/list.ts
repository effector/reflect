import { scopeBind, StoreWritable } from 'effector';
import { useProvidedScope } from 'effector-react';

import { reflectFactory } from './reflect';
import { BindProps, Context, Hooks, UseUnitConfig, View } from './types';
import { createElement, useMemo } from 'react';
import type { Key, FC } from 'react';

export function listFactory(context: Context) {
  const reflect = reflectFactory(context);

  return function list<
    Item extends Record<any, any>,
    Props,
    Bind extends BindProps<Props>,
  >(config: {
    source: StoreWritable<Item[]>;
    view: View<Props>;
    bind?: Bind;
    mapItem?: {
      [K in keyof Props]: (item: Item, index: number) => Props[K];
    };
    getKey?: (item: Item) => Key;
    hooks?: Hooks<Props>;
    useUnitConfig?: UseUnitConfig;
  }): FC {
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
        const finalProps = useMemo(() => {
          const props: any = {};

          if (config.mapItem) {
            forIn(config.mapItem, (prop) => {
              const fn =
                config.mapItem?.[prop];
              const propValue = fn?.(value, index);

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

        return createElement(ItemView, finalProps);
      },
    };

    return () => context.useList(config.source, listConfig);
  };
}

function forIn<T extends Record<any, any>, R extends any>(
  target: T,
  fn: (_t: keyof T) => R,
): void {
  for (const prop in target) {
    if (Object.hasOwn(target, prop)) fn(prop);
  }
}
