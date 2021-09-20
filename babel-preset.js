module.exports = (_api, _, _dirname) => {
  return {
    plugins: [
      [
        'effector/babel-plugin',
        {
          factories: ['@effector/reflect', '@effector/reflect/ssr'],
          noDefaults: true,
        },
        'effector-reflect',
      ],
    ],
  };
};
