import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';
import { Template } from 'webpack';
import { RawSource } from 'webpack-sources';
import { createEntry, createExport, toArray } from '@radpack/core';
import {
  constants,
  createManifest,
  getExport,
  getExports,
  getRelativeExport,
  mergeExports,
  parseOptions
} from '@radpack/build';
import {
  HYDRATE,
  JS_TYPES,
  MANIFEST,
  OVERRIDES,
  RUNTIME_DYNAMIC,
  RUNTIME_MANIFEST,
  RUNTIME_MANIFEST_PROP,
  RUNTIME_MANIFEST_REGEX,
  RUNTIME_STATIC,
  SUPPORTED_TARGETS,
  TARGET_NODE
} from './constants';

const { CHUNK_PATH, PLUGIN } = constants;

class RadpackPlugin {
  static getExportIdentifier(exp) {
    return Template.toIdentifier(exp + '.' + RUNTIME_STATIC);
  }

  static getChunkName(chunk) {
    return chunk.name || `${ CHUNK_PATH }/${ chunk.id }`;
  }

  constructor(options) {
    this.options = {
      test: /\.(tsx?|es6?|m?jsx?)$/i,
      applyEntryLoader: true,
      injectManifest: true,
      ...parseOptions(options)
    };
  }

  getModuleBuildInfo(module) {
    if (this.v4) {
      const buildInfo = module.buildInfo;
      if (!buildInfo.radpack) {
        buildInfo.radpack = {
          statics: new Set(),
          dynamics: new Set()
        };
      }
      return buildInfo.radpack;
    }
    let moduleCache = this.modules.get(module.resource);
    if (!moduleCache) {
      moduleCache = {
        statics: new Set(),
        dynamics: new Set()
      };
      this.modules.set(module.resource, moduleCache);
    }
    return moduleCache;
  }

  getExport(source) {
    return getExport(this.exports, source, this.options);
  }

  getRelative(exp) {
    return getRelativeExport(exp, this.options);
  }

  apply(compiler) {
    // Set compiler options
    const errors = [];
    let options = compiler.options;
    const version = compiler.webpack
      ? compiler.webpack.version.charAt(0)
      : '4';
    this.v4 = version === '4';
    this.v5 = version === '5';
    if (this.v4) {
      let helpersPath;
      const helpersName = 'webpack/lib/ParserHelpers';
      try {
        helpersPath = require.resolve(helpersName);
      } catch {
        helpersPath = require.resolve(path.join(process.cwd(), 'node_modules', helpersName));
      }
      const helpers = require(helpersPath);
      this.evaluateToIdentifier = helpers.evaluateToIdentifier;
      this.toConstantDependency = helpers.toConstantDependencyWithWebpackRequire;
    } else {
      options = {
        ...options,
        target: options.target || 'web',
        output: {
          ...options.output,
          path: options.output
            ? options.output.path || path.join(process.cwd(), 'dist')
            : path.join(process.cwd(), 'dist')
        },
        optimization: {
          ...options.optimization,
          runtimeChunk: options.optimization
            ? options.optimization.runtimeChunk || false
            : false
        }
      };
      let helpersPath;
      const helpersName = 'webpack/lib/javascript/JavascriptParserHelpers';
      try {
        helpersPath = require.resolve(helpersName);
      } catch {
        helpersPath = require.resolve(path.join(process.cwd(), 'node_modules', helpersName));
      }
      const helpers = require(helpersPath);
      this.evaluateToIdentifier = helpers.evaluateToIdentifier;
      this.toConstantDependency = helpers.toConstantDependency;
      if (!this.v5) {
        errors.push(`${ PLUGIN }: Unsupported major webpack version: '${ version }'`);
      }
    }
    this.target = options.target;
    if (!SUPPORTED_TARGETS.includes(this.target)) {
      // TODO: Test other targets
      errors.push(`${ PLUGIN }: Unsupported target: '${ this.target }'`);
    }
    if (options.optimization.runtimeChunk) {
      if (this.target === TARGET_NODE) {
        // One runtime per entry is required in node for RADPACK_RESULT support and entries loading other entries
        errors.push(`${ PLUGIN }: Unsupported runtimeChunk for target: '${ this.target }'`);
      }
      if (this.options.injectManifest) {
        // Unable to auto-inject manifest into runtime due to content hashing
        errors.push(`${ PLUGIN }: Unsupported runtimeChunk with injectManifest, set injectManifest to false and manually define ${ MANIFEST } global`);
      }
    }
    if (!this.options.vars.baseUrl) {
      this.options.vars.baseUrl = pathToFileURL(options.output.path);
    }

    // if both webpack-dev-server and radpack local proxy are running, configure dev server to proxy radpack
    // in order for all assets to be served via dev server.
    this.devServer = options.devServer;
    if (this.devServer && process.env.WEBPACK_DEV_SERVER && process.env.RADPACK_LOCAL) {
      this.devServer.proxy = this.devServer.proxy || {};
      this.devServer.proxy['/radpack'] = {
        target: process.env.RADPACK_LOCAL,
        pathRewrite: { '^/radpack': '' }
      };
    }

    // Get exports when starting build
    compiler.hooks.run.tapPromise(PLUGIN, async () => {
      this.modules = new Map();
      this.exports = await getExports(this.options);
    });

    // Only get exports once when starting watch build
    compiler.hooks.watchRun.tapPromise(PLUGIN, async () => {
      this.modules = new Map();
      if (!this.exports) {
        this.exports = await getExports(this.options);
      }
    });

    // Inject radpack and transform runtime and modules
    compiler.hooks.compilation.tap(PLUGIN, (compilation, { normalModuleFactory }) => {
      // Emit errors, if any
      errors.forEach(err => {
        compilation.errors.push(err);
      });

      // Optionally auto force entries to be async, otherwise consumer will handle manually
      if (this.options.applyEntryLoader) {
        compilation.hooks.addEntry
          .tap(PLUGIN, this.addEntry.bind(this));
      }

      // Inject radpack into runtime
      compilation.mainTemplate.hooks.requireExtensions
        .tap(PLUGIN, this.requireExtensions.bind(this, compilation));

      // Force dynamic chunks to load statics
      compilation.mainTemplate.hooks.requireEnsure
        .tap(PLUGIN, this.requireEnsure.bind(this, compilation));

      // Transform modules to use radpack
      const handler = parser => {
        // Update static import calls
        parser.hooks.import
          .tap(PLUGIN, this.import.bind(this, parser));

        // Update static import variables
        parser.hooks.importSpecifier
          .tap(PLUGIN, this.importSpecifier.bind(this, parser));

        // Update dynamic import calls
        parser.hooks.importCall
          .tap(PLUGIN, this.radpackCall.bind(this, parser));

        // Update radpack calls
        parser.hooks.call
          .for('radpack')
          .tap(PLUGIN, expression => this.radpackCall(parser, expression, true));

        // Update radpack references
        parser.hooks.expression
          .for('radpack')
          .tap(PLUGIN, this.toConstantDependency(parser, RUNTIME_DYNAMIC));

        // Update typeof radpack calls
        parser.hooks.evaluateTypeof
          .for('radpack')
          .tap(PLUGIN, this.evaluateToIdentifier(RUNTIME_DYNAMIC, true));

        // Update require calls
        parser.hooks.call
          .for('require')
          .tap(PLUGIN, this.requireCall.bind(this, parser));
      };

      // Apply transforms to JS modules
      JS_TYPES.forEach(type => {
        normalModuleFactory.hooks.parser
          .for(type)
          .tap(PLUGIN, handler);
      });

      // Inject manifest
      if (!this.v4) {
        compilation.hooks.processAssets.tap(PLUGIN, () => {
          this.afterCompile(compilation);
        });
      }
    });

    // Inject manifest
    if (this.v4) {
      compiler.hooks.afterCompile.tap(PLUGIN, this.afterCompile.bind(this));
    }
  }

  addEntry(entry) {
    const dependency = entry && entry.dependencies
      ? entry.dependencies[entry.dependencies.length - 1]
      : entry;

    // Only add logic around JS entries
    if (!dependency || (path.extname(dependency.request) && !dependency.request.match(this.options.test))) {
      return null;
    }

    // support for both radpack local proxy and webpack dev server
    if (process.env.RADPACK_LOCAL && (!this.localProxyLastUpdate || (Date.now() - this.localProxyLastUpdate) > 1000)) {
      const cmd = `radpack register ${ JSON.stringify(process.env.RADPACK_LOCAL) }`;
      const config = toArray(JSON.parse(execSync(cmd).toString()));

      // if webpack-dev-server rewrite baseUrl to go through dev server instead of radpack directly
      if (process.env.WEBPACK_DEV_SERVER && this.devServer.port) {
        config.forEach(o => {
          const url = new URL(o.vars.baseUrl);
          url.port = this.devServer.port;
          o.vars.baseUrl = url.toString();
        });
      }

      this.localProxyRegister = config;
      this.localProxyDeps = '?' + config.map(o => {
        const dep = `deps[]=${ o.file }`;
        delete o.file; // no need to embed file now that deps have been abstracted
        return dep;
      }).join(',');
      this.localProxyLastUpdate = Date.now();
    }

    dependency.request = `@radpack/webpack-plugin/loader${ this.localProxyDeps || '' }!${ dependency.request }`;
  }

  requireExtensions(compilation, source, chunk) {
    const { localProxyRegister, options } = this;
    // Only add logic around JS entries
    if (this.v4) {
      if (chunk.entryModule && !chunk.entryModule.identifier().match(options.test)) {
        return source;
      }
    } else {
      const chunkGraph = compilation.chunkGraph;
      for (const entryModule of chunkGraph.getChunkEntryModulesIterable(chunk)) {
        if (!entryModule.resource.match(options.test)) {
          return source;
        }
      }
    }

    // TODO: Handle static register
    const runtimeRegisters = options.register.filter(config => !!config.register);
    const registers = JSON.stringify(
      localProxyRegister
        ? [...runtimeRegisters, localProxyRegister]
        : runtimeRegisters
    );
    const register = `radpack.register(${ registers }.concat(${ RUNTIME_MANIFEST }).concat(overrides));`;

    return Template.asString([
      // Define radpack
      Template.asString(
        this.target === 'web' ? [
          // Exports var radpack, built for browser usage
          fs.readFileSync(require.resolve('@radpack/client/browser', { paths: [process.cwd()] }), 'utf8')
        ] : [
          // Exports CJS, built for server usage
          `var radpack = require(${ JSON.stringify('@radpack/server') });`
        ]
      ),
      // Inject context
      options.context
        ? `radpack = radpack.withContext(${ JSON.stringify(options.context) });`
        : '',
      // Inject aliases
      `${ RUNTIME_DYNAMIC } = radpack;`,
      `${ RUNTIME_STATIC } = radpack.static.bind(radpack);`,
      // Inject manifest placeholder
      this.options.injectManifest
        ? `${ RUNTIME_MANIFEST };`
        : `${ RUNTIME_MANIFEST } = globalThis.${ MANIFEST } || {};`,
      // Register
      Template.asString(this.target === 'web' ? [
        `var overrides = [];`,
        `if (globalThis.${ HYDRATE }) {`,
        Template.indent([
          `// overrides already applied`,
          `radpack.hydrate(globalThis.${ HYDRATE });`
        ]),
        `} else {`,
        Template.indent([
          `overrides = overrides.concat(globalThis.${ OVERRIDES } || []);`,
          options.override
            ? `overrides = overrides.concat(new URLSearchParams(globalThis.location.search).getAll('${ options.override }'));`
            : '// default overrides logic disabled'
        ]),
        `}`,
        register
      ] : [
        `if (!require.isRadpack) {`,
        Template.indent([
          `var overrides = process.env.${ OVERRIDES } && JSON.parse(process.env.${ OVERRIDES }) || [];`,
          register
        ]),
        `}`
      ]),
      // Append default runtime extensions
      source
    ]);
  }

  requireEnsure(compilation, source, chunk) {
    // Only add logic around JS entries
    if (this.v4) {
      if (chunk.entryModule && !chunk.entryModule.identifier().match(this.options.test)) {
        return source;
      }
    } else {
      const chunkGraph = compilation.chunkGraph;
      for (const entryModule of chunkGraph.getChunkEntryModulesIterable(chunk)) {
        if (!entryModule.resource.match(this.options.test)) {
          return source;
        }
      }
    }
    return Template.asString([
      source,
      `promises.push(new Promise(function (resolve) {`,
      Template.indent([
        `var done = function() { resolve(); };`,
        `${ RUNTIME_DYNAMIC }('${ this.options.name }/${ CHUNK_PATH }/' + chunkId).then(done, done);`
      ]),
      `}));`
    ]);
  }

  import(parser, expression, source) {
    const exp = this.getExport(source);
    if (exp) {
      const module = parser.state.current;
      const identifier = RadpackPlugin.getExportIdentifier(exp);
      this.getModuleBuildInfo(module).statics.add(this.getRelative(exp));
      if (this.v4) {
        module.addVariable(
          identifier,
          `${ RUNTIME_STATIC }(${ JSON.stringify(exp) })`,
          []
        );
        return this.toConstantDependency(parser, '')(expression);
      }
      const variable = `var ${ identifier } = ${ RUNTIME_STATIC }(${ JSON.stringify(exp) });\n`;
      return this.toConstantDependency(parser, variable)(expression);
    }
  }

  importSpecifier(parser, expression, source, exportName, name) {
    const exp = this.getExport(source);
    if (exp) {
      const identifier = RadpackPlugin.getExportIdentifier(exp);
      let value = `var ${ name } = ${ identifier }`;
      if (exportName) {
        value += `.${ exportName }`;
      }
      value += ';\n';
      return this.toConstantDependency(parser, value)(expression);
    }
  }

  radpackCall(parser, expression, force = false) {
    let exp;
    const source = this.v4
      ? expression.arguments[0]
      : expression.source;
    if (source && source.type === 'Literal') {
      const value = source.value;
      exp = this.getExport(value);
      if (!exp && force) {
        exp = value;
      }
    }
    if (exp) {
      this.getModuleBuildInfo(parser.state.current).dynamics.add(this.getRelative(exp));
      return this.toConstantDependency(parser, `${ RUNTIME_DYNAMIC }(${ JSON.stringify(exp) })`)(expression);
    }
  }

  requireCall(parser, expression) {
    const argument = expression.arguments[0];
    if (argument.type === 'Literal') {
      const exp = this.getExport(argument.value);
      if (exp) {
        this.getModuleBuildInfo(parser.state.current).statics.add(this.getRelative(exp));
        return this.toConstantDependency(parser, `${ RUNTIME_STATIC }(${ JSON.stringify(exp) })`)(expression);
      }
    }
  }

  afterCompile(compilation) {
    // Create chunk/module lookups
    const chunksById = {};
    const runtimeChunksById = {};
    const runtimeOnlyChunksById = {};
    const chunkGraph = compilation.chunkGraph;
    compilation.chunks.forEach(chunk => {
      if (this.v4) {
        // Only add logic around JS entries
        if (chunk.entryModule && !chunk.entryModule.identifier().match(this.options.test)) {
          return;
        }
        chunksById[chunk.id] = chunk;
        if (chunk.hasRuntime()) {
          runtimeChunksById[chunk.id] = chunk;
          if (!chunk.hasEntryModule()) {
            runtimeOnlyChunksById[chunk.id] = chunk;
          }
        }
      } else {
        // Only add logic around JS entries
        let hasEntryModule = false;
        for (const entryModule of chunkGraph.getChunkEntryModulesIterable(chunk)) {
          hasEntryModule = true;
          if (!entryModule.resource.match(this.options.test)) {
            return;
          }
        }
        chunksById[chunk.id] = chunk;
        if (chunk.runtime) {
          runtimeChunksById[chunk.id] = chunk;
          if (!hasEntryModule) {
            runtimeOnlyChunksById[chunk.id] = chunk;
          }
        }
      }
    });

    // Map chunk id to names
    const getChunkNames = chunks => chunks
      .filter(id => id in chunksById && !(id in runtimeOnlyChunksById))
      .map(id => `~/${ RadpackPlugin.getChunkName(chunksById[id]) }`);
    const modulesById = {};
    if (this.v4) {
      compilation.modules.forEach(module => {
        if (JS_TYPES.includes(module.type)) {
          modulesById[module.id] = module;
        }
      });
    }

    // Get chunk stats
    const { chunks } = compilation.getStats().toJson();

    // Generate manifest entries
    const buildExports = [];
    chunks.forEach(({ id, modules, siblings, children }) => {
      const runtimeOnly = id in runtimeOnlyChunksById;
      if (!(id in chunksById) || (this.v4 && runtimeOnly)) {
        // Skip runtime chunks
        return;
      }
      const chunk = chunksById[id];
      const isEntry = !!runtimeChunksById[id];
      const entry = RadpackPlugin.getChunkName(chunk);
      const statics = new Set(getChunkNames(siblings || []));
      const dynamics = new Set(getChunkNames(children || []));
      if (this.v4) {
        modules.forEach(({ name, id: moduleId = name }) => {
          const module = modulesById[moduleId];
          if (module) {
            const buildInfo = this.getModuleBuildInfo(module);
            buildInfo.statics.forEach(exp => statics.add(exp));
            buildInfo.dynamics.forEach(exp => dynamics.add(exp));
          }
        });
      } else {
        for (const chunkModule of chunkGraph.getChunkModulesIterable(chunk)) {
          const buildInfo = this.getModuleBuildInfo(chunkModule);
          buildInfo.statics.forEach(exp => statics.add(exp));
          buildInfo.dynamics.forEach(exp => dynamics.add(exp));
        }
      }

      // Set entry data
      buildExports.push(
        createExport(entry, [
          createEntry({
            file: isEntry && !runtimeOnly && Array.from(chunk.files || []).find(file => file.endsWith('.js')),
            statics: [...statics],
            dynamics: [...dynamics]
          }, this.options)
        ], this.options)
      );
    });

    // Generate manifest
    const existing = Object.values(this.exports).filter(e => e.name === this.options.name);
    const manifest = createManifest(mergeExports(buildExports, existing), this.options);

    // Write to file
    compilation.emitAsset(this.options.filename, new RawSource(JSON.stringify(manifest)));

    // Replace manifest placeholder in runtime entries
    if (this.options.injectManifest) {
      Object.values(runtimeChunksById).forEach(chunk => {
        chunk.files.forEach(file => {
          const source = compilation.assets[file].source();
          compilation.assets[file] = new RawSource(source.replace(RUNTIME_MANIFEST_REGEX, (match, end) =>
            `.${ RUNTIME_MANIFEST_PROP }=${ JSON.stringify({ ...manifest, register: false }) }${ end }`
          ));
        });
      });
    }
  }
}

export default RadpackPlugin;
