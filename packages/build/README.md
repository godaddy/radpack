# @radpack/build
Common internal functionality of radpack build tools for other packages like [@radpack/rollup-plugin] and [@radpack/webpack-plugin].

[Documentation](https://godaddy.github.io/radpack)
![Logo](../../docs/_site/static/radpack-logo.svg)


## Installation
```sh
npm install --save-dev @radpack/build
```


## Usage
```js
import {
  constants,
  createManifest,
  createVersionArray,
  getAbsoluteExport,
  getExport,
  getExports,
  getPackage,
  getRelativeExport,
  getVersion,
  mergeExports,
  parseExport,
  parseManifest,
  parseManifests,
  parseOptions,
  Semver
} from '@radpack/build';
```


[@radpack/rollup-plugin]: ../rollup-plugin
[@radpack/webpack-plugin]: ../webpack-plugin

