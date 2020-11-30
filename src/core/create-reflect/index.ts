import { FC, ComponentClass } from 'react';
import { reflect, BindByProps } from '../reflect';

export function createReflect<Props>(view: FC<Props> | ComponentClass<Props>) {
  return <Bind extends BindByProps<Props> = BindByProps<Props>>(bind: Bind) =>
    reflect<Props, Bind>({ view, bind });
}
