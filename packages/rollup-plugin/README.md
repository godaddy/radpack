# @radpack/rollup-plugin
A [rollup] plugin for building libraries with radpack.

[Documentation](https://godaddy.github.io/radpack)
![Logo](../../docs/_site/static/radpack-logo.svg)


## Installation
```sh
npm install --save-dev @radpack/rollup-plugin
```


## Usage
```js
import radpack from '@radpack/rollup-plugin';

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist'
  },
  plugins: [
    radpack()
  ]
};
```

For more examples, check out the [library examples](examples).


[examples]: ../../examples/libs/
[rollup]: https://rollupjs.org/

