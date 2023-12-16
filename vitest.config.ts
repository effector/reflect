import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

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
