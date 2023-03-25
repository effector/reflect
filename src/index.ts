import {
  listFactory,
  reflectCreateFactory,
  reflectFactory,
  variantFactory,
} from './core';

export const reflect = reflectFactory();
export const createReflect = reflectCreateFactory();
export const variant = variantFactory();
export const list = listFactory();
