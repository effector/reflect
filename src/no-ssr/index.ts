import * as context from 'effector-react';
import { reflectFactory, reflectCreateFactory, variantFactory } from '../core';

export const reflect = reflectFactory(context);
export const createReflect = reflectCreateFactory(context);

export const variant = variantFactory(context);
