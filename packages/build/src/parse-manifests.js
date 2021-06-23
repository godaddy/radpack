import parseManifest from './parse-manifest';

export default (manifests, filter, options) => {
  const { name, version, keepMajors = true, keepMinors = !version.major, keepReleases = true } = options;
  return manifests.reduce((exports, manifest) => {
    parseManifest(manifest).forEach(exp => {
      if (filter && exp.name === name) {
        // Filter out versions
        exp.versions = exp.versions.filter(({ version: entry }) => {
          switch (version.diff(entry)) {
            case 'major':
              return keepMajors;
            case 'minor':
              return keepMinors;
            case 'premajor':
            case 'preminor':
            case 'prepatch':
            case 'prerelease':
              return keepReleases;
            default:
              return false;
          }
        });
      }
      if (exp.versions.length) {
        // Expose
        exports[exp.id] = exp;
      }
    });
    return exports;
  }, {});
};
