import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createEvent } from 'effector';
import React, { createRef, forwardRef, useState } from 'react';

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

describe('intercept [no ssr]', () => {
  describe('component', () => {
    test('passing value', () => {
      const Component = intercept(Input)({});

      render(<Component value="test" />);

      const input = screen.getByDisplayValue('test');

      expect(input).not.toBeNull();
    });

    test('forward ref', async () => {
      const Component = intercept(Input)({});

      const ref = createRef<HTMLInputElement>();

      render(<Component value="test" ref={ref} />);

      const input = screen.getByDisplayValue('test');

      expect(input).toBe(ref.current);
    });

    test('extended props', () => {
      const setupValue = createEvent<boolean>();

      const mockFn = jest.fn();

      setupValue.watch(mockFn);

      const Component = intercept(Input)<{ checked: boolean }>({
        mounted: {
          checked: setupValue,
        },
      });

      render(<Component checked={true} value="" />);

      expect(mockFn).toHaveBeenCalledWith(true);
    });
  });

  describe('hooks', () => {
    test('mounted', () => {
      const setupValue = createEvent<string>();

      const mockFn = jest.fn();

      setupValue.watch(mockFn);

      const Component = intercept(Input)({
        mounted: {
          value: setupValue,
        },
      });

      render(<Component value="test" />);

      expect(mockFn).toHaveBeenCalledWith('test');
    });

    test('update', async () => {
      const changedValue = createEvent<string>();

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

      render(<Bloc />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      await userEvent.type(input, 'Ivan');

      expect(mockFn).toHaveBeenLastCalledWith('Ivan');
      expect(input.value).toBe('Ivan');
    });

    test('unmounted', async () => {
      const lastValue = createEvent<string>();

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

      render(<Bloc inputValue="Peter" />);

      const button = screen.getByRole('button');

      await userEvent.click(button);

      expect(mockFn).toHaveBeenCalledWith('Peter');
    });
  });
});
