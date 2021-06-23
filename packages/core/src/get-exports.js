import parseManifest from './parse-manifest';
import getExportId from './get-export-id';
import resolvePath from './resolve-path';
import parseVersionArray from './parse-version-array';

export default manifest => {
  const { register = true } = manifest;
  return parseManifest(manifest, (entry, { name }) => getExportId(name, entry), array => {
    const { version, release, caret, tilde } = parseVersionArray(array);
    return {
      version,
      versions: release
        ? [version]
        : [caret, tilde]
    };
  }).reduce((exports, { vars, name, entry, versions }) => {
    const resolvePathOptions = { ...vars, name, entry };
    const entryPath = getExportId('', entry);
    versions.forEach(data => {
      const { version, file } = data;
      let url = data.url || file && vars.url;
      url = url
        ? resolvePath(url, { ...resolvePathOptions, file })
        : false;
      const exp = { url, data, name, internal: !register };
      let hasId = false;
      if (file) {
        hasId = true;
        exports[exp.id = `${ name }/${ file }`] = exp;
      }
      [name + entryPath].concat(version.versions.map(version => `${ name }@${ version }${ entryPath }`)).forEach(id => {
        if (!(id in exports)) {
          exports[id] = hasId ? exp : { id, ...exp };
        }
      });
    });
    return exports;
  }, {});
};
