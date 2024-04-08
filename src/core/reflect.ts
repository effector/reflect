import { Effect, Event, is, scopeBind, Store } from 'effector';
import { useProvidedScope } from 'effector-react';
import React, { PropsWithoutRef, RefAttributes } from 'react';

import { BindProps, Context, Hooks, UseUnitConifg, View } from './types';

export interface ReflectConfig<Props, Bind extends BindProps<Props>> {
  view: View<Props>;
  bind: Bind;
  hooks?: Hooks<Props>;
  useUnitConfig?: UseUnitConifg;
}

export function reflectCreateFactory(context: Context) {
  const reflect = reflectFactory(context);

  return function createReflect<Props>(view: View<Props>) {
    return <Bind extends BindProps<Props> = BindProps<Props>>(
      bind: Bind,
      params?: Pick<ReflectConfig<Props, Bind>, 'hooks' | 'useUnitConfig'>,
    ) => reflect<Props, Bind>({ view, bind, ...params });
  };
}

export function reflectFactory(context: Context) {
  return function reflect<Props, Bind extends BindProps<Props> = BindProps<Props>>(
    config: ReflectConfig<Props, Bind>,
  ): React.ExoticComponent<PropsWithoutRef<Props> & RefAttributes<unknown>> {
    const { stores, events, data, functions } = sortProps(config.bind);
    const hooks = sortProps(config.hooks || {});

    return React.forwardRef((props: Props, ref) => {
      const storeProps = context.useUnit(stores, config.useUnitConfig);
      const eventsProps = context.useUnit(events as any, config.useUnitConfig);
      const functionProps = useBoundFunctions(functions);

      const finalProps: any = {};

      if (ref) {
        finalProps.ref = ref;
      }

      const elementProps: Props = Object.assign(
        finalProps,
        storeProps,
        eventsProps,
        data,
        functionProps,
        props,
      );

      const eventsHooks = context.useUnit(hooks.events as any, config.useUnitConfig);
      const functionsHooks = useBoundFunctions(hooks.functions);

      React.useEffect(() => {
        const hooks: Hooks<Props> = Object.assign({}, functionsHooks, eventsHooks);

        if (hooks.mounted) {
          hooks.mounted(elementProps);
        }

        return () => {
          if (hooks.unmounted) {
            hooks.unmounted(elementProps);
          }
        };
      }, [eventsHooks, functionsHooks]);

      return React.createElement(config.view as any, elementProps as any);
    });
  };
}

function sortProps<T extends object>(props: T) {
  type GenericEvent = Event<unknown> | Effect<unknown, unknown, unknown>;

  const events: Record<string, GenericEvent> = {};
  const stores: Record<string, Store<unknown>> = {};
  const data: Record<string, unknown> = {};
  const functions: Record<string, Function> = {};

  for (const key in props) {
    const value = props[key];

    if (is.event(value) || is.effect(value)) {
      events[key] = value;
    } else if (is.store(value)) {
      stores[key] = value;
    } else if (typeof value === 'function') {
      functions[key] = value;
    } else {
      data[key] = value;
    }
  }

  return { events, stores, data, functions };
}

function useBoundFunctions(functions: Record<string, Function>) {
  const scope = useProvidedScope();

  return React.useMemo(() => {
    const boundFunctions: Record<string, Function> = {};

    for (const key in functions) {
      const fn = functions[key];

      boundFunctions[key] = scopeBind(fn, { scope: scope || undefined, safe: true });
    }

    return boundFunctions;
  }, [scope, functions]);
}
