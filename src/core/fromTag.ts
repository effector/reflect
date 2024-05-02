import type { ReactNode } from 'react';
import { JSX, createElement } from 'react';

type HtmlTag = keyof JSX.IntrinsicElements;

export function fromTag<T extends HtmlTag>(htmlTag: T) {
  return (props: Record<string, unknown>): ReactNode => {
    return createElement(htmlTag, props);
  };
}