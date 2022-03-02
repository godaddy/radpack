import fs from 'fs';
import path from 'path';
import glob from 'glob';
import serveStatic from 'serve-static';

const isWin32 = process.platform === 'win32';
const trimSlashesRegEx = /(^\/+|\/+$)/g;
const formatPathRegEx = isWin32 && /\\/g;
const nodeModules = 'node_modules';

const gFileCache = {};

export default class Middleware {

  static trimSlashes(string) {
    return string.replace(trimSlashesRegEx, '');
  }

  static formatRoute(route) {
    return `/${ this.trimSlashes(route) }`;
  }

  static formatPath(filePath) {
    return isWin32 ? filePath.replace(formatPathRegEx, '/') : filePath;
  }

  constructor({
    cwd = process.cwd(),
    dist = 'dist',
    route = '/radpack',
    headers = {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    },
    pattern,
    proxy,
    proxyHost,
    proxyRoute = route,
    proxyOptions,
    ...options
  } = {}) {
    // Options
    this.root = path.resolve(cwd);
    this.distPath = dist;
    this.headers = headers;
    this.dist = Middleware.formatPath(path.join(this.root, this.distPath));
    this.modules = Middleware.formatPath(path.join(this.root, nodeModules));
    this.route = Middleware.formatRoute(route);
    this.pattern = pattern || `${ this.distPath }/**/radpack.json`;
    this.proxyRoute = Middleware.formatRoute(proxyRoute);
    this.proxyRouteBase = this.proxyRoute + '/';
    this.proxyHost = proxyHost;
    // Handlers (ie: options.onRefresh overrides handleRefresh)
    Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach(key => {
      if (key.startsWith('handle')) {
        this[`_${ key }`] = this[key].bind(this);
        const event = `on${ key.substr(6) }`;
        this[key] = (options[event] || this[key]).bind(this);
      }
    });
    // Create proxy after handlers are assigned
    this.proxy = proxy || serveStatic(this.root, {
      cacheControl: false,
      setHeaders: this.handleSetHeaders.bind(this),
      ...proxyOptions
    });
    this.load();
    // Middleware
    const middleware = (req, res, next) => {
      this.req = req;
      this.res = res;
      this.next = next;
      const proto = req.connection && req.connection.encrypted ? 'https' : 'http';
      this.reqUrl = new URL(`${ proto }://${ req.headers.host + (req.originalUrl || req.url) }`);
      this.handleRequest();
    };
    middleware.refresh = this.load.bind(this);
    return middleware;
  }

  load() {
    this.dirs = [];
    this.files = [];
    [ // Get root directories
      ...glob.sync('@*/*/', { cwd: this.modules, absolute: true }),
      ...glob.sync('[^@]*/', { cwd: this.modules, absolute: true })
    ].filter(dir => {
      // Filter for symlink directories OR root
      try {
        return fs.lstatSync(dir).isSymbolicLink(); // eslint-disable-line no-sync
      } catch {
        return false;
      }
    }).concat(this.root).forEach(dir => {
      const files = glob.sync(this.pattern, { cwd: dir, absolute: true });
      if (files.length) {
        // Whitelist proxy directory
        this.dirs.push(dir);
        files.forEach(file => {
          this.files.push(file);
        });
      }
    });
  }

  manifestRequest() {
    const manifests = [];
    const baseUrl = `${ Middleware.trimSlashes(this.proxyHost || this.reqUrl.origin) + this.proxyRoute }/`;
    this.files.forEach(file => {
      // Load manifest
      const manifest = this.handleLoadManifest(file);
      if (!manifest) {
        return;
      }
      const proxyFile = Middleware.formatPath(path.dirname(path.relative(this.root, file)));
      const vars = manifest.vars = manifest.vars || {};
      vars.baseUrl = baseUrl + proxyFile;
      manifests.push(manifest);
    });
    // Return manifests
    this.handleReturnManifests(manifests);
  }

  // dist/radpack.json
  // node_modules/lib/folder/radpack.json
  // node_modules/@scoped/lib/radpack.json
  proxyRequest(file) {
    if (file.startsWith(nodeModules)) {
      // Symlink request
      let [, scope, lib, folder] = file.split('/');
      if (!scope || !lib) {
        // Not enough information
        return void this.next();
      }
      let name;
      if (scope.startsWith('@')) {
        name = `${ scope }/${ lib }`;
      } else {
        name = scope;
        folder = lib;
      }
      const dir = Middleware.formatPath(path.join(this.modules, name));
      // Validate request
      if (folder === nodeModules || !this.dirs.includes(dir)) {
        return void this.next();
      }
    } else if (!file.startsWith(this.distPath)) {
      // Unknown request
      return void this.next();
    }
    // Return file
    this.handleProxyFile(file);
  }

  // Can override with options.onRequest
  handleRequest() {
    try {
      const route = Middleware.formatRoute(this.reqUrl.pathname);
      // Manifests
      if (route === this.route) {
        return void this.manifestRequest();
      }
      // Proxy
      if (route.startsWith(this.proxyRouteBase)) {
        const file = route.substr(this.proxyRouteBase.length);
        return void this.proxyRequest(file);
      }
    } catch (err) {
      // Error
      return void this.next(err);
    }
    // 404
    this.next();
  }

  // Can override with options.onLoadManifest
  handleLoadManifest(file) {
    try {
      let cache = gFileCache[file];
      const json = fs.readFileSync(file, 'utf8');
      if (cache && json === gFileCache.json) {
        return cache.manifest; // if unchanged, use cache
      }
      gFileCache[file] = cache = {
        json,
        manifest: JSON.parse(json)
      };
      cache.manifest.file = file;
      return cache.manifest;
    } catch {
      return false;
    }
  }

  // Can override with options.onReturnManifests
  handleReturnManifests(manifests) {
    // Set headers
    this.handleSetHeaders(this.res);
    // Send Response
    if (this.res.send) {
      // express
      this.res.set();
      return void this.res.send(manifests);
    }
    // http/connect
    this.res.setHeader('Content-Type', 'application/json');
    this.res.end(JSON.stringify(manifests));
  }

  // Can override with options.onProxyFile
  handleProxyFile(file) {
    this.proxy({ ...this.req, url: file }, this.res, this.next);
  }

  // Can override with options.onSetHeaders
  handleSetHeaders(res) {
    if (this.headers) {
      Object.entries(this.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
  }
}
