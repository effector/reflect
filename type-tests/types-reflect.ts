import React from 'react';
import { expectType } from 'tsd';
import { createStore, createEvent } from 'effector';
import { reflect } from '../src';

// basic reflect
{
  const Input: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
      color: 'red',
    },
  });

  expectType<React.FC>(ReflectedInput);
}

// reflect allows infer handlers for event.prepend
{
  const Input: React.FC<{
    value: string;
    onChange: (event: { target: { value: string } }) => void;
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed.prepend((e) => e.target.value),
    },
  });

  expectType<React.FC>(ReflectedInput);
}
