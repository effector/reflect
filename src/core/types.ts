import { FC, ComponentClass } from 'react';
import { Store, Event, Effect } from 'effector';
import { useUnit, useList } from 'effector-react';

export interface Ctx {
  useUnit: typeof useUnit;
  useList: typeof useList;
}

type Storify<Prop> = Omit<Store<Prop>, 'updates' | 'reset' | 'on' | 'off' | 'thru'>;

export type BindableProps<Props> = {
  [Key in keyof Props]?:
    | Storify<Props[Key]>
    | Props[Key];
};

export type View<T> = FC<T> | ComponentClass<T>;

type UnboundProps<Props, Bind> = Omit<Props, keyof Bind>;
type BoundProps<Props, Bind> = Omit<Props, keyof UnboundProps<Props, Bind>>;

export type PartialBoundProps<Props, Bind> = UnboundProps<Props, Bind> & Partial<BoundProps<Props, Bind>>;

export type Hook = (() => any) | Event<void> | Effect<void, any, any>;

export interface Hooks {
  mounted?: Hook;
  unmounted?: Hook;
}

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];
