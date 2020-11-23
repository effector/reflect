import { FC, ComponentClass } from 'react';
import { reflect } from '../reflect';

export function createReflect<Props>(view: FC<Props> | ComponentClass<Props>) {
  return <Bind>(bind: Bind) => reflect({ view, bind });
}
