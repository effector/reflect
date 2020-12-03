/* eslint-disable @typescript-eslint/no-explicit-any */

import { FC, ComponentClass, createElement } from 'react';
import { Store, combine, Event, is } from 'effector';
import { useEvent, useStore } from 'effector-react';

export type BindByProps<Props> = {
  [Key in keyof Props]?:
    | Omit<Store<Props[Key]>, 'updates' | 'reset' | 'on' | 'off' | 'thru'>
    | Props[Key];
};

export type View<T> = FC<T> | ComponentClass<T>;

export type PropsByBind<Props, Bind> = Omit<Props, keyof Bind> &
  Partial<Omit<Props, keyof Omit<Props, keyof Bind>>>;

export interface ReflectCreatorContext {
  useStore: typeof useStore;
  useEvent: typeof useEvent;
}

export function reflectCreator(context: ReflectCreatorContext) {
  return function reflect<
    Props,
    Bind extends BindByProps<Props> = BindByProps<Props>
  >(payload: { view: View<Props>; bind: Bind }): FC<PropsByBind<Props, Bind>> {
    const bind = payload.bind;
    const events: Record<string, Event<unknown>> = {};

    for (const key in bind) {
      const value = bind[key];

      if (is.event(value)) {
        events[key] = value;
      }
    }

    const $bind = combine(payload.bind);

    return (props) => {
      const storeProps = context.useStore($bind);
      const eventsProps = context.useEvent(events);
      const elementProps = { ...storeProps, ...eventsProps, ...props } as Props;

      return createElement(payload.view, elementProps);
    };
  };
}
