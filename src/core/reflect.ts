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

type Hook = (() => any) | Event<void> | Effect<void, any, any>;

export interface ReflectConfig<Props, Bind extends BindByProps<Props>> {
  view: View<Props>;
  bind: Bind;
  hooks?: {
    mounted?: Hook;
    unmounted?: Hook;
  };
}

export function reflectCreateFactory(context: ReflectCreatorContext) {
  const reflect = reflectFactory(context);

  return function createReflect<Props>(view: View<Props>) {
    return <Bind extends BindByProps<Props> = BindByProps<Props>>(
      bind: Bind,
      params?: Pick<ReflectConfig<Props, Bind>, 'hooks'>,
    ) => reflect<Props, Bind>({ view, bind, ...params });
  };
}

export function reflectFactory(context: ReflectCreatorContext) {
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

    const $bind = isEmpty(stores) ? null : combine(stores);

    const hookMounted = readHook(config.hooks?.mounted, context);
    const useMounted = hookMounted
      ? () =>
          useEffect(() => {
            hookMounted();
          }, [])
      : () => {};

    const hookUnmounted = readHook(config.hooks?.unmounted, context);
    const useUnmounted = hookUnmounted
      ? () => useEffect(() => () => hookUnmounted(), [])
      : () => {};

    return (props) => {
      const storeProps = $bind ? context.useStore($bind) : ({} as Props);
      const eventsProps = context.useEvent(events);
      const elementProps: Props = Object.assign(
        {},
        storeProps,
        eventsProps,
        data,
        props,
      );

      useMounted();
      useUnmounted();

      return createElement(config.view, elementProps);
    };
  };
}

function readHook(
  hook: Hook | undefined,
  context: ReflectCreatorContext,
): (() => void) | undefined {
  if (hook) {
    if (is.event(hook) || is.effect(hook)) {
      return context.useEvent(hook as Event<void>);
    }
    return hook;
  }
}

function isEmpty(map: Record<string | number, unknown>): boolean {
  return Object.keys(map).length === 0;
}
