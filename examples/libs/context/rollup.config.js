import util from 'util';
import dirsum from 'dirsum';
import radpack from '@radpack/rollup-plugin';

const digest = util.promisify(dirsum.digest);

export default digest('src', 'sha256').then(dir => {
  const hash = dir.hash.substr(0, 8);
  return ['a', 'b'].map(flag => ({
    input: {
      index: require.resolve(`./src/${ flag }`)
    },
    output: {
      dir: 'dist',
      entryFileNames: '${flag}/index.js'
    },
    plugins: [
      radpack({
        // ensures the file names are consistent but immutable based on the content
        hash,
        // maps the filename to an entry
        entryNames: {
          '${flag}/index': 'index'
        },
        // used at build time, but consumer must provide at runtime
        context: { flag },
        register: '../logger/dist/radpack.json'
      })
    ]
  }));
});
