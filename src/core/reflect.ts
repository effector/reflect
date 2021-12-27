import React from 'react';
import { Store, combine, Event, Effect, is } from 'effector';

import {
  ReflectCreatorContext,
  View,
  BindByProps,
  PropsByBind,
  Hooks,
  Hook,
} from './types';

export interface ReflectConfig<Props, Bind extends BindByProps<Props>> {
  view: View<Props>;
  bind: Bind;
  hooks?: Hooks;
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
  >(config: ReflectConfig<Props, Bind>): React.FC<PropsByBind<Props, Bind>> {
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

      const hookMounted = readHook(config.hooks?.mounted, context);
      const hookUnmounted = readHook(config.hooks?.unmounted, context);

      React.useEffect(() => {
        if (hookMounted) hookMounted();
        return () => {
          if (hookUnmounted) hookUnmounted();
        };
      }, []);

      return React.createElement(config.view, elementProps);
    };
  };
}

function readHook(
  hook: Hook | undefined,
  context: ReflectCreatorContext,
): (() => void) | void {
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
