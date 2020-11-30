import { useStore } from 'effector-react';
import { setContext, reflect, createReflect } from '../core';

setContext({ mode: 'browser', context: { useStore } });

export { reflect, createReflect };
