import {
  View,
  BindByProps,
  reflectCreator,
  ReflectCreatorContext,
  ReflectConfig,
} from '../reflect';

export function reflectFactory(context: ReflectCreatorContext) {
  const reflect = reflectCreator(context);

  return function createReflect<Props>(view: View<Props>) {
    return <Bind extends BindByProps<Props> = BindByProps<Props>>(
      bind: Bind,
      params?: Pick<ReflectConfig<Props, Bind>, 'hooks'>,
    ) => reflect<Props, Bind>({ view, bind, ...params });
  };
}
