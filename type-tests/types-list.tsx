/* eslint-disable @typescript-eslint/ban-ts-comment */
import { list } from '@effector/reflect';
import { Button } from '@mantine/core';
import { createEvent, createStore } from 'effector';
import React from 'react';
import { expectType } from 'tsd';

// basic usage of list
{
  const Item: React.FC<{
    id: number;
    value: string;
    onChange: (update: [id: string, newValue: string]) => void;
  }> = () => null;
  const changed = createEvent<[id: string, newValue: string]>();
  const $items = createStore<{ id: number; value: string }[]>([]);

  const List = list({
    source: $items,
    view: Item,
    bind: {
      onChange: changed,
    },
    mapItem: {
      id: (item) => item.id,
      value: (item) => item.value,
    },
    getKey: (item) => item.id,
  });

  expectType<React.FC>(List);
}

// list has default option for getKey, so this should not be required
{
  const Item: React.FC<{
    id: number;
    value: string;
    onChange: (update: [id: string, newValue: string]) => void;
  }> = () => null;
  const changed = createEvent<[id: string, newValue: string]>();
  const $items = createStore<{ id: number; value: string }[]>([]);

  const List = list({
    source: $items,
    view: Item,
    bind: {
      onChange: changed,
    },
    mapItem: {
      id: (item) => item.id,
      value: (item) => item.value,
    },
  });

  expectType<React.FC>(List);
}

// list highlightes missing props for items view
// since missing props cannot be added at react later (contrary to reflect)
{
  const Item: React.FC<{
    id: number;
    value: string;
    onChange: (update: [id: string, newValue: string]) => void;
  }> = () => null;
  const $items = createStore<{ id: number; value: string }[]>([]);

  const List = list({
    source: $items,
    view: Item,
    bind: {},
    // @ts-expect-error
    mapItem: {
      id: (item) => item.id,
      value: (item) => item.value,
    },
  });

  expectType<React.FC>(List);
}

// list allows optional bind
{
  const Item: React.FC<{
    id: number;
    value: string;
    onChange: (update: [id: string, newValue: string]) => void;
  }> = () => null;
  const $items = createStore<{ id: number; value: string }[]>([]);

  const List = list({
    source: $items,
    view: Item,
    mapItem: {
      id: (item) => item.id,
      value: (item) => item.value,
      onChange: (_item) => (_params) => {},
    },
  });

  expectType<React.FC>(List);
}

// list allows optional mapItem
{
  const Item: React.FC<{
    id: number;
    value: string;
    common: string;
  }> = () => null;
  const $common = createStore<string>('common prop');
  const $items = createStore<{ id: number; value: string }[]>([]);

  const List = list({
    source: $items,
    bind: {
      common: $common,
    },
    view: Item,
  });

  expectType<React.FC>(List);
}

// list does not allow to set prop in mapItem, if it is already set in bind
{
  const Item: React.FC<{
    id: number;
    value: string;
    common: string;
  }> = () => null;
  const $common = createStore<string>('common prop');
  const $items = createStore<{ id: number; value: string }[]>([]);

  const List = list({
    source: $items,
    bind: {
      common: $common,
    },
    mapItem: {
      // @ts-expect-error
      common: () => 'common prop',
    },
    view: Item,
  });

  expectType<React.FC>(List);
}

// list allows not to set both `bind` and `mapItem` if source type matches with props
{
  const Item: React.FC<{
    id: number;
    value: string;
  }> = () => null;
  const $items = createStore<{ id: number; value: string }[]>([]);

  const List = list({
    source: $items,
    view: Item,
  });

  expectType<React.FC>(List);
}

// list doesn't allow not to set both `bind` and `mapItem` if source type doesn't matches with props
{
  const Item: React.FC<{
    id: number;
    value: string;
  }> = () => null;
  const $items = createStore<{ biba: string; boba: string }[]>([]);

  // @ts-expect-error
  const List = list({
    source: $items,
    view: Item,
  });

  expectType<React.FC>(List);
}

// Edge-case: Mantine Button with weird polymorphic factory
{
  const clicked = createEvent<number>();

  const List = list({
    source: createStore<string[]>([]),
    view: Button<'button'>,
    mapItem: {
      children: (item) => item,
      onClick: (_item) => (e) => clicked(e.clientX),
    },
  });

  expectType<React.FC>(List);
}

// --- review B2: a key in both `mapItem` and `mapProps` is a type error -------
// Note: this is caught for unannotated arrow functions. If the user explicitly
// annotates the `item` parameter, TS's excess-property checking is bypassable
// (known TS limitation with mapped-type `extends` constraints).

// B2 negative: same key in mapItem and mapProps — collision
{
  const Item: React.FC<{ id: string; label?: string }> = () => null;
  const $name = createStore<string>('');
  const $items = createStore<{ id: string }[]>([{ id: 'a' }]);

  list({
    source: $items,
    view: Item,
    bind: {},
    mapItem: {
      id: (item) => item.id,
      // @ts-expect-error - `label` is in mapProps; mapItem omits it
      label: (item) => item.id,
    },
    mapProps: { label: { source: $name, fn: (n) => n } },
  });
}

// B2 positive: disjoint keys in mapItem and mapProps — compiles
{
  const Item: React.FC<{ id: string; label?: string }> = () => null;
  const $name = createStore<string>('');
  const $items = createStore<{ id: string }[]>([{ id: 'a' }]);

  const List = list({
    source: $items,
    view: Item,
    bind: {},
    mapItem: { id: (item) => item.id },
    mapProps: { label: { source: $name, fn: (n) => n } },
  });

  expectType<React.FC>(List);
}
