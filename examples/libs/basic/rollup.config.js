import radpack from '@radpack/rollup-plugin';

export default {
  input: {
    index: 'src/index.js',
    entry: 'src/entry.js'
  },
  output: {
    dir: 'dist'
  },
  plugins: [
    radpack({
      // used at build time, but consumer must provide at runtime
      register: '../logger/dist/radpack.json'
    })
  ]
};
