import fs from 'node:fs/promises';

import prettyMs from 'pretty-ms';
import { rollup } from 'rollup';

import configs from './rollup.config.cjs';

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

await fs.copyFile('public-types/index.d.ts', './dist/index.d.ts');
await fs.copyFile('public-types/index.d.ts', './dist/scope.d.ts');

async function measure(start, end, fn) {
  console.log(start);
  const time = performance.now();
  await fn();
  console.log('↳', end, prettyMs(performance.now() - time), '\r\n');
}
