import * as context from 'effector-react/ssr';
import { variantFactory, reflectCreateFactory, reflectFactory, reflectListFactory } from '../core';

export const reflect = reflectFactory(context);
export const createReflect = reflectCreateFactory(context);

export const variant = variantFactory(context);

export const reflectList = reflectListFactory(context);
