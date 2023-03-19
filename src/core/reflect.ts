import { Effect, Event, is, Store } from 'effector';
import { useUnit } from 'effector-react';
import React from 'react';

import { BindableProps, Hook, Hooks, PartialBoundProps, View } from './types';

export interface ReflectConfig<Props, Bind extends BindableProps<Props>> {
  view: View<Props>;
  bind: Bind;
  hooks?: Hooks;
}

const isClientSide = typeof window !== 'undefined';

export function reflectCreateFactory() {
  const reflect = reflectFactory();

  return function createReflect<Props>(view: View<Props>) {
    return <Bind extends BindableProps<Props> = BindableProps<Props>>(
      bind: Bind,
      params?: Pick<ReflectConfig<Props, Bind>, 'hooks'>,
    ) => reflect<Props, Bind>({ view, bind, ...params });
  };
}

export function reflectFactory() {
  return function reflect<
    Props,
    Bind extends BindableProps<Props> = BindableProps<Props>,
  >(config: ReflectConfig<Props, Bind>): React.FC<PartialBoundProps<Props, Bind>> {
    const { stores, events, data } = sortProps(config);

    return (props) => {
      const storeProps = useUnit(stores, { forceScope: !isClientSide });
      const eventsProps = useUnit(events, { forceScope: !isClientSide });

      const elementProps: Props = Object.assign(
        {},
        storeProps,
        eventsProps,
        data,
        props,
      );

      const mounted = wrapToHook(config.hooks?.mounted);
      const unmounted = wrapToHook(config.hooks?.unmounted);

      React.useEffect(() => {
        if (mounted) mounted();

        return () => {
          if (unmounted) unmounted();
        };
      }, []);

      return React.createElement(config.view as any, elementProps as any);
    };
  };
}

function sortProps<Props, Bind extends BindableProps<Props> = BindableProps<Props>>(
  config: ReflectConfig<Props, Bind>,
) {
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

function wrapToHook(hook: Hook | void) {
  if (hookDefined(hook)) {
    return useUnit(hook as Event<void>, { forceScope: !isClientSide });
  }

  return hook;
}

function hookDefined(hook: Hook | void): hook is Hook {
  return Boolean(hook && (is.event(hook) || is.effect(hook)));
}
