import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createDomain, fork } from 'effector';
import { Provider } from 'effector-react/ssr';
import React, { forwardRef, useState } from 'react';

import { intercept } from '../core';

const Input = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange?: (value: string) => void;
  }
>(({ value, onChange }, ref) => (
  <input ref={ref} value={value} onChange={(e) => onChange?.(e.target.value)} />
));

describe('intercept [ssr]', () => {
  describe('component', () => {
    test('extended props', () => {
      const app = createDomain();
      const setupValue = app.createEvent<boolean>();

      const mockFn = jest.fn();

      setupValue.watch(mockFn);

      const Component = intercept(Input)<{ checked: boolean }>({
        mounted: {
          checked: setupValue,
        },
      });

      const scope = fork(app);

      render(
        <Provider value={scope}>
          <Component checked={true} value="" />
        </Provider>,
      );

      expect(mockFn).toHaveBeenCalledWith(true);
    });
  });

  describe('hooks', () => {
    test('mounted', () => {
      const app = createDomain();
      const setupValue = app.createEvent<string>();

      const mockFn = jest.fn();

      setupValue.watch(mockFn);

      const Component = intercept(Input)({
        mounted: {
          value: setupValue,
        },
      });

      const scope = fork(app);

      render(
        <Provider value={scope}>
          <Component value="test" />
        </Provider>,
      );

      expect(mockFn).toHaveBeenCalledWith('test');
    });

    test('update', async () => {
      const app = createDomain();
      const changedValue = app.createEvent<string>();

      const mockFn = jest.fn();

      changedValue.watch(mockFn);

      const InputComponent = intercept(Input)({
        update: {
          value: changedValue,
        },
      });

      const Bloc = () => {
        const [value, setValue] = useState('');

        return <InputComponent value={value} onChange={setValue} />;
      };

      const scope = fork(app);

      render(
        <Provider value={scope}>
          <Bloc />
        </Provider>,
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;

      await userEvent.type(input, 'Ivan');

      expect(mockFn).toHaveBeenLastCalledWith('Ivan');
      expect(input.value).toBe('Ivan');
    });

    test('unmounted', async () => {
      const app = createDomain();
      const lastValue = app.createEvent<string>();

      const mockFn = jest.fn();

      lastValue.watch(mockFn);

      const InputComponent = intercept(Input)({
        unmounted: {
          value: lastValue,
        },
      });

      const Bloc: React.FC<{ inputValue: string }> = ({ inputValue }) => {
        const [visible, setVisible] = useState(true);

        return (
          <div>
            <button onClick={() => setVisible(false)}>hide</button>
            {visible && <InputComponent value={inputValue} />}
          </div>
        );
      };

      const scope = fork(app);

      render(
        <Provider value={scope}>
          <Bloc inputValue="Peter" />
        </Provider>,
      );

      const button = screen.getByRole('button');

      await userEvent.click(button);

      expect(mockFn).toHaveBeenCalledWith('Peter');
    });
  });
});
