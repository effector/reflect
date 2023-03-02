import * as effectorReactSSR from 'effector-react/scope';

import {
  listFactory,
  reflectCreateFactory,
  reflectFactory,
  variantFactory,
} from './core';

export const reflect = reflectFactory(effectorReactSSR);
export const createReflect = reflectCreateFactory(effectorReactSSR);

export const variant = variantFactory(effectorReactSSR);

export const list = listFactory(effectorReactSSR);
