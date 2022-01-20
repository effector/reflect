import React from 'react';
import { createEvent, createStore, restore } from 'effector';

import { render, act } from '@testing-library/react';

import { cases } from '../index';

test('should correctly match cases', () => {
  const $projects = createStore([]);

  const projectCreated = createEvent();

  $projects.on(projectCreated, (projects) => [...projects, null]);

  const Component = cases({
    source: $projects,
    cases: [
      {
        view: CreateYourFirstProject,
        filter: (projects) => projects.length === 0,
      },
      { view: ProjectsList, filter: (projects) => projects.length > 0 },
    ],
  });

  const { getByTestId } = render(<Component />);

  expect(getByTestId('create-your-first-project')).toBeDefined();

  act(() => {
    projectCreated();
  });

  expect(getByTestId('projects-list')).toBeDefined();
});

test('renders default for unmatched', () => {
  const $imageType = createStore<'PNG' | 'JPEG'>('PNG');

  const Component = cases({
    source: $imageType,
    cases: [],
    default: Default,
  });

  const { getByTestId } = render(<Component />);

  expect(getByTestId('default-component')).toBeDefined();
});

test('hooks works once on mount', async () => {
  const $projects = createStore([]);
  const oneCreated = createEvent();

  $projects.on(oneCreated, (projects) => [...projects, null]);

  const mounted = createEvent();
  const fn = jest.fn();
  mounted.watch(fn);

  const Component = cases({
    source: $projects,
    hooks: { mounted },
    cases: [
      {
        view: CreateYourFirstProject,
        filter: (projects) => projects.length === 0,
      },
      { view: ProjectsList, filter: (projects) => projects.length > 0 },
    ],
  });

  expect(fn).not.toBeCalled();

  render(<Component />);
  expect(fn).toBeCalledTimes(1);

  act(() => {
    oneCreated();
  });
  expect(fn).toBeCalledTimes(1);
});

// test('hooks works once on unmount', async () => {
//   const setVisible = createEvent<boolean>();
//   const $isVisible = restore(setVisible, true);

//   const unmounted = createEvent();
//   const fn = jest.fn();
//   unmounted.watch(fn);

//   const Component = cases({
//     source: $isVisible,
//     hooks: { unmounted },
//     cases: [
//       {
//         view: CreateYourFirstProject,
//         filter: Boolean,
//       },
//     ],
//   });

//   expect(fn).not.toBeCalled();

//   render(<Component />);
//   expect(fn).not.toBeCalled();

//   act(() => {
//     setVisible(false);
//   });

//   expect(fn).toBeCalledTimes(1);
// });

// test('hooks works on remount', async () => {
//   const setVisible = createEvent<boolean>();
//   const $isVisible = restore(setVisible, true);

//   const unmounted = createEvent();
//   const onUnmount = jest.fn();
//   unmounted.watch(onUnmount);
//   const mounted = createEvent();
//   const onMount = jest.fn();
//   mounted.watch(onMount);

//   const Component = cases({
//     source: $isVisible,
//     hooks: { unmounted, mounted },
//     cases: [
//       {
//         view: CreateYourFirstProject,
//         filter: Boolean,
//       },
//     ],
//   });

//   expect(onMount).not.toBeCalled();
//   expect(onUnmount).not.toBeCalled();

//   render(<Component />);
//   expect(onMount).toBeCalledTimes(1);
//   expect(onUnmount).not.toBeCalled();

//   act(() => {
//     setVisible(false);
//   });
//   expect(onUnmount).toBeCalledTimes(1);

//   act(() => {
//     setVisible(true);
//   });
//   expect(onMount).toBeCalledTimes(2);
//   expect(onUnmount).toBeCalledTimes(1);
// });

const ProjectsList = () => {
  return <div data-testid="projects-list">projects-list</div>;
};

const CreateYourFirstProject = () => {
  return (
    <div data-testid="create-your-first-project">create-your-first-project</div>
  );
};

const Default = () => <div data-testid="default-component"></div>;
