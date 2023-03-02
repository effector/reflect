const typescript = require('rollup-plugin-typescript2');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const babelConfig = require('./babel.config.json');

const plugins = (isEsm) => [
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfigDefaults: {
      compilerOptions: { declaration: true, declarationDir: '.' },
    },
  }),
  babel({
    exclude: 'node_modules/**',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    babelHelpers: 'runtime',
    presets: babelConfig.presets,
    plugins: isEsm
      ? [
          [
            'module-resolver',
            {
              alias: {
                effector$: 'effector/effector.mjs',
                'effector-react$': 'effector-react/effector-react.mjs',
              },
            },
          ],
          ...babelConfig.plugins,
        ]
      : babelConfig.plugins,
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
const ssr = './src/ssr.ts';
const scope = './src/scope.ts';
const external = [
  'effector',
  'effector/effector.mjs',
  'effector-react',
  'effector-react/effector-react.mjs',
  'react',
  'effector-react/ssr',
  'effector-react/scope',
];

module.exports = [
  {
    input: noSsr,
    external,
    plugins: plugins(true),
    output: {
      file: './reflect.mjs',
      format: 'es',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
  {
    input: ssr,
    external,
    plugins: plugins(true),
    output: {
      file: './ssr.mjs',
      format: 'es',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
  {
    input: scope,
    external,
    plugins: plugins(true),
    output: {
      file: './scope.mjs',
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
      file: './reflect.cjs.js',
      format: 'cjs',
      freeze: false,
      exports: 'named',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
  {
    input: ssr,
    external,
    plugins: plugins(),
    output: {
      file: './ssr.js',
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
      file: './scope.js',
      format: 'cjs',
      freeze: false,
      exports: 'named',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
];

// pnpm add -D @rollup/plugin-terser uglify-js @rollup/plugin-babel @rollup/plugin-{commonjs,node-resolve}@latest
// pnpm uninstall rollup-plugin-terser uglify-es rollup-plugin-babel

// pnpm why sourcemap-codec
// pnpm why sane
// w3c-hr-time
// source-map-resolve
// resolve-url
// source-map-url
// urix
