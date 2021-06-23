const http = require('http');
const opener = require('opener');
const radpack = require('@radpack/server');

const port = 3000;
const base = `http://localhost:${ port }`;

http.createServer((req, res) => {
  const url = new URL(req.url, base);
  if (url.pathname !== '/') {
    res.statusCode = 404;
    return res.end();
  }
  // Used for logging
  globalThis.start = Date.now();

  // Run
  radpack('@radpack/example-basic-lib')
    .then(({ default: run }) => res.end(run()))
    .catch(err => {
      res.statusCode = 500;
      res.end(err.message);
    });
}).listen(port, () => {
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

