import ava from 'ava';
import path from 'path';
import ninos from 'ninos';
import spawn from '../../packages/cli/src/utils/spawn';

const root = path.resolve(__dirname, '../../examples');

export default () => {
  let id = 0;
  const test = ninos(ava);

  test.before(t => {
    Object.assign(t.context, {
      root,
      spawn: (cmd, args, options) => spawn(cmd, args, {
        env: {
          ...process.env,
          NODE_ENV: 'integration'
        },
        ...options
      }),
      resolve: (dir) => path.resolve(root, dir)
    });
  });

  test.beforeEach(t => {
    Object.assign(t.context, {
      id: `test_${ id++ }`,
      async run(cwd) {
        const array = [];
        const object = {};
        let raw = '';
        await t.context.spawn('npm', ['start', '--no-update-notifier'], {
          cwd,
          stdio: ['ignore', 'pipe', 'pipe'],
          callback(child) {
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', (data) => {
              raw += data;
              try {
                data.split('\n').forEach(json => {
                  const result = JSON.parse(json);
                  array.push(result);
                  object[result.id] = result;
                });
              } catch (e) {
                // ignore
              }
            });
            child.stderr.setEncoding('utf8');
            child.stderr.on('data', (data) => {
              raw += data;
            });
          }
        });
        return { array, object, raw };
      }
    });
  });

  return test;
};
