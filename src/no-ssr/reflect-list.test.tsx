import React, { FC } from 'react';
import { createStore } from 'effector';

import { render } from '@testing-library/react';

import { reflectList } from './index';

const List: FC = (props) => {
  return <ul>{props.children}</ul>;
};

const ListItem: FC<{ title: string; color?: string }> = (props) => {
  return <li style={{ color: props.color }}>{props.title}</li>;
};

test('relfect-list: basic list', async () => {
  const $todos = createStore<{ title: string; body: string }[]>([
    { title: 'Abc', body: 'Text' },
    { title: 'Dbe', body: 'Text 2' },
    { title: 'Rdp', body: 'Text 3' },
  ]);

  const Items = reflectList({
    source: $todos,
    view: ListItem,
    bind: {},
    mapItem: {
      title: (todo) => todo.title,
    },
    getKey: (todo, index) => index,
  });

  const container = render(
    <List>
      <Items />
    </List>,
  );

  const list = container.getAllByRole('listitem');
  
  expect(list.length).toEqual($todos.getState().length);
});
