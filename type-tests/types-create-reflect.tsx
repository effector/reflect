/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createReflect } from '@effector/reflect';
import { createEvent, createStore } from 'effector';
import React from 'react';
import { expectType } from 'tsd';

// basic createReflect
{
  const Input: React.FC<{
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

  expectType<React.FC>(ReflectedInput);
}
