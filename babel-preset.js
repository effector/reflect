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
    ],
  };
};
