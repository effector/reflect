import * as effectorReactSSR from 'effector-react/scope';

import {
  listFactory,
  reflectCreateFactory,
  reflectFactory,
  variantFactory,
} from './core';

console.error(
  '`@effector/reflect/scope` is deprecated, use main `@effector/reflect` package instead',
);

export const reflect = reflectFactory(effectorReactSSR);
export const createReflect = reflectCreateFactory(effectorReactSSR);

export const variant = variantFactory(effectorReactSSR);

export const list = listFactory(effectorReactSSR);
