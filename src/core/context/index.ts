import { Store } from 'effector';

type Mode = 'browser' | 'ssr';

interface Context {
  useStore: <State>(_store: Store<State>) => State;
}

interface ContextRef {
  mode: Mode | null;
  context: Context | null;
  strict?: boolean;
}

export const contextRef: ContextRef = { mode: null, context: null };

export const setContext = (payload: {
  mode: Mode;
  context: Context;
  strict?: boolean;
}) => {
  const isAddBrowser = contextRef.mode === null && payload.mode === 'browser';
  const isAddSsr =
    (contextRef.mode === null || contextRef.mode === 'browser') &&
    payload.mode === 'ssr';

  if (isAddBrowser || isAddSsr) {
    contextRef.mode = payload.mode;
    contextRef.context = payload.context;
    contextRef.strict = payload.strict ?? false;
    return null;
  }

  if (contextRef.strict) {
    throw new Error(
      'Context insertion error. The context is already configured.',
    );
  }
};
