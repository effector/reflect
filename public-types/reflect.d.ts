/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { EventCallable, Store } from 'effector';
import type { ComponentType, FC } from 'react';

type UnbindableProps = 'key' | 'ref';

type Hooks = {
  mounted?: EventCallable<void> | (() => unknown);
  unmounted?: EventCallable<void> | (() => unknown);
};

/**
 * A method to create a component reactively bound to a store or statically - to any other value.
 *
 * @example
 * ```
 * const Name = reflect({
 *  view: Input,
 *  bind: {
 *   value: $name,
 *   placeholder: 'Name',
 *   onChange: changeName.prepend(inputChanged),
 *  },
 * });
 * ```
 */
export function reflect<
  Props,
  Bind extends {
    [K in keyof Props]?: K extends UnbindableProps
      ? never
      : Props[K] | Store<Props[K]> | EventCallable<void>;
  },
>(config: {
  view: ComponentType<Props>;
  bind: Bind;
  hooks?: Hooks;
}): FC<Omit<Props, keyof Bind>>;

export function createReflect<
  Props,
  Bind extends {
    [K in keyof Props]?: K extends UnbindableProps
      ? never
      : Props[K] | Store<Props[K]> | EventCallable<void>;
  },
>(
  component: ComponentType<Props>,
): (
  bind: Bind,
  optionals?: {
    hooks?: Hooks;
  },
) => FC<Omit<Props, keyof Bind>>;

export function list<
  Props,
  Item,
  Bind extends {
    [K in keyof Props]?: K extends UnbindableProps
      ? never
      : Props[K] | Store<Props[K]> | EventCallable<void>;
  },
>(config: {
  source: Store<Item[]>;
  view: ComponentType<Props>;
  bind?: Bind;
  mapItem?: {
    [M in keyof Omit<Props, keyof Bind>]: (item: Item, index: number) => Props[M];
  };
  getKey?: (item: Item) => React.Key;
  hooks?: Hooks;
}): FC;

export function variant(any: any): any;
