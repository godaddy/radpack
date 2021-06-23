const radpack = require('@radpack/server');

// Used for logging
globalThis.start = Date.now();

// Register
radpack.register([
  '../../libs/context/dist/radpack.json',
  '../../libs/logger/dist/radpack.json'
]);

['a', 'b'].forEach(flag => {
  // Apply context
  const radpackFeature = radpack.withContext({ flag });

  // Run
  radpackFeature('@radpack/example-context-lib').then(({ default: run }) => run());
});
