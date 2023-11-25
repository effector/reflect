import { expectType } from 'tsd';

import { reflect } from '../src/scope';

// reflect/scope does not allow passing forceScope
{
  const View: React.FC<{ value: string }> = () => null;

  const ReflectedView = reflect({
    view: View,
    bind: { value: '' },
    // @ts-expect-error
    forceScope: true,
  });

  expectType<React.FC>(ReflectedView);
}
