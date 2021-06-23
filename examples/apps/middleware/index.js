const express = require('express');
const opener = require('opener');
const radpack = require('@radpack/server');
const Middleware = require('@radpack/server/middleware');

const port = 3000;
const base = `http://localhost:${ port }`;
const app = express();

// Start Proxy
app.use(new Middleware());

app.get('/', (req, res, next) => {
  // Used for logging
  globalThis.start = Date.now();

  // Run
  radpack('@radpack/example-basic-lib')
    .then(({ default: run }) => res.send(run()))
    .catch(next);
});

app.listen(port, () => {
  // Register Proxy
  radpack.register(new URL('/radpack', base).href, {
    // Try running `npm run watch` in a library
    tts: 500
  });

  // Open
  console.log('opening', base);
  opener(base);
});
