import * as context from 'effector-react';
import {
  reflectFactory,
  listFactory,
  reflectCreateFactory,
  variantFactory,
  casesFactory,
} from './core';

export const reflect = reflectFactory(context);
export const createReflect = reflectCreateFactory(context);

export const variant = variantFactory(context);
export const cases = casesFactory(context);

export const list = listFactory(context);
