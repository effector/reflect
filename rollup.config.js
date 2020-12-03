/* eslint-disable import/no-anonymous-default-export */

import typescript from 'rollup-plugin-typescript2';
import multiInput from 'rollup-plugin-multi-input';

const { exportRoot } = require('./lib/rollup-plugin-export-root');

export default {
  input: ['./src/no-ssr/index.ts', './src/ssr/index.ts'],
  output: { dir: './dist', format: 'cjs' },
  plugins: [
    typescript({
      tsconfigDefaults: { compilerOptions: { declaration: true } },
    }),
    multiInput(),
    exportRoot(),
  ],
};
