import { FC, ComponentClass, createElement } from 'react';
import { Store, combine } from 'effector';

import { contextRef } from '../context';

export type BindByProps<Props> = {
  [Key in keyof Props]?:
    | Omit<Store<Props[Key]>, 'updates' | 'reset' | 'on' | 'off' | 'thru'>
    | Props[Key];
};

type View<T> = FC<T> | ComponentClass<T>;

type PropsOmitBind<Props, Bind> = Omit<Props, keyof Bind>;

type PropsPartialOmit<Props, PropsOmit> = Partial<Omit<Props, keyof PropsOmit>>;

type PropsByBind<
  Props,
  Bind,
  PropsOmit extends PropsOmitBind<Props, Bind> = PropsOmitBind<Props, Bind>,
  PropsPartion extends PropsPartialOmit<Props, PropsOmit> = PropsPartialOmit<
    Props,
    PropsOmit
  >
> = PropsOmit & PropsPartion;

export function reflect<
  Props,
  Bind extends BindByProps<Props> = BindByProps<Props>
>(_payload: { view: View<Props>; bind: Bind }): FC<PropsByBind<Props, Bind>>;

export function reflect<
  Props,
  Bind extends BindByProps<Props> = BindByProps<Props>
>(payload: { view: View<Props>; bind: Bind }) {
  const $bind = combine(payload.bind);

  if (contextRef.context === null) {
    throw new Error("Context didn't context");
  }

  const wrapper = (props: Props) => {
    const storeProps = contextRef.context?.useStore($bind);

    return createElement(payload.view, { ...storeProps, ...props });
  };

  return wrapper;
}
