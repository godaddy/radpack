# @radpack/server
The server-side runtime package. This is automatically imported into applications built using [@radpack/webpack-plugin] and targeting [node](webpack-target). For client-side usage, use [@radpack/client].

[Documentation](https://godaddy.github.io/radpack)
![Logo](../../docs/_site/static/radpack-logo.svg)


## Installation
```sh
npm install @radpack/server
```


## Usage
```js
import radpack from '@radpack/server';
```

For express-like web applications wanting to locally link radpack libraries for testing, use the middleware and register the proxy route ([example app](app-middleware)):
```js
import express from 'express';
import radpack from '@radpack/server';
import Middleware from '@radpack/server/middleware';

const app = express();

app.use(new Middleware());

app.listen(3000, () => {
  radpack.register(`http://localhost:3000/radpack`);
});
```


[@radpack/client]: ../client/
[@radpack/webpack-plugin]: ../webpack-plugin/
[app-middleware]: ../../examples/apps/middleware/
[webpack-target]: https://v4.webpack.js.org/configuration/target/

