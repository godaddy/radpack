/* eslint-disable no-console */
import http from 'http';
import connect from 'connect';
import serveStatic from 'serve-static';
import opener from 'opener';
import { resolvePath } from '@radpack/core';
import spawn from '../utils/spawn';

export const command = 'local [cwd]';
export const description = 'Run a local server and proxy to serve locally installed/linked radpack packages';

export function builder(yargs) {
  yargs.positional('cwd', {
    describe: 'Root directory to detect locally installed/linked radpack packages',
    type: 'string',
    default: process.cwd()
  }).options({
    port: {
      describe: 'Port to listen',
      type: 'number',
      default: 3723
    },
    host: {
      describe: 'Host to listen',
      type: 'string',
      default: 'localhost'
    },
    tts: {
      describe: 'Time to stale if you wish for auto-refresh',
      type: 'number',
      default: 0
    },
    route: {
      describe: 'Proxy route',
      type: 'string',
      default: '/radpack'
    },
    dist: {
      describe: 'Folder for registry files',
      type: 'string',
      default: 'dist'
    },
    statics: {
      describe: 'Static directory',
      type: 'string',
      default: './'
    },
    staticsRoute: {
      describe: 'Static route',
      type: 'string',
      default: '/statics'
    },
    run: {
      describe: 'Run after server listening',
      type: 'array',
      default: []
    },
    open: {
      describe: `Open after "--run"`,
      type: 'array',
      default: []
    }
  });
}

export async function handler({ port, host, statics, staticsRoute, run, open, ...middlewareOpts }) {
  const app = connect();
  const Middleware = (await import('@radpack/server/middleware')).default;
  const middleware = new Middleware(middlewareOpts);
  app.use(function cors(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use(middleware);
  let RADPACK_STATICS;
  const RADPACK_HOST = `http://${ host }:${ port }`;
  const RADPACK_LOCAL = `${ RADPACK_HOST }${ middlewareOpts.route }`;
  if (statics) {
    RADPACK_STATICS = `${ RADPACK_HOST }${ staticsRoute }`;
    app.use(staticsRoute, serveStatic(statics));
  }

  const server = http.createServer(app);

  server.listen(port, host, () => {
    console.log(`radpack local proxy available at ${ RADPACK_LOCAL }`);
    if (RADPACK_STATICS) {
      console.log(`radpack statics available at ${ RADPACK_STATICS }`);
    }

    const env = {
      ...process.env,
      RADPACK_HOST,
      RADPACK_LOCAL,
      RADPACK_STATICS
    };

    let idleCycles = 0;
    Promise.race([
      // Wait for all `run` scripts to finish
      Promise.all(run.map(str => {
        console.log(`Running '${ str }'...`);
        const [cmd, ...args] = str.split(' ');
        return spawn(cmd, args, {
          env,
          stdio: [0, 'pipe', 2],
          callback(child) {
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function (data) {
              console.log(data);
              // Reset idle stdout time
              idleCycles = 0;
            });
          }
        });
      })),
      // Or wait 10s+ of idle stdout time
      new Promise(resolve => {
        const interval = setInterval(() => {
          if (++idleCycles >= 10) {
            resolve();
            clearInterval(interval);
          }
        }, 1000).unref();
      })
    ]).then(() => {
      // Then run open
      const openLength = open.length;
      if (openLength) {
        // Resolve env variables
        const urls = open.map(url => resolvePath(url, env));
        opener(urls);
        console.log('opening', openLength > 1 ? urls : urls[0]);
      }
    });
  });
}
