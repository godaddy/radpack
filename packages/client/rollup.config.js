import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import externals from '../../configs/rollup/externals';
import * as outputs from '../../configs/rollup/outputs';
import * as plugins from '../../configs/rollup/plugins';
import pkg from './package.json';

const config = {
  input: 'src/index.js',
  output: {
    intro: [
      // Minification feature, mangles global properties
      // ex: Promise.all(...) => $.all(...)
      `const global = globalThis;`,
      `const { Promise, Array, Map, Set, Object, Error, document } = global;`
    ].join('\n')
  }
};

export default [{
  ...config,
  external: externals(pkg),
  output: [{
    ...outputs.commonjs,
    ...config.output,
    file: 'lib/index.cjs.js'
  }, {
    ...outputs.esm,
    ...config.output,
    file: 'lib/index.esm.js'
  }],
  plugins: [
    resolve(plugins.resolve),
    babel({
      ...plugins.babel,
      envName: 'client'
    })
  ]
}, {
  ...config,
  output: {
    ...outputs.iife,
    ...config.output,
    name: 'radpack',
    file: 'lib/browser.js'
  },
  plugins: [
    resolve(plugins.resolve),
    babel({
      ...plugins.babel,
      envName: 'browser'
    }),
    terser({
      ...plugins.terser,
      mangle: {
        properties: {
          // Minification feature, mangles properties that start with _
          // ex: this._setCache(...) => this.$(...)
          regex: /^_/
        }
      }
    })
  ]
}];
