import * as context from 'effector-react/ssr';
import { matchFactory, reflectCreateFactory, reflectFactory } from '../core';

export const reflect = reflectFactory(context);
export const createReflect = reflectCreateFactory(context);

export const match = matchFactory(context);
