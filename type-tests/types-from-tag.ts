/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fromTag, reflect } from '@effector/reflect';
import { createEvent, createStore } from 'effector';
import {
  ChangeEvent,
  ClassAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactNode,
} from 'react';
import { expectType } from 'tsd';

// fromTag creates a valid component
{
  const Input = fromTag('input');

  expectType<
    (
      props: PropsWithChildren<
        ClassAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement>
      >,
    ) => ReactNode
  >(Input);
}

// fromTag compoment is allowed in reflect
{
  const Input = fromTag('input');

  const $value = createStore('');

  const View = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: (e) => {
        const strValue = e.target.value;

        strValue.trim();
      },
    },
  });
}

// inline fromTag is supported
{
  const $value = createStore('');

  const handleChange = createEvent<string>();

  const View = reflect({
    view: fromTag('input'),
    bind: {
      type: 'text',
      value: $value,
      /**
       * Type inference for inline fromTag is slightly worse, than for non-inline version :(
       *
       * I don't known why, but in this case `onChange` argument type must be type explicitly,
       * type inference doesn't work here
       *
       * TypeScript won't allow invalid value,
       * but also won't infer correct type for us here, like it does with non-inline usage :shrug:
       */
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        handleChange(e.target.value);
      },
    },
  });
}

// invalid props are not supported
{
  const Input = fromTag('input');

  const $value = createStore({});

  const View = reflect({
    view: Input,
    bind: {
      // @ts-expect-error
      value: $value,
      // @ts-expect-error
      onChange: (e: string) => {},
    },
  });

  const View2 = reflect({
    view: fromTag('input'),
    bind: {
      // @ts-expect-error
      value: $value,
      // @ts-expect-error
      onChange: 'kek',
    },
  });
}
