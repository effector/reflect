/* eslint-disable @typescript-eslint/ban-ts-comment */
import { list } from '@effector/reflect';
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
