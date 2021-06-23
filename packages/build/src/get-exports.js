import getManifests from './get-manifests';
import parseManifests from './parse-manifests';

const versionCompare = (a, b) => a.version.compare(b.version);

export default async (options) => {
  // Get Exports from Manifests
  const [registerManifests, partialManifests] = await Promise.all([
    getManifests(options.register, options),
    getManifests(options.partials, options)
  ]);
  const registerExports = parseManifests(registerManifests, true, options);
  const partialExports = parseManifests(partialManifests, false, options);
  // Merge Exports
  return Object.entries(partialExports).reduce((existingExports, [id, partialExport]) => {
    if (id in existingExports) {
      // Existing version(s) that do not match partial version(s)
      const existingVersions = existingExports[id].versions.filter(a =>
        partialExport.versions.every(b => !!versionCompare(a, b))
      );
      // Combine and sort versions
      partialExport.versions = partialExport.versions.concat(existingVersions).sort(versionCompare);
    }
    // Override existing with partial
    existingExports[id] = partialExport;
    return existingExports;
  }, registerExports);
};
