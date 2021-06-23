import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import externals from '../../configs/rollup/externals';
import * as outputs from '../../configs/rollup/outputs';
import * as plugins from '../../configs/rollup/plugins';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  external: externals(pkg),
  output: {
    ...outputs.commonjs,
    banner: '#!/usr/bin/env node',
    file: 'lib/index.js'
  },
  plugins: [
    resolve(plugins.resolve),
    commonjs(plugins.commonjs),
    babel(plugins.babel)
  ]
};
