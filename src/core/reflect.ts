import { Effect, Event, is, Store } from 'effector';
import React from 'react';

import {
  BindableProps,
  Context,
  Hook,
  Hooks,
  PartialBoundProps,
  View,
} from './types';

export interface ReflectConfig<
  Props,
  Bind extends BindableProps<Props>,
  Scoped = false,
> {
  view: View<Props>;
  bind: Bind;
  hooks?: Hooks;
  forceScope?: Scoped extends true ? never : boolean;
}

export function reflectCreateFactory<Scoped>(context: Context) {
  const reflect = reflectFactory<Scoped>(context);

  return function createReflect<Props>(view: View<Props>) {
    return <Bind extends BindableProps<Props> = BindableProps<Props>>(
      bind: Bind,
      params?: Omit<ReflectConfig<Props, Bind, Scoped>, 'view' | 'bind'>,
    ) => reflect<Props, Bind>({ view, bind, ...params });
  };
}

export function reflectFactory<Scoped>(context: Context) {
  return function reflect<
    Props,
    Bind extends BindableProps<Props> = BindableProps<Props>,
  >(
    config: ReflectConfig<Props, Bind, Scoped>,
  ): React.ExoticComponent<PartialBoundProps<Props, Bind>> {
    const { stores, events, data, forceScope } = sortProps(config);

    return React.forwardRef((props, ref) => {
      const storeProps = context.useUnit(stores, { forceScope });
      const eventsProps = context.useUnit(events, { forceScope });

      const elementProps: Props = Object.assign(
        { ref },
        storeProps,
        eventsProps,
        data,
        props,
      );

      const mounted = wrapToHook(config.hooks?.mounted, context, forceScope);
      const unmounted = wrapToHook(config.hooks?.unmounted, context, forceScope);

      React.useEffect(() => {
        if (mounted) mounted();

        return () => {
          if (unmounted) unmounted();
        };
      }, []);

      return React.createElement(config.view as any, elementProps as any);
    });
  };
}

function sortProps<Props, Bind extends BindableProps<Props> = BindableProps<Props>>(
  config: ReflectConfig<Props, Bind>,
) {
  type GenericEvent = Event<unknown> | Effect<unknown, unknown, unknown>;

  const events: Record<string, GenericEvent> = {};
  const stores: Record<string, Store<unknown>> = {};
  const data: Record<string, unknown> = {};

  const forceScope = config.forceScope;

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

  return { events, stores, data, forceScope };
}

function wrapToHook(hook: Hook | void, context: Context, forceScope?: boolean) {
  if (hookDefined(hook)) {
    return context.useUnit(hook as Event<void>, { forceScope });
  }

  return hook;
}

function hookDefined(hook: Hook | void): hook is Hook {
  return Boolean(hook && (is.event(hook) || is.effect(hook)));
}
