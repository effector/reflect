/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { EventCallable, Show, Store } from 'effector';
import type { useUnit } from 'effector-react';
import type { ComponentType, FC, PropsWithChildren, ReactHTML } from 'react';

type UseUnitConfig = Parameters<typeof useUnit>[1];

type UnbindableProps = 'key' | 'ref';

type Hooks<Props> = {
  mounted?:
    | EventCallable<Props extends infer HookArg ? HookArg : never>
    | EventCallable<void>
    | ((props: Props) => unknown);
  unmounted?:
    | EventCallable<Props extends infer HookArg ? HookArg : never>
    | EventCallable<void>
    | ((props: Props) => unknown);
};

/**
 * `bind` object type:
 * prop key -> store (unwrapped to reactive subscription) or any other value (used as is)
 *
 * Also handles some edge-cases like enforcing type inference for inlined callbacks
 */
type BindFromProps<Props> = {
  [K in keyof Props]?: K extends UnbindableProps
    ? never
    : Props[K] extends (...args: any[]) => any
    ? // To force TS infer types for any provided callback
      | ((...args: Parameters<Props[K]>) => ReturnType<Props[K]>)
        // Edge-case: allow to pass an event listener without any parameters (e.g. onClick: () => ...)
        | (() => ReturnType<Props[K]>)
        // Edge-case: allow to pass a Store, which contains a function
        | Store<Props[K]>
    : Store<Props[K]> | Props[K];
};

/**
 * Computes final props type based on Props of the view component and Bind object.
 *
 * Props that are "taken" by Bind object are made **optional** in the final type,
 * so it is possible to overwrite them in the component usage anyway
 */
type FinalProps<Props, Bind extends BindFromProps<Props>> = Show<
  Omit<Props, keyof Bind> & {
    [K in Extract<keyof Bind, keyof Props>]?: Props[K];
  }
>;

// relfect types
/**
 * Operator that creates a component, which props are reactively bound to a store or statically - to any other value.
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
  hooks?: Hooks<Props>;
  /**
   * This configuration is passed directly to `useUnit`'s hook second argument.
   */
  useUnitConfig?: UseUnitConfig;
}): FC<FinalProps<Props, Bind>>;

// Note: FC is used as a return type, because tests on a real Next.js project showed,
// that if theoretically better option like (props: ...) => React.ReactNode is used,
// then TS type inference works worse in some cases - didn't manage to reproduce it in a reflect type tests though.
//
// It is not clear why it works this way (FC return type is actually compatible with ReactNode), but it seems that FC is the best option here :shrug:

// createReflect types
/**
 * Method to create a `reflect` function with a predefined `view` component.
 *
 * @example
 * ```
 * const reflectInput = createReflect(Input);
 *
 * const Name = reflectInput({
 *   value: $name,
 *   placeholder: 'Name',
 *   onChange: changeName.prepend(inputChanged),
 * });
 * ```
 */
export function createReflect<Props, Bind extends BindFromProps<Props>>(
  component: ComponentType<Props>,
): (
  bind: Bind,
  features?: {
    hooks?: Hooks<Props>;
    /**
     * This configuration is passed directly to `useUnit`'s hook second argument.
     */
    useUnitConfig?: UseUnitConfig;
  },
) => FC<FinalProps<Props, Bind>>;

// list types
type PropsifyBind<Bind> = {
  [K in keyof Bind]: Bind[K] extends Store<infer Value> ? Value : Bind[K];
};

type ReflectedProps<Item, Bind> = Item & PropsifyBind<Bind>;

/**
 * Operator to create a component, which reactivly renders a list of `view` components based on the `source` store with an array value.
 * Also supports `bind`, like the `reflect` operator.
 *
 * @example
 * ```
 * const List = list({
 *  source: $items,
 *  view: Item,
 *  mapItem: {
 *    id: (item) => item.id,
 *    value: (item) => item.value,
 *   onChange: (_item) => (_params) => {},
 *  },
 *});
 *
 * ```
 */
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
        hooks?: Hooks<Props>;
        /**
         * This configuration is passed directly to `useUnit`'s hook second argument.
         */
        useUnitConfig?: UseUnitConfig;
      }
    : {
        source: Store<Item[]>;
        view: ComponentType<Props>;
        bind?: Bind;
        mapItem: MapItem;
        getKey?: (item: Item) => React.Key;
        hooks?: Hooks<Props>;
        /**
         * This configuration is passed directly to `useUnit`'s hook second argument.
         */
        useUnitConfig?: UseUnitConfig;
      },
): FC;

// variant types

/**
 * Operator to conditionally render a component based on the reactive `source` store value.
 *
 * @example
 * ```
 * // source is a store with a string
 * const Component = variant({
 *  source: $isError.map((isError) => (isError ? 'error' : 'success')),
 *  cases: {
 *    error: ErrorComponent,
 *    success: SuccessComponent,
 *  },
 *});
 * // shorthand for boolean source
 * const Component = variant({
 *  if: $isError,
 *  then: ErrorComponent,
 *  else: SuccessComponent,
 * });
 * ```
 */
export function variant<
  Props,
  CaseType extends string,
  // It is ok here - it fixed bunch of type inference issues, when `bind` is not provided
  // but it is not clear why it works this way - Record<string, never> or any option other than `{}` doesn't work
  // eslint-disable-next-line @typescript-eslint/ban-types
  Bind extends BindFromProps<Props> = {},
>(
  config:
    | {
        source: Store<CaseType>;
        cases: Partial<Record<CaseType, ComponentType<Props>>>;
        default?: ComponentType<Props>;
        bind?: Bind;
        hooks?: Hooks<Props>;
        /**
         * This configuration is passed directly to `useUnit`'s hook second argument.
         */
        useUnitConfig?: UseUnitConfig;
      }
    | {
        if: Store<boolean>;
        then: ComponentType<Props>;
        else?: ComponentType<Props>;
        bind?: Bind;
        hooks?: Hooks<Props>;
        /**
         * This configuration is passed directly to `useUnit`'s hook second argument.
         */
        useUnitConfig?: UseUnitConfig;
      },
): FC<FinalProps<Props, Bind>>;

// fromTag types
type GetProps<HtmlTag extends keyof ReactHTML> = Exclude<
  Parameters<ReactHTML[HtmlTag]>[0],
  null | undefined
>;

/**
 *
 * Simple helper to allow to use `reflect` with any valid html tag
 *
 * @example
 * ```
 * import { reflect, fromTag } from '@effector/reflect'
 *
 * const DomInput = fromTag("input")
 *
 * const View = reflect({
 *  view: DomInput,
 *  bind: {
 *   type: 'radio',
 *   value: $value,
 *   onChange: (e) => e.target.value,
 *  }
 * })
 * ```
 */
export function fromTag<HtmlTag extends keyof ReactHTML>(
  htmlTag: HtmlTag,
): FC<PropsWithChildren<GetProps<HtmlTag>>>;
