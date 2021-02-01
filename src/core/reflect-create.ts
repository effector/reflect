import {
  View,
  BindByProps,
  reflectFactory,
  ReflectCreatorContext,
  ReflectConfig,
} from './factory';

export function reflectCreateFactory(context: ReflectCreatorContext) {
  const reflect = reflectFactory(context);

  return function createReflect<Props>(view: View<Props>) {
    return <Bind extends BindByProps<Props> = BindByProps<Props>>(
      bind: Bind,
      params?: Pick<ReflectConfig<Props, Bind>, 'hooks'>,
    ) => reflect<Props, Bind>({ view, bind, ...params });
  };
}
