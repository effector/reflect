/* eslint-disable no-undef */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { publint } from 'publint';
import { formatMessage } from 'publint/utils';
import 'zx/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pkgDir = resolve(__dirname, './dist');
try {
  const attwResult = await $`pnpm attw --pack ${pkgDir}`;
} catch (error) {}
console.log();

// A missing `exports` field makes bundlers fall back to `main` (CJS), which
// breaks the `@effector/reflect/scope` subpath and causes a dual-package hazard
// with effector-react — the forked scope is lost inside `variant`/`reflect`.
// These codes are reported as suggestions by publint, so the build has to fail
// on them explicitly rather than rely on the `strict` option.
const BLOCKING_CODES = [
  'HAS_MODULE_BUT_NO_EXPORTS',
  'HAS_ESM_MAIN_BUT_NO_EXPORTS',
  'EXPORTS_MISSING_ROOT_ENTRYPOINT',
  'FILE_DOES_NOT_EXIST',
  'FILE_NOT_PUBLISHED',
];

const distPkg = JSON.parse(
  await fs.readFile(resolve(pkgDir, 'package.json'), { encoding: 'utf-8' }),
);
const { messages } = await publint({ pkgDir });

for (const message of messages) {
  console.log(formatMessage(message, distPkg));
}

const errors = messages
  .filter((message) => BLOCKING_CODES.includes(message.code))
  .map((message) => formatMessage(message, distPkg));

// publint validates the shape of `exports`, but has no way of knowing which
// subpaths the package is meant to expose, so `./scope` is checked separately.
if (distPkg.exports && !distPkg.exports['./scope']) {
  errors.push('pkg.exports is missing the "./scope" subpath');
}

if (errors.length > 0) {
  throw new Error(`Invalid dist/package.json:\n${errors.join('\n')}`);
}
