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

// Guard against regressions in dist/package.json generation (see build.mjs):
// a missing `exports` field makes bundlers resolve the CJS build, which breaks
// the `@effector/reflect/scope` subpath and causes a dual-package hazard with
// effector-react (scope is lost inside `variant`/`reflect`).
{
  const distPkg = JSON.parse(
    await fs.readFile(resolve(pkgDir, 'package.json'), { encoding: 'utf-8' }),
  );
  const missing = [];
  if (!distPkg.exports) missing.push('exports');
  else {
    if (!distPkg.exports['.']) missing.push("exports['.']");
    if (!distPkg.exports['./scope']) missing.push("exports['./scope']");
  }
  if (missing.length > 0) {
    throw new Error(
      `dist/package.json is missing required field(s): ${missing.join(', ')}`,
    );
  }
  console.log('✓ dist/package.json has valid "exports"');
}
