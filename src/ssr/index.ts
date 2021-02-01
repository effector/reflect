import { useStore, useEvent } from 'effector-react/ssr';
import { reflectCreateFactory, reflectFactory } from '../core';

export const reflect = reflectFactory({ useStore, useEvent });
export const createReflect = reflectCreateFactory({ useStore, useEvent });
