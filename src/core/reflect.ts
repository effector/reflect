import React from 'react';
import { Store, Event, Effect, is } from 'effector';

import {
  Context,
  View,
  BindableProps,
  PartialBoundProps,
  Hooks,
  Hook,
} from './types';

export interface ReflectConfig<Props, Bind extends BindableProps<Props>> {
  view: View<Props>;
  bind: Bind;
  hooks?: Hooks;
}

export function reflectCreateFactory(context: Context) {
  const reflect = reflectFactory(context);

  return function createReflect<Props>(view: View<Props>) {
    return <Bind extends BindableProps<Props> = BindableProps<Props>>(
      bind: Bind,
      params?: Pick<ReflectConfig<Props, Bind>, 'hooks'>,
    ) => reflect<Props, Bind>({ view, bind, ...params });
  };
}

export function reflectFactory(context: Context) {
  return function reflect<
    Props,
    Bind extends BindableProps<Props> = BindableProps<Props>
  >(
    config: ReflectConfig<Props, Bind>,
  ): React.FC<PartialBoundProps<Props, Bind>> {
    const { stores, events, data } = sortProps(config);

    return (props) => {
      const storeProps = context.useUnit(stores);
      const eventsProps = context.useUnit(events);

      const elementProps: Props = Object.assign(
        {},
        storeProps,
        eventsProps,
        data,
        props,
      );

      const mounted = wrapToHook(config.hooks?.mounted, context);
      const unmounted = wrapToHook(config.hooks?.unmounted, context);

      React.useEffect(() => {
        if (mounted) mounted();

        return () => {
          if (unmounted) unmounted();
        };
      }, []);

      return React.createElement(config.view, elementProps);
    };
  };
}

function sortProps<
  Props,
  Bind extends BindableProps<Props> = BindableProps<Props>
>(config: ReflectConfig<Props, Bind>) {
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

  return { events, stores, data };
}

function wrapToHook(hook: Hook | void, context: Context) {
  if (hookDefined(hook)) {
    return context.useUnit(hook as Event<void>);
  }

  return hook;
}

function hookDefined(hook: Hook | void): hook is Hook {
  return Boolean(hook && (is.event(hook) || is.effect(hook)));
}
