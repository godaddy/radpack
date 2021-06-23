import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import externals from '../../configs/rollup/externals';
import * as outputs from '../../configs/rollup/outputs';
import * as plugins from '../../configs/rollup/plugins';
import pkg from './package.json';

export default ['index', 'loader'].map(entry => ({
  input: `src/${ entry }.js`,
  external: externals(pkg),
  output: [{
    ...outputs.commonjs,
    file: `lib/${ entry }.cjs.js`
  }, {
    ...outputs.esm,
    file: `lib/${ entry }.esm.js`
  }],
  plugins: [
    resolve(plugins.resolve),
    commonjs(plugins.commonjs),
    babel(plugins.babel)
  ]
}));
