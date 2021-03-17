import React, { FC } from 'react';
import { createDomain, fork, allSettled } from 'effector';
import { Provider } from 'effector-react/ssr';

import { render, act } from '@testing-library/react';

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
  const app = createDomain();

  const $todos = app.createStore<{ title: string; body: string }[]>([
    { title: 'Buy milk', body: 'Text' },
    { title: 'Clean room', body: 'Text 2' },
    { title: 'Do homework', body: 'Text 3' },
  ]);

  const mounted = app.createEvent<void>();

  const fn = jest.fn(() => {});

  mounted.watch(fn);

  const Items = list({
    source: $todos,
    view: ListItem,
    bind: {
      prefix: 'Title: ',
    },
    hooks: { mounted },
    mapItem: {
      title: (todo) => todo.title,
    },
  });

  const scope = fork(app);

  const container = render(
    <Provider value={scope}>
      <List>
        <Items />
      </List>
    </Provider>,
  );

  expect(fn.mock.calls.length).toBe(scope.getState($todos).length);

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.testid),
  ).toEqual(scope.getState($todos).map((todo) => todo.title));
});

test('reflect-list: rerenders on list changes', async () => {
  const app = createDomain();

  const addTodo = app.createEvent<{ title: string; body: string }>();
  const removeTodo = app.createEvent<string>();
  const $todos = app.createStore<{ title: string; body: string }[]>([
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

  const scope = fork(app);

  const container = render(
    <Provider value={scope}>
      <List>
        <Items />
      </List>
    </Provider>,
  );

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.testid),
  ).toEqual(scope.getState($todos).map((todo) => todo.title));

  await act(async () => {
    await allSettled(addTodo, {
      scope,
      params: { title: 'Write tests', body: 'Text 4' },
    });
  });

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.testid),
  ).toEqual(scope.getState($todos).map((todo) => todo.title));

  await act(async () => {
    await allSettled(removeTodo, { scope, params: 'Clean room' });
  });

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.testid),
  ).toEqual(scope.getState($todos).map((todo) => todo.title));
});

test('reflect-list: does not breaks reflect`s bind', async () => {
  const app = createDomain();

  const $todos = app.createStore<{ title: string; body: string }[]>([
    { title: 'Buy milk', body: 'Text' },
    { title: 'Clean room', body: 'Text 2' },
    { title: 'Do homework', body: 'Text 3' },
  ]);

  const $prefix = app.createStore<string>('');
  const prefix = app.createEvent<string>();

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

  const scope = fork(app);

  const container = render(
    <Provider value={scope}>
      <List>
        <Items />
      </List>
    </Provider>,
  );

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.prefix),
  ).toEqual(scope.getState($todos).map(() => scope.getState($prefix)));

  await act(async () => {
    await allSettled(prefix, { scope, params: 'Task: ' });
  });

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.prefix),
  ).toEqual(scope.getState($todos).map(() => scope.getState($prefix)));

  await act(async () => {
    await allSettled(prefix, { scope, params: '' });
  });

  expect(
    container.getAllByRole('listitem').map((item) => item.dataset.prefix),
  ).toEqual(scope.getState($todos).map(() => scope.getState($prefix)));
});
