# @radpack/webpack-plugin
A [webpack] plugin for building applications with radpack.

[Documentation](https://godaddy.github.io/radpack)


## Installation
```sh
npm install --save-dev @radpack/webpack-plugin
```


## Usage
```js
import Radpack from '@radpack/webpack-plugin';

export default {
  entry: 'src/index.js',
  plugins: [
    new Radpack()
  ]
};
```

For more examples, check out the [application example](example-app), [hydrate example](example-hydrate), and [client example](example-client).


[example-app]: ../../examples/apps/webpack/
[example-hydrate]: ../../examples/apps/webpack-hydrate/
[example-client]: ../../examples/clients/webpack/
[webpack]: https://v4.webpack.js.org/

