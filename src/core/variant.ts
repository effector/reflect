import { Store } from 'effector';
import React from 'react';

import { reflectFactory } from './reflect';
import {
  AtLeastOne,
  BindableProps,
  Context,
  Hooks,
  NonEmptyArray,
  PartialBoundProps,
  View,
} from './types';

type SourceKeysCasesConfig<
  Props,
  Variant extends string,
  Bind extends BindableProps<Props>,
> = {
  source: Store<Variant>;
  bind?: Bind;
  cases: AtLeastOne<Record<Variant, View<Props>>>;
  hooks?: Hooks;
  default?: View<Props>;
};

type ArrayCasesConfig<Props, Source, Bind extends BindableProps<Props>> = {
  source: Store<Source>;
  cases: NonEmptyArray<{ filter: (source: Source) => boolean; view: View<Props> }>;
  bind?: Bind;
  hooks?: Hooks;
  default?: View<Props>;
};

type Config<
  Props,
  Variant extends string,
  Bind extends BindableProps<Props>,
  Source,
> =
  | ArrayCasesConfig<Props, Source, Bind>
  | SourceKeysCasesConfig<Props, Variant, Bind>
  | {
      if: Store<boolean>;
      then: View<Props>;
      else?: View<Props>;
      hooks?: Hooks;
      bind?: Bind;
    };

const Default = () => null;

function isArrayCasesConfig<
  Props,
  Variant extends string,
  Bind extends BindableProps<Props>,
  Source,
>(
  config: Config<Props, Variant, Bind, Source>,
): config is ArrayCasesConfig<Props, Source, Bind> {
  if ('cases' in config) {
    return Array.isArray(config.cases);
  }

  return false;
}

function isSourceKeysCasesConfig<
  Props,
  Variant extends string,
  Bind extends BindableProps<Props>,
  Source,
>(
  config: Config<Props, Variant, Bind, Source>,
): config is SourceKeysCasesConfig<Props, Variant, Bind> {
  if ('cases' in config) {
    return !Array.isArray(config.cases);
  }

  return false;
}

export function variantFactory(context: Context) {
  const reflect = reflectFactory(context);

  return function variant<
    Props,
    Variant extends string,
    Bind extends BindableProps<Props>,
    Source,
  >(
    config: Config<Props, Variant, Bind, Source>,
  ): React.FC<PartialBoundProps<Props, Bind>> {
    let $case: Store<Variant>;
    let cases: AtLeastOne<Record<Variant, View<Props>>>;
    let def: View<Props>;
    let View: View<Props>;

    if (isArrayCasesConfig(config)) {
      View = (props: Props) => {
        const source = context.useUnit(config.source);
        let Component = config.default ?? Default;

        for (const oneOfCases of config.cases) {
          if (oneOfCases.filter(source)) {
            Component = oneOfCases.view;
          }
        }

        return React.createElement(Component as any, props as any);
      };
    } else {
      // Shortcut for Store<boolean>
      if ('if' in config) {
        $case = config.if.map(
          (value): Variant => (value ? 'then' : 'else') as Variant,
        );

        cases = {
          then: config.then,
          else: config.else,
        } as unknown as AtLeastOne<Record<Variant, View<Props>>>;
        def = Default;
      }
      // Full form for Store<string>
      else if (isSourceKeysCasesConfig(config)) {
        $case = config.source;
        cases = config.cases;
        def = config.default ?? Default;
      }

      View = (props: Props) => {
        const nameOfCase = context.useUnit($case);
        const Component = cases[nameOfCase] ?? def;

        return React.createElement(Component as any, props as any);
      };
    }

    const bind = config.bind ?? ({} as Bind);

    return reflect({
      bind,
      view: View,
      hooks: config.hooks,
    });
  };
}
