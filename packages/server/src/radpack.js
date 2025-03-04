import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Radpack, { flatten, noop } from '@radpack/core';
import { fetch, parseUrl, constants } from '@radpack/core/server';
import { DEFAULT_EXPIRE, DEFAULT_RETRIES, DEFAULT_TTS } from './constants';

const CWD = process.cwd();
const SERVER_PATH = '@radpack/server';
const SERVER_ABS_PATH = require.resolve(SERVER_PATH);
const { DEFAULT_DELAY, DEFAULT_TIMEOUT } = constants;

export default class extends Radpack {
  constructor({ registers = [], ...options } = {}) {
    super(options);
    this._registers = registers;
  }

  async dehydrate({ parse } = {}) {
    await this.register();
    const scope = this._scope;
    const context = { ...this._context };
    const registers = this._registers.reduce((arr, { registers }) => {
      registers.forEach(config => {
        const { vars, exports: exps, register } = config;
        if (register !== false && Object.keys(exps).length) {
          let partial = { exports: exps };
          if (Object.keys(vars).length) {
            partial.vars = vars;
          }
          if (parse) {
            const parsed = parse(partial, config);
            if (parsed != null) {
              partial = parsed;
            }
          }
          if (partial) {
            arr.push(partial);
          }
        }
      });
      return arr;
    }, []);
    return [
      scope,
      context,
      registers
    ];
  }

  copy(options) {
    return super.copy(({
      registers: this._registers,
      ...options
    }));
  }

  async clone(options) {
    const clone = await super.clone(options);
    if (!options || !options.registers) {
      clone._registers = [...this._registers];
    }
    return clone;
  }

  register(config, options) {
    if (config) {
      config = flatten(config);
      options = {
        tts: this === globalThis.radpack
          ? DEFAULT_TTS
          : 0,
        delay: DEFAULT_DELAY,
        timeout: DEFAULT_TIMEOUT,
        retries: DEFAULT_RETRIES,
        done: noop,
        ...options,
        config,
        urls: new Set()
      };
    }
    return super.register(config, options);
  }

  _parseUrl(url) {
    return parseUrl(super._parseUrl(url), CWD);
  }

  _getCache(exp, create) {
    const cache = super._getCache(exp, create);
    if (cache) {
      cache.time = Date.now();
    }
    return cache;
  }

  async _fetchExport(exp, cache) {
    const url = cache.url;
    const res = await fetch(url);
    if (!res.ok) {
      throw Error(await res.text());
    }
    const isFile = url.startsWith('file:');
    const filename = isFile && fileURLToPath(url) || '';
    const dirname = filename && path.dirname(filename) || '';
    const resolveOptions = dirname ? { paths: [dirname] } : void 0;
    const requireProxy = id => {
      if (id === SERVER_PATH) {
        return this;
      }
      const resolved = require.resolve(id, resolveOptions);
      return resolved === SERVER_ABS_PATH
        ? this
        : require(resolved);
    };
    const mockRequire = Object.assign(requireProxy, require, { isRadpack: true });
    let text = `${ await res.text() }\nglobalThis.require=require;\n//# sourceURL=${ encodeURI(exp.id) };`;
    if (text.startsWith('define(')) {
      return new Promise((resolve, reject) => {
        // Attach promise handlers (called in define)
        cache.resolve = resolve;
        cache.reject = reject;
        // Update sourcemap host
        const host = (
          dirname
            ? pathToFileURL(dirname).href
            : path.dirname(url)
        ) + '/';
        text = text.replace(/\/\/#\ssourceMappingURL=/, match => match + host);
        try {
          // Run define script (async) w/ server side require support
          Function('define', 'require', '__dirname', '__filename', text)(
            this.define.bind(this),
            mockRequire,
            dirname,
            filename
          );
        } catch (e) {
          reject(e);
        }
      }).catch(err => {
        this._removeCache(cache);
        throw err;
      });
    }
    if (!isFile) {
      throw Error(`Unknown format for '${ url }'`);
    }
    const result = {};
    // Run runtime script (sync)
    Function('require', 'RADPACK_RESULT', text)(mockRequire, result);
    cache.result = result.default;
  }

  _loadJson(url, options) {
    // Provided by register, used in setRegisters/watch
    options.urls.add(url);
    return super._loadJson(url, options);
  }

  async _fetchJson(cache, options) {
    const { delay, timeout, retries } = options;
    const { url, last, etag } = cache;
    const headers = {};
    if (last) {
      headers['If-Modified-Since'] = last;
    }
    if (etag) {
      headers['If-None-Match'] = etag;
    }
    const res = await fetch(url, { headers, delay, timeout, retries });
    const isCacheHit = cache.json && res.status === 304;
    if (!isCacheHit && !res.ok) {
      throw Error(await res.text());
    }
    if (!isCacheHit) {
      const json = await res.json();
      cache.json = json;
      cache.jsonString = JSON.stringify(json);
      cache.last = res.headers.get('Last-Modified');
      cache.etag = res.headers.get('ETag');
    }
    return cache.json;
  }

  _setRegisters(registers, options) {
    this._clearCache();
    const urls = [...options.urls];
    const index = this._registers.length;
    const { exports: exps } = this._setRegister(index, registers);
    exps.forEach(this._setExports, this);
    options.done({ urls }, this);
    if (options.tts > 0 && urls.length) {
      this._watch(index, urls, options);
    }
  }

  _setRegister(index, registers) {
    const exps = [];
    registers.forEach(register => {
      exps.push(this._getExports(register));
    });
    return this._registers[index] = { registers, exports: exps };
  }

  _watch(index, urls, options) {
    setTimeout(() => {
      let nextUrls = urls;
      this._promise = Promise.all([
        // Wait for preview registers/watches
        this._promise.catch(noop),
        // Wait for all exports to be defined
        this._loaded()
      ]).then(async () => {
        let hasChanges = false;
        await Promise.all(urls.map(async url => {
          // Get current json
          const cache = this._getCache(url);
          const prevJson = cache.jsonString;
          // Force refresh
          delete cache.fetch;
          await this._loadJson(url, options);
          // Compare
          if (prevJson !== this._getCache(url).jsonString) {
            hasChanges = true;
          }
        }));
        if (hasChanges) {
          options.urls = new Set();
          const registers = await this._fetchRegister(options.config, options);
          nextUrls = [...options.urls];
          this._setRegister(index, registers);
          this._resetExports();
          options.done({ urls: nextUrls }, this);
        }
      }).catch(() => {
        // Revert to prior urls
        nextUrls = urls;
      }).finally(() => {
        this._clearCache();
        this._watch(index, nextUrls, options);
      });
    }, options.tts).unref();
  }

  _clearCache() {
    const now = Date.now();
    this._cache.forEach((cache) => {
      // Delete expired load caches
      if (cache.load && now - cache.time > DEFAULT_EXPIRE) {
        this._removeCache(cache);
      }
    });
  }

  _resetExports() {
    this._exports.clear();
    this._registers.forEach(({ exports: exps }) => {
      exps.forEach(this._setExports, this);
    });
  }

}
