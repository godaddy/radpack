import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import externals from '../../configs/rollup/externals';
import * as outputs from '../../configs/rollup/outputs';
import * as plugins from '../../configs/rollup/plugins';
import pkg from './package.json';

export default ['index', 'middleware'].map(entry => ({
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
    babel(plugins.babel)
  ]
}));
