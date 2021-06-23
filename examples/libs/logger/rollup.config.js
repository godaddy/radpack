import radpack from '@radpack/rollup-plugin';

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist'
  },
  plugins: [
    radpack()
  ]
};
