const path = require('path');
const webpack = require('webpack');
const Radpack = require('@radpack/webpack-plugin');
const pkg = require('./package.json');

module.exports = [{
  target: 'web',
  mode: 'development',
  entry: './src/client',
  output: {
    publicPath: '/apps/webpack-hydrate-react/dist/client/',
    path: path.resolve('./dist/client')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }]
  },
  plugins: [
    // Used for logging
    new webpack.BannerPlugin({
      raw: true,
      entryOnly: true,
      banner: 'globalThis.start = Date.now();'
    }),
    new Radpack({
      // Used at build time and provided by hydrate during runtime
      register: [
        '../../libs/basic/dist/radpack.json',
        '../../libs/logger/dist/radpack.json'
      ]
    })
  ]
}, {
  target: 'node',
  mode: 'development',
  entry: './src/server',
  output: {
    path: path.resolve('./dist/server')
  },
  // We don't want to bundle dependencies like express
  externals: Object.keys(pkg.dependencies).reduce((obj, key) => {
    obj[key] = `commonjs ${ key }`;
    return obj;
  }, {}),
  plugins: [
    new Radpack({
      // Used at build time and injected into runtime
      register: [
        '../../libs/basic/dist/radpack.json',
        '../../libs/logger/dist/radpack.json'
      ]
    })
  ]
}];
