const radpack = require('@radpack/server');

// Used for logging
globalThis.start = Date.now();

// Register
radpack.register([
  '../../libs/basic/dist/radpack.json',
  '../../libs/logger/dist/radpack.json',
  // Generated by build
  './dist/radpack.json'
]);

// Run
radpack('@radpack/example-rollup-app');
