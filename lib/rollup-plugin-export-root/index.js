const path = require('path');
const fse = require('fs-extra');

function exportRoot() {
  const inputs = { keys: [], paths: [] };

  return {
    name: 'exportRoot',
    buildStart: (options) => {
      inputs.keys = Object.keys(options.input);
      inputs.paths = Object.values(options.input);
    },
    generateBundle() {
      inputs.keys.forEach((key) => {
        this.emitFile({
          type: 'asset',
          fileName: `root/${key}.js`,
          source: `module.exports = require("../dist/${key}.js");\n`,
        });

        this.emitFile({
          type: 'asset',
          fileName: `root/${key}.d.ts`,
          source: `export * from "../dist/${path.dirname(key)}";\n`,
        });
      });
    },
    writeBundle({ dir }) {
      inputs.keys.forEach((key) => {
        fse.move(
          path.resolve(process.cwd(), dir, `root/${key}.js`),
          path.resolve(process.cwd(), `${key}.js`),
        );

        fse.move(
          path.resolve(process.cwd(), dir, `root/${key}.d.ts`),
          path.resolve(process.cwd(), `${key}.d.ts`),
        );
      });
    },
  };
}

exports.exportRoot = exportRoot;
