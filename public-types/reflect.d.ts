/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { EventCallable, Show, Store } from 'effector';
import type { useUnit } from 'effector-react';
import type {
  ComponentProps,
  ComponentType,
  FC,
  JSX,
  PropsWithChildren,
} from 'react';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VoidCallback<T> = T extends (...args: any[]) => infer R ? () => R : never;

/**
 * `bind` object type:
 * prop key -> store (unwrapped to reactive subscription) or any other value (used as is)
 */
type BindFromProps<Props> = {
  [K in keyof Props]?: K extends UnbindableProps
    ? never
    :
        | Store<Props[K]>
        | Props[K]
        // case: allow Event<void> for callbacks with arbitrary arguments
        | VoidCallback<Props[K]>;
};

type StoreValue<S> = S extends Store<infer Value> ? Value : never;

/**
 * A `source` of a `mapProps` entry: a single store, or - like `combine` / `useUnit` - an object
 * or array of stores that are combined into a single value.
 */
type SourceShape =
  | Store<any>
  | Record<string, Store<any>>
  | ReadonlyArray<Store<any>>;

/**
 * The value `fn` receives for a given `source` shape:
 * - `Store<V>` -> `V`
 * - `[Store<A>, Store<B>]` -> `[A, B]`
 * - `{ a: Store<A>; b: Store<B> }` -> `{ a: A; b: B }`
 */
type SourceValue<S> = S extends Store<infer V>
  ? V
  : S extends ReadonlyArray<Store<any>>
  ? { -readonly [I in keyof S]: StoreValue<S[I]> }
  : S extends Record<string, Store<any>>
  ? { [K in keyof S]: StoreValue<S[K]> }
  : never;

/**
 * `mapProps` object type:
 * prop key -> a derived prop computed from a store value and the component's props.
 *
 * Use it to combine a store state with the incoming props to produce a prop for the `view`.
 *
 * `Sources` is a separate generic that captures the `source` of every entry. Because the
 * sources are inferred independently of the `fn`s, `fn`'s `value` argument is inferred as the
 * resolved source value (no manual annotation needed), and `props` is the view's `Props`.
 * Each key in `mapProps` must be a prop of the `view` - a typo'd or unknown key resolves its
 * entry to `never`, so the object literal assigned to it is a type error at the key site.
 * A key that is also present in `bind` resolves to `never` as well — a prop must not be
 * both bound and derived.
 */
type MapPropsFromSources<Props, Bind, Sources extends Record<string, SourceShape>> = {
  [K in keyof Sources]: K extends keyof Props
    ? K extends keyof Bind
      ? never
      : {
          source: Sources[K];
          fn: (
            value: SourceValue<Sources[K]>,
            props: Props,
          ) => Props[K & keyof Props];
        }
    : never;
};

/**
 * The keys of the view `Props` that are derived via `mapProps` - used to make them optional
 * in the resulting component type.
 */
type MapKeysOf<Props, Sources extends Record<string, SourceShape>> = Extract<
  keyof Sources,
  keyof Props
>;

/**
 * Computes final props type based on Props of the view component, Bind object and the keys
 * derived via `mapProps`.
 *
 * Props that are "taken" by the Bind object or `mapProps` are made **optional** in the final type,
 * so it is possible to overwrite them in the component usage anyway
 */
type FinalProps<
  Props,
  Bind extends BindFromProps<Props>,
  MapKeys extends keyof Props,
> = Show<
  Omit<Props, keyof Bind | MapKeys> & {
    [K in Extract<keyof Bind, keyof Props> | MapKeys]?: Props[K];
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
 *   onChange: (event) => nameChanged(event.target.value),
 *  },
 *  mapProps: {
 *   label: { source: $user, fn: (user, props) => `${props.title} ${user.name}` },
 *  },
 * });
 * ```
 */
export function reflect<
  View extends ComponentType<any>,
  Props extends ComponentProps<View>,
  Bind extends BindFromProps<Props>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Sources extends Record<string, SourceShape> = {},
>(config: {
  view: View;
  bind: Bind;
  /**
   * Derives props for the `view` from a store value combined with the component's props.
   */
  mapProps?: MapPropsFromSources<Props, Bind, Sources>;
  hooks?: Hooks<Props>;
  /**
   * This configuration is passed directly to `useUnit`'s hook second argument.
   */
  useUnitConfig?: UseUnitConfig;
}): FC<FinalProps<Props, Bind, MapKeysOf<Props, Sources>>>;

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
 *   onChange: (event) => nameChanged(event.target.value),
 * });
 * ```
 */
export function createReflect<
  View extends ComponentType<any>,
  Props extends ComponentProps<View>,
  Bind extends BindFromProps<Props>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Sources extends Record<string, SourceShape> = {},
>(
  component: View,
): (
  bind: Bind,
  features?: {
    /**
     * Derives props for the `view` from a store value combined with the component's props.
     */
    mapProps?: MapPropsFromSources<Props, Bind, Sources>;
    hooks?: Hooks<Props>;
    /**
     * This configuration is passed directly to `useUnit`'s hook second argument.
     */
    useUnitConfig?: UseUnitConfig;
  },
) => FC<FinalProps<Props, Bind, MapKeysOf<Props, Sources>>>;

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
  View extends ComponentType<any>,
  Props extends ComponentProps<View>,
  Item,
  MapItem extends {
    [M in keyof Omit<Props, keyof Bind | keyof Sources>]: (
      item: Item,
      index: number,
    ) => Props[M];
  },
  Bind extends BindFromProps<Props> = object,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Sources extends Record<string, SourceShape> = {},
>(
  config: ReflectedProps<Item, Bind> extends Props
    ? {
        source: Store<Item[]>;
        view: View;
        bind?: Bind;
        mapItem?: MapItem;
        mapProps?: MapPropsFromSources<Props, Bind, Sources>;
        getKey?: (item: Item) => React.Key;
        hooks?: Hooks<Props>;
        /**
         * This configuration is passed directly to `useUnit`'s hook second argument.
         */
        useUnitConfig?: UseUnitConfig;
      }
    : {
        source: Store<Item[]>;
        view: View;
        bind?: Bind;
        mapItem: MapItem;
        mapProps?: MapPropsFromSources<Props, Bind, Sources>;
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
 * Computes final props type based on Props of the view component and Bind object for variant operator specifically
 *
 * Difference is important since in variant case Props is a union
 *
 * Props that are "taken" by Bind object are made **optional** in the final type,
 * so it is possible to overwrite them in the component usage anyway
 */
type FinalPropsVariant<
  Props,
  Bind extends BindFromProps<Props>,
  MapKeys extends keyof Props,
> = Show<
  Props extends any
    ? Omit<Props, keyof Bind | MapKeys> & {
        [K in Extract<keyof Bind, keyof Props> | MapKeys]?: Props[K];
      }
    : never
>;

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
  CaseType extends string,
  Cases extends Record<CaseType, ComponentType<any>>,
  Props extends ComponentProps<Cases[CaseType]>,
  // It is ok here - it fixed bunch of type inference issues, when `bind` is not provided
  // but it is not clear why it works this way - Record<string, never> or any option other than `{}` doesn't work
  // eslint-disable-next-line @typescript-eslint/ban-types
  Bind extends BindFromProps<Props> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  Sources extends Record<string, SourceShape> = {},
>(
  config:
    | {
        source: Store<CaseType>;
        cases: Partial<Cases>;
        default?: ComponentType<Props>;
        bind?: Bind;
        mapProps?: MapPropsFromSources<Props, Bind, Sources>;
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
        mapProps?: MapPropsFromSources<Props, Bind, Sources>;
        hooks?: Hooks<Props>;
        /**
         * This configuration is passed directly to `useUnit`'s hook second argument.
         */
        useUnitConfig?: UseUnitConfig;
      },
): FC<FinalPropsVariant<Props, Bind, MapKeysOf<Props, Sources>>>;

// fromTag types
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
export function fromTag<HtmlTag extends keyof JSX.IntrinsicElements>(
  htmlTag: HtmlTag,
): (props: PropsWithChildren<JSX.IntrinsicElements[HtmlTag]>) => React.ReactNode;
