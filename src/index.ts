import * as context from 'effector-react';

import {
  fromTag,
  listFactory,
  reflectCreateFactory,
  reflectFactory,
  variantFactory,
} from './core';

export const reflect = reflectFactory(context);
export const createReflect = reflectCreateFactory(context);

export const variant = variantFactory(context);

export const list = listFactory(context);

export { fromTag };
