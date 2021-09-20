module.exports = (_api, _, _dirname) => {
  return {
    plugins: [
      [
        'effector/babel-plugin',
        {
          factories: ['@effector/reflect'],
          noDefaults: true,
        },
      ],
      [
        'effector/babel-plugin',
        {
          factories: ['@effector/reflect/ssr'],
          noDefaults: true,
        },
      ],
    ],
  };
};
