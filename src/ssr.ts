import * as effectorReactSSR from 'effector-react/ssr';
import {
  variantFactory,
  reflectCreateFactory,
  reflectFactory,
  listFactory,
  casesFactory,
} from './core';

export const reflect = reflectFactory(effectorReactSSR);
export const createReflect = reflectCreateFactory(effectorReactSSR);

export const variant = variantFactory(effectorReactSSR);
export const cases = casesFactory(effectorReactSSR);

export const list = listFactory(effectorReactSSR);
