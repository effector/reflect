import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';
import { $ } from 'zx';

if (!process.env.CI) {
  /**
   * Vitest tests are always run against the built package.
   */
  console.log('Building the package...');
  await $`pnpm build`;
  $.log = () => {};
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@effector/reflect/scope': resolve(__dirname, './dist/scope.mjs'),
      '@effector/reflect': resolve(__dirname, './dist/index.mjs'),
    },
  },
});
