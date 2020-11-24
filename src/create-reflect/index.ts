import { FC, ComponentClass } from 'react';
import { reflect, ShapeProps } from '../reflect';

export function createReflect<Props>(view: FC<Props> | ComponentClass<Props>) {
  return <Bind extends ShapeProps<Props> = ShapeProps<Props>>(bind: Bind) =>
    reflect<Props, Bind>({ view, bind });
}
