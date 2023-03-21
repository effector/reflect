import {
  Context,
  listFactory,
  reflectCreateFactory,
  reflectFactory,
  variantFactory,
} from './core';

const scopeContext: Context = { forceScope: true };

export const reflect = reflectFactory(scopeContext);
export const createReflect = reflectCreateFactory(scopeContext);
export const variant = variantFactory(scopeContext);
export const list = listFactory(scopeContext);
