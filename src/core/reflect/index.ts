import { FC, ComponentClass, createElement, useEffect } from 'react';
import { Store, combine, Event, Effect, is } from 'effector';
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

interface ReflectConfig<Props, Bind> {
  view: View<Props>;
  bind: Bind;
  hooks?: {
    mounted?: (() => void) | Event<void>;
    unmounted?: (() => void) | Event<void>;
  };
}

export function reflectCreator(context: ReflectCreatorContext) {
  return function reflect<
    Props,
    Bind extends BindByProps<Props> = BindByProps<Props>
  >(config: ReflectConfig<Props, Bind>): FC<PropsByBind<Props, Bind>> {
    type GenericEvent = Event<unknown> | Effect<unknown, unknown, unknown>;
    const events: Record<string, GenericEvent> = {};
    const stores: Record<string, Store<unknown>> = {};
    const data: Record<string, unknown> = {};

    for (const key in config.bind) {
      const value = config.bind[key];

      if (is.event(value) || is.effect(value)) {
        events[key] = value;
      } else if (is.store(value)) {
        stores[key] = value;
      } else {
        data[key] = value;
      }
    }

    const $bind = Object.keys(stores).length > 0 ? combine(stores) : null;

    const hookMounted = config.hooks ? config.hooks.mounted : null;
    const mounted = hookMounted
      ? () =>
          useEffect(() => {
            hookMounted();
          }, [])
      : () => {};

    const hookUnmounted = config.hooks ? config.hooks.unmounted : null;
    const unmounted = hookUnmounted
      ? () =>
          useEffect(() => {
            return () => {
              hookUnmounted();
            };
          }, [])
      : () => {};

    return (props) => {
      const storeProps = $bind ? context.useStore($bind) : ({} as Props);
      const eventsProps = context.useEvent(events);
      const elementProps = {
        ...storeProps,
        ...eventsProps,
        ...data,
        ...props,
      } as Props;

      mounted();
      unmounted();

      return createElement(config.view, elementProps);
    };
  };
}
