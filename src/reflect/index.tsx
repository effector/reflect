import React, { FC, ComponentClass } from 'react';
import { Store, combine } from 'effector';
import { useStore } from 'effector-react';

type ShapeProps<Props> = {
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
  Bind extends ShapeProps<Props> = ShapeProps<Props>
>(payload: { view: View<Props>; bind: Bind }) {
  const View = payload.view;

  const $bind = combine(payload.bind);

  const Wrapper: FC<PropsByBind<Props, Bind>> = (props) => {
    const storeProps = useStore($bind);
    const combineProps = { ...storeProps, ...props } as Props;

    return <View {...combineProps} />;
  };

  return Wrapper;
}
