import { useStore, useEvent } from 'effector-react/ssr';
import { reflectFactory, reflectCreator } from '../core';

export const reflect = reflectCreator({ useStore, useEvent });
export const createReflect = reflectFactory({ useStore, useEvent });
