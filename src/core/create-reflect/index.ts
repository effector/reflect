import {
  View,
  BindByProps,
  reflectCreator,
  ReflectCreatorContext,
} from '../reflect';

export function createReflectCreator(context: ReflectCreatorContext) {
  const reflect = reflectCreator(context);

  return function createReflect<Props>(view: View<Props>) {
    return <Bind extends BindByProps<Props> = BindByProps<Props>>(bind: Bind) =>
      reflect<Props, Bind>({ view, bind });
  };
}
