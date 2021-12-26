import { FC, ComponentClass } from 'react';
import { Store, Event, Effect } from 'effector';
import { useEvent, useList, useStore } from 'effector-react';

export interface ReflectCreatorContext {
  useStore: typeof useStore;
  useEvent: typeof useEvent;
  useList: typeof useList;
}

export type BindByProps<Props> = {
  [Key in keyof Props]?:
    | Omit<Store<Props[Key]>, 'updates' | 'reset' | 'on' | 'off' | 'thru'>
    | Props[Key];
};

export type View<T> = FC<T> | ComponentClass<T>;

export type PropsByBind<Props, Bind> = Omit<Props, keyof Bind> &
  Partial<Omit<Props, keyof Omit<Props, keyof Bind>>>;

export type Hook = (() => any) | Event<void> | Effect<void, any, any>;

export interface Hooks {
  mounted?: Hook;
  unmounted?: Hook;
}

export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];
