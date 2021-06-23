import { createEntry, createExport, resolvePath } from '@radpack/core';
import { constants, createManifest, getExport, getExports, getRelativeExport, mergeExports, parseOptions } from '@radpack/build';
import transform from './transform';

const { CHUNK_PATH, PLUGIN } = constants;
const getEntryName = file => file.substr(0, file.length - 3);

export default function RadpackPlugin(options) {
  let exports;
  options = parseOptions(options);
  const getExportById = id => getExport(exports, id, options);
  const resolveContext = value => resolvePath(value, options.context);
  const getEntryId = entry => {
    let id;
    if (options.entryNames) {
      const entryNames = options.entryNames;
      if (typeof entryNames === 'function') {
        id = entryNames(entry);
      } else if (entry in entryNames) {
        id = entryNames[entry];
      }
    }
    return resolveContext(id || entry);
  };
  const mapDependency = function (id) {
    if (id.endsWith('.js')) {
      return `~/${ getEntryId(getEntryName(id)) }`;
    }
    const exp = getExportById(id);
    if (!exp) {
      // Non-radpack externals not supported!
      return void this.error(`unknown export '${ id }'`);
    }
    return getRelativeExport(exp, options);
  };
  return {
    name: PLUGIN,
    async buildStart() {
      exports = await getExports(options);
    },
    resolveId(id, from) {
      if (!from) {
        return null;
      }
      const exp = getExportById(id);
      if (exp) {
        return { id: exp, external: true };
      }
    },
    outputOptions(output) {
      let {
        format = 'amd',
        entryFileNames = '[name].js',
        chunkFileNames = '[name].js'
      } = output;
      if (format !== 'amd') {
        this.error(`'output.format' must be 'amd', was set to '${ format }'`);
      }
      if (entryFileNames.includes('[hash]')) {
        this.error(`'output.entryFileNames' has a [hash] which is handled by radpack, unable to use '${ entryFileNames }'`);
      }
      chunkFileNames = `${ CHUNK_PATH }/${ chunkFileNames }`;
      if (chunkFileNames.includes('[hash]')) {
        this.error(`'output.chunkFileNames' has a [hash] which is handled by radpack, unable to use '${ chunkFileNames }'`);
      }
      return {
        // Suggested options
        freeze: false,
        // User options
        ...output,
        // Forced options
        format: 'amd',
        exports: 'named',
        interop: 'esModule',
        hoistTransitiveImports: false,
        entryFileNames,
        chunkFileNames
      };
    },
    renderChunk(code, chunk, { sourcemap }) {
      const { fileName, imports = [], dynamicImports = [] } = chunk;
      const buildExports = this.meta.radpack ? this.meta.radpack : (this.meta.radpack = []);
      const entry = getEntryName(fileName);

      // Update code
      const res = transform({
        code,
        ast: this.parse(code)
      }, {
        entry,
        name: options.name,
        file: chunk.fileName
      });

      // Create hash
      let hash = options.hash;
      if (typeof hash === 'function') {
        hash = hash(res.code, { entry, chunk });
      }

      // Update fileName
      const file = `${ entry }${ hash ? `-${ hash }` : '' }.js`;
      chunk.fileName = resolveContext(file);
      res.setId(`${ options.name }/${ chunk.fileName }`);

      // Set entry data
      buildExports.push(
        createExport(getEntryId(entry), [
          createEntry({
            file,
            statics: imports.map(mapDependency, this),
            dynamics: dynamicImports.map(mapDependency, this)
          }, options)
        ], options)
      );

      // Return result
      return {
        code: res.code,
        map: sourcemap
          ? res.map
          : null
      };
    },
    generateBundle() {
      const buildExports = (this.meta.radpack || []).splice(0);

      // Generate manifest
      const existing = Object.values(exports).filter(e => e.name === options.name);
      const manifest = createManifest(mergeExports(buildExports, existing), options);

      // Write Manifest
      this.emitFile({
        type: 'asset',
        source: JSON.stringify(manifest),
        fileName: options.filename
      });
    }
  };
}
