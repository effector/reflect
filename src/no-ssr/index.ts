import * as context from 'effector-react';
import { reflectFactory, reflectCreateFactory, matchFactory } from '../core';

export const reflect = reflectFactory(context);
export const createReflect = reflectCreateFactory(context);

export const match = matchFactory(context);
