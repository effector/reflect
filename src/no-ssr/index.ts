import { useStore, useEvent } from 'effector-react';
import { reflectCreator, reflectFactory } from '../core';

export const reflect = reflectCreator({ useStore, useEvent });
export const createReflect = reflectFactory({ useStore, useEvent });
