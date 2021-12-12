/* eslint-disable import/no-anonymous-default-export */

import typescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const babelConfig = require('./babel.config.json');

const plugins = [
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfigDefaults: {
      compilerOptions: { declaration: true, declarationDir: './dist' },
    },
  }),
  babel({
    exclude: 'node_modules/**',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    runtimeHelpers: true,
    ...babelConfig,
  }),
  nodeResolve({
    jsnext: true,
    skip: ['effector'],
    extensions: ['.js', '.mjs'],
  }),
  commonjs({ extensions: ['.js', '.mjs'] }),
  // terser(),
];

const noSsr = './src/index.ts';
const ssr = './src/ssr.ts';
const input = [noSsr, ssr];
const external = ['effector', 'effector-react', 'react', 'effector-react/ssr'];

export default [
  {
    input,
    external,
    plugins,
    output: {
      dir: './dist/esm',
      format: 'es',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
  {
    input,
    external,
    plugins,
    output: {
      dir: './dist/cjs',
      format: 'cjs',
      freeze: false,
      exports: 'named',
      sourcemap: true,
      externalLiveBindings: false,
    },
  },
];
