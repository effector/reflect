/* eslint-disable import/no-anonymous-default-export */

import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

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
    runtimeHelpers: true,
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
const external = [
  'effector',
  'effector/effector.mjs',
  'effector-react',
  'effector-react/effector-react.mjs',
  'react',
  'effector-react/ssr',
];

export default [
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
];
