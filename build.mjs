/* eslint-disable no-undef */
import prettyMs from 'pretty-ms';
import { rollup } from 'rollup';
import 'zx/globals';

import configs from './rollup.config.cjs';

await fs.mkdir('./dist', { recursive: true });

await measure(`public-typings → ./dist/`, `copied in`, async () => {
  await fs.copyFile('./public-types/reflect.d.ts', './dist/index.d.ts');

  // `@effector/reflect/scope` types - this export is deprecated
  await fs.copyFile('./public-types/reflect.d.ts', './dist/scope.d.ts');
});

for (const config of configs) {
  await measure(
    `${config.input} → ${config.output.file ?? config.output.dir}`,
    `created in`,
    async () => {
      const bundle = await rollup(config);
      await bundle.write(config.output);
    },
  );
}

await measure(`package.json → ./dist/package.json`, `created in`, async () => {
  const Package = JSON.parse(
    await fs.readFile('./package.json', { encoding: 'utf-8' }),
  );
  delete Package.devDependencies;
  delete Package.scripts;
  await fs.writeFile('./dist/package.json', JSON.stringify(Package), {
    encoding: 'utf-8',
  });
});

await fs.copyFile('./Readme.md', './dist/Readme.md');
console.log(`Copied Readme.md → ./dist/Readme.md`);

async function measure(start, end, fn) {
  console.log(start);
  const time = performance.now();
  await fn();
  console.log('↳', end, prettyMs(performance.now() - time), '\r\n');
}
