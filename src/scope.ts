import * as effectorReactSSR from 'effector-react/scope';

import {
  listFactory,
  reflectCreateFactory,
  reflectFactory,
  variantFactory,
} from './core';

export const reflect = reflectFactory<true>(effectorReactSSR);
export const createReflect = reflectCreateFactory<true>(effectorReactSSR);

export const variant = variantFactory<true>(effectorReactSSR);

export const list = listFactory<true>(effectorReactSSR);
