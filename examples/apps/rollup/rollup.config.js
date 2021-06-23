import radpack from '@radpack/rollup-plugin';

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist'
  },
  plugins: [
    radpack({
      // Used at build time, provided in runtime.js
      register: [
        '../../libs/basic/dist/radpack.json',
        '../../libs/logger/dist/radpack.json'
      ]
    })
  ]
};
