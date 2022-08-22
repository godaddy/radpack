const path = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const cwd = path.resolve(__dirname, '../');

module.exports = Promise.all([
  rimraf('packages/*/lib', { glob: { cwd } }),
  rimraf('packages/*/node_modules', { glob: { cwd } }),
  rimraf('examples/*/*/dist', { glob: { cwd } }),
  rimraf('examples/*/*/node_modules', { glob: { cwd } })
]);
