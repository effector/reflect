const { configure, presets } = require('eslint-kit');

module.exports = configure({
  root: __dirname,
  presets: [
    presets.react(),
    // presets.effector(),
    presets.typescript(),
    presets.prettier(),
    presets.node(),
  ],
});
