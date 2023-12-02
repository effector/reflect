import { Event, is } from 'effector';
import { ComponentRef, createElement, forwardRef, useEffect, useRef } from 'react';

import { View } from './types';

type PropsToEvents<Props extends Record<string, any>> = {
  [key in keyof Props]?: Event<Props[key]>;
};

interface InterceptHooks<Events extends Partial<{ [key: string]: Event<any> }>> {
  update?: Events;
  mounted?: Events;
  unmounted?: Events;
}

export const intercept =
  <ViewProps extends Record<string, any>>(View: View<ViewProps>) =>
  <ExtendedProps extends NonNullable<unknown>>(
    propHooks: InterceptHooks<PropsToEvents<ViewProps & ExtendedProps>>,
  ) =>
    forwardRef<ComponentRef<View<ViewProps>>, ViewProps & ExtendedProps>(
      (props, ref) => {
        const propsRef = useRef<ViewProps & ExtendedProps>();

        useEffect(() => {
          Object.entries(props).map(([key, value]) => {
            const canTriggerMountEvent =
              is.event(propHooks.mounted?.[key]) && !propsRef.current;

            if (canTriggerMountEvent) {
              propHooks.mounted?.[key]?.(value);
            }

            const canTriggerUpdateEvent =
              propHooks.update &&
              is.event(propHooks?.update?.[key]) &&
              propsRef.current &&
              propsRef.current[key] !== value;

            if (canTriggerUpdateEvent) {
              propHooks.update?.[key]?.(value);
            }
          });

          propsRef.current = props;
        });

        useEffect(() => {
          return () => {
            if (!propsRef.current) {
              return;
            }

            Object.entries(propsRef.current).map(([key, value]) => {
              const canTriggerUnmountEvent =
                is.event(propHooks.unmounted?.[key]) && propsRef.current;

              if (canTriggerUnmountEvent) {
                propHooks.unmounted?.[key]?.(value);
              }
            });
          };
        }, []);

        const propsWithRef = Object.assign(
          {
            ref,
          },
          props,
        );

        return createElement(View, propsWithRef);
      },
    );
