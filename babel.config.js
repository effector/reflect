const presets = [
  '@babel/preset-env',
  '@babel/preset-typescript',
  '@babel/preset-react',
];

const plugins =
  process.env.NODE_ENV === 'test' ? ['@babel/plugin-transform-runtime'] : [];

module.exports = {
  presets,
  plugins,
};
