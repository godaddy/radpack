# @radpack/core
Common internal functionality of radpack and peer dependency of all radpack dependencies.

[Documentation](https://godaddy.github.io/radpack)
![Logo](../../docs/_site/static/radpack-logo.svg)


## Installation
```sh
npm install @radpack/core
```


## Usage
```js
import {
  constants,
  createEntry,
  createExport,
  fetchRegister,
  flatten,
  getExportId,
  getExports,
  isArray,
  mergeRegisters,
  noop,
  parseManifest,
  parseRegister,
  parseVersionArray,
  Radpack,
  resolvePath,
  toArray
} from '@radpack/core';

import {
  fetch,
  fetchFile,
  fetchJson,
  fetchRegister,
  parseUrl
} from '@radpack/core/server';
```

