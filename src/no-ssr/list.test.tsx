import React, { FC } from 'react';
import { createStore, createEvent } from 'effector';

import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { list } from './index';

const List: FC = (props) => {
  return <ul>{props.children}</ul>;
};

const ListItem: FC<{ title: string; prefix?: string }> = (props) => {
  return (
    <li data-testid={props.title} data-prefix={props.prefix || ''}>{`${
      props.prefix || ''
    }${props.title}`}</li>
  );
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

  const Items = list({
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

  const renderedIds = container
    .getAllByRole('listitem')
    .map((item) => item.dataset.testid);

  expect(fn.mock.calls.length).toBe($todos.getState().length);

  expect(renderedIds).toEqual($todos.getState().map((todo) => todo.title));
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

  const Items = list({
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

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.testid),
  ).toEqual($todos.getState().map((todo) => todo.title));

  act(() => {
    addTodo({ title: 'Write tests', body: 'Text 4' });
  });

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.testid),
  ).toEqual($todos.getState().map((todo) => todo.title));

  act(() => {
    removeTodo('Clean room');
  });

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.testid),
  ).toEqual($todos.getState().map((todo) => todo.title));
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

  const Items = list({
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

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.prefix),
  ).toEqual($todos.getState().map(() => $prefix.getState()));

  act(() => {
    prefix('Task: ');
  });

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.prefix),
  ).toEqual($todos.getState().map(() => $prefix.getState()));

  act(() => {
    prefix('');
  });

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.prefix),
  ).toEqual($todos.getState().map(() => $prefix.getState()));
});
