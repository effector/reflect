import { Effect, Event, Store } from 'effector';
import { useList, useUnit } from 'effector-react';
import { ComponentClass, FC } from 'react';

export interface Context {
  useUnit: typeof useUnit;
  useList: typeof useList;
}

type UnbindableProps = 'key' | 'ref';

type Storify<Prop> = Omit<Store<Prop>, 'updates' | 'reset' | 'on' | 'off' | 'thru'>;

export type BindableProps<Props> = {
  [Key in Exclude<keyof Props, UnbindableProps>]?: Props[Key] extends (
    payload: any,
  ) => void
    ? Storify<Props[Key]> | Props[Key] | Event<void>
    : Storify<Props[Key]> | Props[Key];
};

export type View<T> = FC<T> | ComponentClass<T>;

type UnboundProps<Props, Bind> = Omit<Props, keyof Bind>;
type BoundProps<Props, Bind> = Omit<Props, keyof UnboundProps<Props, Bind>>;

export type PartialBoundProps<Props, Bind> = UnboundProps<Props, Bind> &
  Partial<BoundProps<Props, Bind>>;

export type Hook = (() => any) | Event<void> | Effect<void, any, any>;

export interface Hooks {
  mounted?: Hook;
  unmounted?: Hook;
}

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];
export interface NonEmptyArray<A> extends Array<A> {
  0: A;
}
