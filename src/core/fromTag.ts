import type { ReactNode } from 'react';
import { createElement } from 'react';

export function fromTag<HtmlTag extends string>(htmlTag: HtmlTag) {
  return (props: Record<string, unknown>): ReactNode => {
    return createElement(htmlTag, props);
  };
}
