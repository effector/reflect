/* eslint-disable import/no-anonymous-default-export */

import typescript from 'rollup-plugin-typescript2';
import multiInput from 'rollup-plugin-multi-input';
import babel from 'rollup-plugin-babel';

const { exportRoot } = require('./lib/rollup-plugin-export-root');
const babelConfig = require('./babel.config.json');

export default {
  input: [
    './src/no-ssr/index.ts',
    './src/ssr/index.ts',
    './src/babel-preset.js',
  ],
  output: { dir: './dist', format: 'cjs' },
  watch: false,
  plugins: [
    typescript({
      tsconfigDefaults: { compilerOptions: { declaration: true } },
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      runtimeHelpers: true,
      ...babelConfig,
    }),
    multiInput(),
    exportRoot(),
  ],
};
