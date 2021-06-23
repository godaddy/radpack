const webpack = require('webpack');
const Radpack = require('@radpack/webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'development',
  plugins: [
    // Used for logging
    new webpack.BannerPlugin({
      raw: true,
      entryOnly: true,
      banner: 'globalThis.start = Date.now();'
    }),
    new Radpack({
      // Used at build time and injected into runtime
      register: [
        '../../libs/basic/dist/radpack.json',
        '../../libs/logger/dist/radpack.json'
      ]
    })
  ]
};
