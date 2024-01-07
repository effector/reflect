import { Effect, EventCallable, Store } from 'effector';
import { useList, useUnit } from 'effector-react';
import { ComponentType } from 'react';

/**
 * This is the internal typings - for the library internals, where we do not really care about real-world user data.
 *
 * Public types are stored separately from the source code, so it is easier to develop and test them.
 * You can find public types in `public-types` folder and tests for type inference at the `type-tests` folder.
 */

export interface Context {
  useUnit: typeof useUnit;
  useList: typeof useList;
}

export type View<T> = ComponentType<T>;

export type BindProps<Props> = {
  [K in keyof Props]: Props[K] | Store<Props[K]> | EventCallable<void>;
};

export type Hook = (() => any) | EventCallable<void> | Effect<void, any, any>;

export type Hooks = {
  mounted?: Hook;
  unmounted?: Hook;
};

export type UseUnitConifg = Parameters<typeof useUnit>[1];
