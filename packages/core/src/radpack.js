import noop from './noop';
import isArray from './is-array';
import getExports from './get-exports';
import resolvePath from './resolve-path';
import parseRegister from './parse-register';
import fetchRegister from './fetch-register';
import { EXPORTS, RADPACK, REQUIRE } from './constants/amd';

const AMD_RESERVED = [RADPACK, REQUIRE, EXPORTS];

export default class Radpack extends class extends Function {
  constructor(fn) {
    super();
    return Object.setPrototypeOf(fn, new.target.prototype);
  }
} {
  constructor({
    scope = '',
    context = {},
    cache = new Map(),
    exports = new Map(),
    promise = Promise.resolve()
  } = {}) {
    super(id => this.dynamic(id));
    this._scope = scope;
    this._context = context;
    this._cache = cache;
    this._exports = exports;
    this._promise = promise;
  }

  create(options) {
    return new this.constructor({
      scope: this._scope,
      ...options,
      context: {
        ...this._context,
        ...(options && options.context)
      }
    });
  }

  copy(options) {
    return this.create({
      cache: this._cache,
      exports: this._exports,
      promise: this._promise,
      ...options
    });
  }

  async clone(options) {
    await this.register();
    return this.create({
      cache: new Map(this._cache),
      exports: new Map(this._exports),
      ...options
    });
  }

  withScope(scope) {
    return this.copy({ scope });
  }

  withContext(context) {
    return this.copy({ context });
  }

  hydrate([scope, context, configs], options) {
    this._scope = scope;
    Object.assign(this._context, context);
    return this.register(configs, options);
  }

  set(id, result) {
    const cache = this._getCache(this._getExport(id));
    cache.result = result;
    if (!cache.load) {
      cache.load = Promise.resolve();
    }
  }

  static(id) {
    return isArray(id)
      ? id.map(this.static, this)
      : (this._getCache(this._getExport(id), false) || {}).result;
  }

  async dynamic(id) {
    await this.register();
    await this._load(id);
    return this.static(id);
  }

  async urls(id) {
    await this.register();
    return this._getUrls(this._getExport(id));
  }

  register(config, options) {
    const prev = this._promise.catch(noop);
    if (config) {
      return this._promise = Promise.all([
        this._fetchRegister(config, options),
        this._loaded(),
        prev
      ]).then(([registers]) => {
        this._setRegisters(registers, options);
      });
    }
    return prev;
  }

  require(statics, resolve, reject) {
    (async () => {
      try {
        await this.register();
        const scope = statics.scope;
        const self = scope && scope !== this._scope
          ? this.withScope(scope)
          : this;
        await self._load(statics.filter(id => !AMD_RESERVED.includes(id)));
        if (resolve) {
          const exports = {};
          resolve(...statics.map(id => {
            if (id === RADPACK) {
              return self;
            }
            if (id === REQUIRE) {
              return self.require.bind(self);
            }
            if (id === EXPORTS) {
              return exports;
            }
            return self.static(id);
          }));
        }
      } catch (err) {
        err.message = `require: ${ err.message }`;
        reject && reject(err);
      }
    })();
  }

  define(id, statics, resolve, reject) {
    let cache;
    const handleError = err => {
      err.message = `define '${ id }': ${ err.message }`;
      reject && reject(err);
      cache && cache.reject && cache.reject(err);
    };
    try {
      id = this._parseId(id);
      const exp = this._getExport(id);
      const scoped = ['exports'].concat(statics);
      Object.defineProperty(scoped, 'scope', { value: exp.name });
      cache = this._getCache(exp, false);
      this.require(scoped, (exports, ...args) => {
        // Transform
        resolve && resolve(...args);
        // Persist
        this.set(id, exports);
        // Resolve
        cache && cache.resolve && cache.resolve();
      }, handleError);
    } catch (err) {
      handleError(err);
    }
  }

  _parseId(id) {
    return this._parsePath(this._scope && id.startsWith('~/')
      ? this._scope + id.substr(1)
      : id
    );
  }

  _parseUrl(url) {
    return url ? this._parsePath(url) : false;
  }

  _parsePath(path) {
    return resolvePath(path, this._context);
  }

  _parseRegister(partial, options) {
    const config = parseRegister(partial, options);
    if (config && config.url) {
      config.url = this._parseUrl(config.url);
    }
    return config;
  }

  _getExport(id) {
    id = this._parseId(id);
    const exp = this._exports.get(id);
    if (!exp) {
      throw Error(`Unable to find export '${ id }'`);
    }
    return exp;
  }

  _getUrls(exp) {
    const urls = new Set();
    if (exp.url) {
      urls.add(this._parseUrl(exp.url));
    }
    this._getDeps(exp).forEach(dep => {
      if (dep.url) {
        urls.add(this._parseUrl(dep.url));
      }
    });
    return [...urls];
  }

  _getDeps(exp, exps = new Set()) {
    exp.data.statics.forEach(id => {
      const dep = this._getExport(id);
      if (!exps.has(dep)) {
        exps.add(dep);
        this._getDeps(dep, exps);
      }
    });
    return exps;
  }

  _getCache(exp, create = true) {
    let key, url = false;
    if (typeof exp === 'string') {
      key = url = exp;
    } else {
      const urls = this._getUrls(exp);
      if (exp.url) {
        key = urls.join(',');
        url = urls[0];
      } else {
        key = [exp.id, ...urls].join(',');
      }
    }
    let cache = this._cache.get(key);
    if (!cache && create) {
      this._cache.set(key, cache = { key, url });
    }
    return cache;
  }

  _getExports(registry) {
    return getExports(registry);
  }

  _load(id) {
    if (isArray(id)) {
      return Promise.all(id.map(this._load, this));
    }
    return this._loadExport(this._getExport(id));
  }

  _loaded() {
    return Promise.all(Array.from(this._cache.values()).map(cache => cache.load && cache.load.catch(noop)));
  }

  _loadExport(exp) {
    const cache = this._getCache(exp);
    return this._setCache(cache, () => {
      const url = cache.url;
      let statics = [];
      if (!url) {
        // Get all webpack chunk dependencies
        this._getDeps(exp).forEach(dep => {
          if (dep.url) {
            statics.push(dep.id);
          }
        });
      } else {
        // Get immediate entry dependencies
        statics = exp.data.statics;
        if (exp.url !== url) {
          // Support context exports/defines
          this._exports.set(this._parseId(exp.id), exp);
        }
      }
      // Fetch export and dependencies
      return Promise.all([
        url && this._fetchExport(exp, cache),
        statics.length && this._load(statics)
      ]);
    });
  }

  _loadJson(url, options) {
    const cache = this._getCache(url);
    return this._setCache(cache, () => this._fetchJson(cache, options), 'fetch');
  }

  _fetchRegister(config, options) {
    return fetchRegister(config, {
      ...options,
      parse: this._parseRegister.bind(this),
      fetch: this._loadJson.bind(this)
    });
  }

  _fetchJson() {
    // Defined in client/server
  }

  _fetchExport() {
    // Defined in client/server
  }

  _setExports(exports) {
    Object.entries(exports).forEach(([id, exp]) => {
      this._exports.set(id, exp);
    });
  }

  _setCache(cache, handler, prop = 'load') {
    return prop in cache ? cache[prop] : (cache[prop] = Promise.resolve().then(handler).catch(err => {
      delete cache[prop];
      this._removeCache(cache);
      err.message = `setCache.${ prop } '${ cache.key }': ${ err.message }`;
      throw err;
    }));
  }

  _setRegisters() {
    // Defined in client/server
  }

  _removeCache(cache) {
    this._cache.delete(cache.key);
  }
}
