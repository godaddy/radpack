const express = require('express');
const opener = require('opener');

const port = 3000;
const base = `http://localhost:${ port }`;
const app = express();

app.use(express.static('../../'));

app.get('/', (req, res, next) => {
  // Dehydrate server
  radpack.dehydrate().then(state => {
    // Hydrate client
    res.send([
      `<body>`,
      `<script>window.RADPACK_HYDRATE = ${ JSON.stringify(state) };</script>`,
      `<script src="./apps/webpack-hydrate/dist/client/main.js"></script>`,
      `</body>`
    ].join('\n'));
  }).catch(next);
});

app.listen(port, () => {
  // Register
  radpack.register([
    `${ base }/libs/basic/dist/radpack.json`,
    `${ base }/libs/logger/dist/radpack.json`
  ], {
    // Try running `npm run watch` in a library
    tts: 500
  });

  // Open
  console.log('opening', base);
  opener(base);
});
