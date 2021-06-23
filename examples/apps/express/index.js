const express = require('express');
const opener = require('opener');
const radpack = require('@radpack/server');

const port = 3000;
const base = `http://localhost:${ port }`;
const app = express();

app.get('/', (req, res, next) => {
  // Used for logging
  globalThis.start = Date.now();

  // Run
  radpack('@radpack/example-basic-lib')
    .then(({ default: run }) => res.send(run()))
    .catch(next);
});

app.listen(port, () => {
  // Register
  radpack.register([
    '../../libs/basic/dist/radpack.json',
    '../../libs/logger/dist/radpack.json'
  ], {
    // Try running `npm run watch` in a library
    tts: 500
  });

  // Open
  console.log('opening', base);
  opener(base);
});
