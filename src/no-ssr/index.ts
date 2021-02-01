import { useStore, useEvent } from 'effector-react';
import { reflectFactory, reflectCreateFactory } from '../core';

export const reflect = reflectFactory({ useStore, useEvent });
export const createReflect = reflectCreateFactory({ useStore, useEvent });
