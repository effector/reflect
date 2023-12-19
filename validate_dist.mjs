/* eslint-disable no-undef */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import 'zx/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pkgDir = resolve(__dirname, './dist');
try {
  const attwResult = await $`pnpm attw --pack ${pkgDir}`;
} catch (error) {}
console.log();
try {
  const publintResult = await $`pnpm publint ${pkgDir}`;
} catch (error) {}
