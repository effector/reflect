/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { expectType } from 'tsd';
import { createStore, createEvent } from 'effector';
import { list } from '../src';

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

// list allows not to set both `bind` and `mapItem` if source type matches props
{
  const Item: React.FC<{
    id: number;
    value: string;
  }> = () => null;
  const $items = createStore<{ id: number; value: string }[]>([]);

  // does not work yet
  const List = list({
    source: $items,
    view: Item,
  });

  expectType<React.FC>(List);
}
