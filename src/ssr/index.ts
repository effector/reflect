import * as context from 'effector-react/ssr';
import { variantFactory, reflectCreateFactory, reflectFactory, listFactory } from '../core';

export const reflect = reflectFactory(context);
export const createReflect = reflectCreateFactory(context);

export const variant = variantFactory(context);

export const list = listFactory(context);
