import { useStore, useEvent } from 'effector-react';
import { reflectCreator, createReflectCreator } from '../core';

export const reflect = reflectCreator({ useStore, useEvent });
export const createReflect = createReflectCreator({ useStore, useEvent });
