import type { EventCallable, Store } from 'effector';
import type { ComponentType, FC } from 'react';

type UnbindableProps = 'key' | 'ref';

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
  hooks?: {
    mounted: EventCallable<void>;
    unmounted: EventCallable<void>;
  };
}): FC<Omit<Props, keyof Bind>>;

export function createReflect(any: any): any;
export function list(any: any): any;
export function variant(any: any): any;
