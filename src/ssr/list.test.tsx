import { list } from '@effector/reflect/scope';
import { act, render } from '@testing-library/react';
import { allSettled, createDomain, fork } from 'effector';
import { Provider, useStore } from 'effector-react/scope';
import React, { FC, memo } from 'react';

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
});

test('relfect-list: reflect hooks called once for every item', async () => {
  const app = createDomain();

  const $todos = app.createStore<{ title: string; body: string }[]>([
    { title: 'Buy milk', body: 'Text' },
    { title: 'Clean room', body: 'Text 2' },
    { title: 'Do homework', body: 'Text 3' },
  ]);

  const mounted = app.createEvent<void>();

  const fn = vi.fn(() => {});

  mounted.watch(fn);

  const unmounted = app.createEvent<void>();

  const unfn = vi.fn(() => {});

  unmounted.watch(unfn);

  const Items = list({
    source: $todos,
    view: ListItem,
    bind: {},
    hooks: { mounted, unmounted },
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

  container.unmount();

  expect(unfn.mock.calls.length).toBe(scope.getState($todos).length);
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

test('reflect-list: reflect binds props to every item in the list', async () => {
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

interface MemberProps {
  id: number;
  name: string;
}

const Member: FC<MemberProps> = (props) => {
  const { name, id } = props;

  return <li data-testid={id}>{name}</li>;
};

test('reflect-list: getKey option', async () => {
  const fn = vi.fn();
  const fn2 = vi.fn();
  const app = createDomain();

  const renameUser = app.createEvent<{ id: number; name: string }>();
  const removeUser = app.createEvent<number>();
  const sortById = app.createEvent();
  const $members = app
    .createStore([
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
      <ul data-testid="plain">
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
  const ReflectList: FC = (props) => <ul data-testid="reflect">{props.children}</ul>;
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

  const scope = fork(app);
  const App = () => (
    <Provider value={scope}>
      <PlainMemberList />
      <ReflectList>
        <Members />
      </ReflectList>
    </Provider>
  );

  const container = render(<App />);

  // first check
  expect(
    Array.from(container.getByTestId('plain').querySelectorAll('li')).map((item) =>
      Number(item.dataset.testid),
    ),
  ).toEqual(scope.getState($members).map((member) => member.id));
  expect(
    Array.from(container.getByTestId('reflect').querySelectorAll('li')).map((item) =>
      Number(item.dataset.testid),
    ),
  ).toEqual(scope.getState($members).map((member) => member.id));

  expect(fn.mock.calls.map(([arg]) => arg)).toEqual(
    fn2.mock.calls.map(([arg]) => arg),
  );

  await act(async () => {
    await allSettled(sortById, { scope });
  });

  // second check
  expect(
    Array.from(container.getByTestId('plain').querySelectorAll('li')).map((item) =>
      Number(item.dataset.testid),
    ),
  ).toEqual(scope.getState($members).map((member) => member.id));
  expect(
    Array.from(container.getByTestId('reflect').querySelectorAll('li')).map((item) =>
      Number(item.dataset.testid),
    ),
  ).toEqual(scope.getState($members).map((member) => member.id));

  expect(fn.mock.calls.map(([arg]) => arg)).toEqual(
    fn2.mock.calls.map(([arg]) => arg),
  );

  await act(async () => {
    await allSettled(renameUser, { scope, params: { id: 2, name: 'charlie' } });
  });

  // third check
  expect(
    Array.from(container.getByTestId('plain').querySelectorAll('li')).map((item) =>
      Number(item.dataset.testid),
    ),
  ).toEqual(scope.getState($members).map((member) => member.id));
  expect(
    Array.from(container.getByTestId('reflect').querySelectorAll('li')).map((item) =>
      Number(item.dataset.testid),
    ),
  ).toEqual(scope.getState($members).map((member) => member.id));

  expect(fn.mock.calls.map(([arg]) => arg)).toEqual(
    fn2.mock.calls.map(([arg]) => arg),
  );

  await act(async () => {
    await allSettled(removeUser, { scope, params: 2 });
  });

  // last check
  expect(
    Array.from(container.getByTestId('plain').querySelectorAll('li')).map((item) =>
      Number(item.dataset.testid),
    ),
  ).toEqual(scope.getState($members).map((member) => member.id));
  expect(
    Array.from(container.getByTestId('reflect').querySelectorAll('li')).map((item) =>
      Number(item.dataset.testid),
    ),
  ).toEqual(scope.getState($members).map((member) => member.id));

  expect(fn.mock.calls.map(([arg]) => arg)).toEqual(
    fn2.mock.calls.map(([arg]) => arg),
  );
});
