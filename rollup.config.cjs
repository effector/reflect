const typescript = require('rollup-plugin-typescript2');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const babelConfig = require('./babel.config.json');

const plugins = () => [
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfigDefaults: {
      compilerOptions: { declaration: true, declarationDir: './dist' },
    },
  }),
  babel({
    exclude: 'node_modules/**',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    babelHelpers: 'runtime',
    presets: babelConfig.presets,
    plugins: babelConfig.plugins,
  }),
  nodeResolve({
    jsnext: true,
    skip: ['effector'],
    extensions: ['.js', '.mjs'],
  }),
  commonjs({ extensions: ['.js', '.mjs'] }),
  terser(),
];

const noSsr = './src/index.ts';
const scope = './src/scope.ts';
const external = ['effector', 'effector-react', 'react', 'effector-react/scope'];

module.exports = [
  {
    input: noSsr,
    external,
    plugins: plugins(),
    output: {
      file: './dist/reflect.mjs',
      format: 'es',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
  {
    input: scope,
    external,
    plugins: plugins(),
    output: {
      file: './dist/scope.mjs',
      format: 'es',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
  {
    input: noSsr,
    external,
    plugins: plugins(),
    output: {
      file: './dist/reflect.cjs',
      format: 'cjs',
      freeze: false,
      exports: 'named',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
  {
    input: scope,
    external,
    plugins: plugins(),
    output: {
      file: './dist/scope.js',
      format: 'cjs',
      freeze: false,
      exports: 'named',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
];

// pnpm why sourcemap-codec
// pnpm why sane
// w3c-hr-time
// source-map-resolve
// resolve-url
// source-map-url
// urix
