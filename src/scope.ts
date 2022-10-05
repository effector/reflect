import * as effectorReactSSR from 'effector-react/scope';
import {
  variantFactory,
  reflectCreateFactory,
  reflectFactory,
  listFactory,
} from './core';

export const reflect = reflectFactory(effectorReactSSR);
export const createReflect = reflectCreateFactory(effectorReactSSR);

export const variant = variantFactory(effectorReactSSR);

export const list = listFactory(effectorReactSSR);


export const reflectA = reflectFactory(effectorReactSSR);
export const createReflectA = reflectCreateFactory(effectorReactSSR);

export const variantA = variantFactory(effectorReactSSR);

export const listA = listFactory(effectorReactSSR);

export const reflectB = reflectFactory(effectorReactSSR);
export const createReflectB = reflectCreateFactory(effectorReactSSR);

export const variantB = variantFactory(effectorReactSSR);

export const listB = listFactory(effectorReactSSR);
