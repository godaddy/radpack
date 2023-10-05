const webpack = require('webpack');
const Radpack = require('@radpack/webpack-plugin');

module.exports = {
  mode: 'development',
  output: {
    publicPath: 'dist/'
  },
  plugins: [
    // Used for logging
    new webpack.BannerPlugin({
      raw: true,
      entryOnly: true,
      banner: 'globalThis.start = Date.now();'
    }),
    new Radpack({
      register: [
        `${ process.env.RADPACK_STATICS }/libs/basic/dist/radpack.json`,
        `${ process.env.RADPACK_STATICS }/libs/logger/dist/radpack.json`
      ]
    })
  ]
};
