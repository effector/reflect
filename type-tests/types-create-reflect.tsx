/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createReflect } from '@effector/reflect';
import { Button } from '@mantine/core';
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

// Edge-case: Mantine Button with weird polymorphic factory
{
  const clicked = createEvent<number>();

  const reflectButton = createReflect(Button<'button'>);

  const ReflectedButton = reflectButton({
    children: 'Click me',
    color: 'red',
    onClick: (e) => clicked(e.clientX),
  });

  <ReflectedButton component="button" />;
}
