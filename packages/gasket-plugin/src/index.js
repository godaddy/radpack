import radpack from '@radpack/server';
import Middleware from '@radpack/server/middleware';

export default {
  name: '@radpack/gasket-plugin',
  hooks: {
    middleware({ config }) {
      const middlewares = [];
      let proxy = config.radpack?.proxy;

      console.log('in middleware', proxy);

      // Initialize optional local proxy
      if (proxy) {
        if (typeof proxy !== 'object') {
          proxy = {};
        }
        middlewares.push(new Middleware(proxy));
      }

      // Expose instance
      middlewares.push(async (req, res, next) => {
        res.locals.radpack = radpack;
        res.locals.gasketData = res.locals.gasketData || {};
        res.locals.gasketData.radpackState = await radpack.dehydrate();
        console.log('in handler', `${ req.headers.host + (req.originalUrl || req.url) }`);
        next();
      });

      return middlewares;
    },
    servers({ config }) {
      const { register = [], registerOptions = {} } = config.radpack || {};
      console.log('in servers', register, registerOptions);

      // Register
      radpack.register(register, registerOptions);
    }
  }
};
