import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import externals from '../../configs/rollup/externals';
import * as outputs from '../../configs/rollup/outputs';
import * as plugins from '../../configs/rollup/plugins';
import pkg from './package.json';

const external = externals(pkg);

export default [{
  input: 'src/index.js',
  external,
  output: [{
    ...outputs.commonjs,
    file: 'lib/index.cjs.js'
  }, {
    ...outputs.esm,
    file: 'lib/index.esm.js'
  }],
  plugins: [
    resolve(plugins.resolve),
    commonjs(plugins.commonjs),
    babel({
      ...plugins.babel,
      envName: 'node'
    })
  ]
}, {
  input: 'src/withRadpack.js',
  external,
  output: [{
    ...outputs.commonjs,
    file: 'lib/withRadpack.cjs.js'
  }, {
    ...outputs.esm,
    file: 'lib/withRadpack.esm.js'
  }],
  plugins: [
    resolve(plugins.resolve),
    // commonjs(plugins.commonjs),
    babel({
      ...plugins.babel,
      envName: 'client'
    })
  ]
}];
