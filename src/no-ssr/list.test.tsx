import React, { FC, memo } from 'react';
import { createStore, createEvent } from 'effector';
import { useStore } from 'effector-react';

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

  const renderedIds = container
    .getAllByRole('listitem')
    .map((item) => item.dataset.testid);

  expect(renderedIds).toEqual($todos.getState().map((todo) => todo.title));
});

test('relfect-list: reflect hooks called once for every item', async () => {
  const $todos = createStore<{ title: string; body: string }[]>([
    { title: 'Buy milk', body: 'Text' },
    { title: 'Clean room', body: 'Text 2' },
    { title: 'Do homework', body: 'Text 3' },
  ]);

  const mounted = createEvent<void>();

  const fn = jest.fn(() => {});

  mounted.watch(fn);

  const unmounted = createEvent<void>();

  const unfn = jest.fn(() => {});

  mounted.watch(unfn);

  const Items = list({
    source: $todos,
    view: ListItem,
    bind: {},
    hooks: { mounted, unmounted },
    mapItem: {
      title: (todo) => todo.title,
    },
  });

  const container = render(
    <List>
      <Items />
    </List>,
  );

  expect(fn.mock.calls.length).toBe($todos.getState().length);

  container.unmount();

  expect(unfn.mock.calls.length).toBe($todos.getState().length);
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

test('reflect-list: reflect binds props to every item in the list', async () => {
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

interface MemberProps {
  id: number;
  name: string;
}

const Member: FC<MemberProps> = (props) => {
  const { name, id } = props;

  return <li data-testid={id}>{name}</li>;
};

test('reflect-list: getKey option', async () => {
  const fn = jest.fn();
  const fn2 = jest.fn();
  const renameUser = createEvent<{ id: number; name: string }>();
  const removeUser = createEvent<number>();
  const sortById = createEvent();
  const $members = createStore([
    { name: 'alice', id: 1 },
    { name: 'bob', id: 3 },
    { name: 'carol', id: 2 },
  ])
    .on(renameUser, (list, { id, name }) =>
      list.map((e) => (e.id === id ? { id, name } : e)),
    )
    .on(removeUser, (list, id) => list.filter((e) => e.id !== id))
    .on(sortById, (list) => [...list].sort((a, b) => a.id - b.id));

  // plain
  const PlainMember = memo((props: MemberProps) => {
    fn2(props);
    return <Member id={props.id} name={props.name} />;
  });

  const PlainMemberList = () => {
    return (
      <ul data-list="plain">
        {useStore($members).map((props) => (
          <PlainMember key={props.id} id={props.id} name={props.name} />
        ))}
      </ul>
    );
  };

  // reflect
  const ReflectMember: FC<MemberProps> = (props) => {
    fn(props);
    return <Member id={props.id} name={props.name} />;
  };
  const ReflectList: FC = (props) => (
    <ul data-list="reflect">{props.children}</ul>
  );
  const Members = list({
    source: $members,
    view: ReflectMember,
    bind: {},
    mapItem: {
      id: (member) => member.id,
      name: (member) => member.name,
    },
    getKey: (item) => item.id,
  });

  const App = () => (
    <>
      <PlainMemberList />
      <ReflectList>
        <Members />
      </ReflectList>
    </>
  );

  const container = render(<App />);

  // first check

  act(() => {
    sortById();
  });

  // second check

  act(() => {
    renameUser({ id: 2, name: 'charlie' });
  });

  // third check

  act(() => {
    removeUser(2);
  });

  // last check
});
