const radpack = require('@radpack/server');

// Used for logging
globalThis.start = Date.now();

// Register
radpack.register([
  '../../libs/basic/dist/radpack.json',
  '../../libs/logger/dist/radpack.json'
]);

// Run
radpack('@radpack/example-basic-lib').then(({ default: run }) => run());
