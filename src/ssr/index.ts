import { useStore } from 'effector-react/ssr';
import { setContext } from '../core';

setContext({ mode: 'ssr', context: { useStore } });
