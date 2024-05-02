import { createReflect } from '@effector/reflect';
import { createEvent, createStore } from 'effector';
import { FC } from 'react';
import { expectType } from 'tsd';

// basic createReflect
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const reflectInput = createReflect(Input);

  const ReflectedInput = reflectInput({
    value: $value,
    onChange: changed,
    color: 'red',
  });

  expectType<FC>(ReflectedInput);
}
