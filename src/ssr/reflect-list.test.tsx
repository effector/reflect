import React, { FC } from 'react';
import { createDomain, fork, allSettled } from 'effector';
import { Provider } from 'effector-react/ssr';

import { render, act } from '@testing-library/react';

import { reflectList } from './index';

const List: FC = (props) => {
  return <ul>{props.children}</ul>;
};

const ListItem: FC<{
  title: string;
  prefix?: string;
  color?: string;
  onClick?: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
}> = (props) => {
  return (
    <li onClick={props.onClick} style={{ color: props.color }}>
      {props.prefix || ''}
      {props.title}
    </li>
  );
};

test('relfect-list: renders list from store', async () => {
  const app = createDomain();

  const $todos = app.createStore<{ title: string; body: string }[]>([
    { title: 'Buy milk', body: 'Text' },
    { title: 'Clean room', body: 'Text 2' },
    { title: 'Do homework', body: 'Text 3' },
  ]);

  const Items = reflectList({
    source: $todos,
    view: ListItem,
    bind: {
      prefix: 'Title: ',
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
  
  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Title: Buy milk</li><li>Title: Clean room</li><li>Title: Do homework</li></ul>"',
  );
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

  const Items = reflectList({
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

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Clean room</li><li>Do homework</li></ul>"',
  );

  await act(async () => {
    await allSettled(addTodo, {
      scope,
      params: { title: 'Write tests', body: 'Text 4' },
    });
  });

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Clean room</li><li>Do homework</li><li>Write tests</li></ul>"',
  );

  await act(async () => {
    await allSettled(removeTodo, { scope, params: 'Clean room' });
  });

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Do homework</li><li>Write tests</li></ul>"',
  );
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

  const scope = fork(app);

  const container = render(
    <Provider value={scope}>
      <List>
        <Items />
      </List>
    </Provider>,
  );

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Clean room</li><li>Do homework</li></ul>"',
  );

  await act(async () => {
    await allSettled(prefix, { scope, params: 'Task: ' });
  });

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Task: Buy milk</li><li>Task: Clean room</li><li>Task: Do homework</li></ul>"',
  );

  await act(async () => {
    await allSettled(prefix, { scope, params: '' });
  });

  expect(container.container.innerHTML).toMatchInlineSnapshot(
    '"<ul><li>Buy milk</li><li>Clean room</li><li>Do homework</li></ul>"',
  );
});
