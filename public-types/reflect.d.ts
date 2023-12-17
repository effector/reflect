/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { EventCallable, Store } from 'effector';
import type { ComponentType, FC } from 'react';

type UnbindableProps = 'key' | 'ref';

type Hooks = {
  mounted?: EventCallable<void> | (() => unknown);
  unmounted?: EventCallable<void> | (() => unknown);
};

type BindFromProps<Props> = {
  [K in keyof Props]?: K extends UnbindableProps
    ? never
    : Props[K] | Store<Props[K]> | EventCallable<void>;
};

// relfect types
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
export function reflect<Props, Bind extends BindFromProps<Props>>(config: {
  view: ComponentType<Props>;
  bind: Bind;
  hooks?: Hooks;
}): FC<Omit<Props, keyof Bind>>;

// createReflect types
export function createReflect<Props, Bind extends BindFromProps<Props>>(
  component: ComponentType<Props>,
): (
  bind: Bind,
  optionals?: {
    hooks?: Hooks;
  },
) => FC<Omit<Props, keyof Bind>>;

// list types
type PropsifyBind<Bind> = {
  [K in keyof Bind]: Bind[K] extends Store<infer Value> ? Value : Bind[K];
};

type ReflectedProps<Item, Bind> = Item & PropsifyBind<Bind>;

export function list<
  Props,
  Item,
  MapItem extends {
    [M in keyof Omit<Props, keyof Bind>]: (item: Item, index: number) => Props[M];
  },
  Bind extends BindFromProps<Props> = object,
>(
  config: ReflectedProps<Item, Bind> extends Props
    ? {
        source: Store<Item[]>;
        view: ComponentType<Props>;
        bind?: Bind;
        mapItem?: MapItem;
        getKey?: (item: Item) => React.Key;
        hooks?: Hooks;
      }
    : {
        source: Store<Item[]>;
        view: ComponentType<Props>;
        bind?: Bind;
        mapItem: MapItem;
        getKey?: (item: Item) => React.Key;
        hooks?: Hooks;
      },
): FC;

// variant types

export function variant<
  Props,
  CaseType extends string,
  Bind extends BindFromProps<Props>,
>(
  config:
    | {
        source: Store<CaseType>;
        cases: Partial<Record<CaseType, ComponentType<Props>>>;
        default?: ComponentType<Props>;
        bind?: Bind;
        hooks?: Hooks;
      }
    | {
        if: Store<boolean>;
        then: ComponentType<Props>;
        else?: ComponentType<Props>;
        bind?: Bind;
        hooks?: Hooks;
      },
): FC<Omit<Props, keyof Bind>>;
