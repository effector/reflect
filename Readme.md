# @effector/reflect

☄️ Attach effector stores to react components without hooks.

## Install

```sh
npm install @effector/reflect
# or
pnpm add @effector/reflect
```

[Getting started](https://reflect.effector.dev/learn/installation) | [API Docs](https://reflect.effector.dev/docs)

## Motivation

What's the point of reflect?

It's the API design that, using the classic HOC-like pattern, allows you to write React components with Effector in an efficient and composable way.

```tsx
import { reflect, variant } from '@effector/reflect';

export function UserForm() {
  return (
    <FormCard>
      <Name />
      <LastName />
      <SubmitButton />
    </FormCard>
  );
}

const Name = reflect({
  view: Input,
  bind: {
    value: model.$name,
    onChange: model.nameChanged,
  },
});

const LastName = reflect({
  view: Input,
  bind: {
    value: model.$lastName,
    onChange: model.lastNameChanged,
  },
});

const SubmitButton = reflect({
  view: Button,
  bind: {
    type: 'submit', // plain values are allowed too!
    disabled: model.$formValid.map((valid) => !valid),
    onClick: model.formSubmitted,
  },
});
```

Here we've separated this component into small parts, which were created in a convenient way using `reflect` operators, which is a very simple description of the `props -> values` mapping, which is easier to read and modify.

With `@effector/reflect`, our `$formValid` update will only cause the SubmitButton to be re-rendered, and for all other parts of our `<UserForm />` there will literally be **zero** React work.

To learn more, please read the [full Motivation article](https://reflect.effector.dev/learn/motivation).

## Release process

1. Check out the [draft release](https://github.com/effector/reflect/releases).
2. All PRs should have correct labels and useful titles. You can [review available labels here](https://github.com/effector/reflect/blob/master/.github/release-drafter.yml).
3. Update labels for PRs and titles, next [manually run the release drafter action](https://github.com/effector/reflect/actions/workflows/release-drafter.yml) to regenerate the draft release.
4. Review the new version and press "Publish"
5. If required check "Create discussion for this release"
