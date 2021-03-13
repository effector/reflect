import React, { FC } from 'react';
import { createStore, createEvent } from 'effector';

import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { reflectList } from './index';

const List: FC = (props) => {
  return <ul>{props.children}</ul>;
};

const ListItem: FC<{ title: string; prefix?: string }> = (props) => {
  return <li>{`${props.prefix || ''}${props.title}`}</li>;
};

test('relfect-list: renders list from store', async () => {
  const $todos = createStore<{ title: string; body: string }[]>([
    { title: 'Buy milk', body: 'Text' },
    { title: 'Clean room', body: 'Text 2' },
    { title: 'Do homework', body: 'Text 3' },
  ]);

  const mounted = createEvent<void>();

  const fn = jest.fn(() => {});

  mounted.watch(fn);

  const Items = reflectList({
    source: $todos,
    view: ListItem,
    bind: {},
    hooks: { mounted },
    mapItem: {
      title: (todo) => todo.title,
    },
  });

  const container = render(
    <List>
      <Items />
    </List>,
  );

  expect(fn.mock.calls.length).toBe(3);

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Clean room</li><li>Do homework</li></ul>"',
  );
});

test('reflect-list: rerenders on list changes', async () => {
  const addTodo = createEvent<{ title: string; body: string }>();
  const removeTodo = createEvent<string>();
  const $todos = createStore<{ title: string; body: string }[]>([
    { title: 'Buy milk', body: 'Text' },
    { title: 'Clean room', body: 'Text 2' },
    { title: 'Do homework', body: 'Text 3' },
  ]);

  $todos
    .on(addTodo, (todos, next) => todos.concat(next))
    .on(removeTodo, (todos, toRemove) =>
      todos.filter((todo) => todo.title !== toRemove),
    );

  const Items = reflectList({
    source: $todos,
    view: ListItem,
    bind: {},
    mapItem: {
      title: (todo) => todo.title,
    },
  });

  const container = render(
    <List>
      <Items />
    </List>,
  );

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Clean room</li><li>Do homework</li></ul>"',
  );

  act(() => {
    addTodo({ title: 'Write tests', body: 'Text 4' });
  });

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Clean room</li><li>Do homework</li><li>Write tests</li></ul>"',
  );

  act(() => {
    removeTodo('Clean room');
  });

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Do homework</li><li>Write tests</li></ul>"',
  );
});

test('reflect-list: does not breaks reflect`s bind', async () => {
  const $todos = createStore<{ title: string; body: string }[]>([
    { title: 'Buy milk', body: 'Text' },
    { title: 'Clean room', body: 'Text 2' },
    { title: 'Do homework', body: 'Text 3' },
  ]);

  const $prefix = createStore<string>('');
  const prefix = createEvent<string>();

  $prefix.on(prefix, (_, next) => next);

  const Items = reflectList({
    source: $todos,
    view: ListItem,
    bind: {
      prefix: $prefix,
    },
    mapItem: {
      title: (todo) => todo.title,
    },
  });

  const container = render(
    <List>
      <Items />
    </List>,
  );

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Clean room</li><li>Do homework</li></ul>"',
  );

  act(() => {
    prefix('Task: ');
  });

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Task: Buy milk</li><li>Task: Clean room</li><li>Task: Do homework</li></ul>"',
  );

  act(() => {
    prefix('');
  });

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Clean room</li><li>Do homework</li></ul>"',
  );
});
