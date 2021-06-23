import { constants } from '@radpack/core';
import semverSort from 'semver/functions/sort';
import SemVer from './semver';

const { vars: defaultVars } = constants;

export default (exports, options) => {

  // Create vars
  const vars = {};
  const manifest = {};
  Object.entries(options.vars).forEach(([key, value]) => {
    if (!(key in defaultVars) || defaultVars[key] !== value) {
      vars[key] = value;
      manifest.vars = vars;
    }
  });

  const exportEntries = new Map();
  const uniqueVersions = new Map();
  const uniqueDependencies = new Set();

  // Get all entries and unique versions/dependencies
  exports.forEach(({ entry, versions }) => {
    exportEntries.set(entry, versions);
    versions.forEach(({ version, statics, dynamics }) => {
      version = new SemVer(version);
      uniqueVersions.set(version.toString(), version);
      statics.concat(dynamics).forEach(dependency => {
        if (!dependency.startsWith('~/')) {
          uniqueDependencies.add(dependency);
        }
      });
    });
  });

  // Sort and map versions
  const versionsMap = {};
  const versions = semverSort(Array.from(uniqueVersions.values()), true).map((version, index) => {
    versionsMap[version.toString()] = index;
    return version.toArray();
  });

  // Sort and map entries/dependencies
  const entries = [];
  const dependenciesMap = {};
  const dependencies = Array.from(exportEntries.keys()).sort((a, b) =>
    a.split('/').length - b.split('/').length || a.localeCompare(b)
  ).map((entry, index) => {
    dependenciesMap[`~/${ entry }`] = index;
    entries.push(entry);
    return [entry];
  });
  Array.from(uniqueDependencies).sort().forEach(dependency => {
    dependenciesMap[dependency] = dependencies.push(dependency) - 1;
  });

  const resolveDependency = name => {
    if (!(name in dependenciesMap)) {
      throw Error(`missing dependency definition for '${ name }'`);
    }
    return dependenciesMap[name];
  };

  // Map entry values to versions/dependencies
  entries.forEach((entry, index) => {
    let lastStr;
    const versions = [];
    exportEntries.get(entry).forEach(({ version, file, url, statics, dynamics }) => {
      const data = {};
      if (file) {
        data.f = file;
      }
      if (url) {
        data.u = url;
      }
      if (statics.length) {
        data.s = statics.map(resolveDependency).sort();
      }
      if (dynamics.length) {
        data.d = dynamics.map(resolveDependency).sort();
      }
      const str = JSON.stringify(data);
      if (str === lastStr) {
        // Combine versions
        versions[versions.length - 1].v.push(versionsMap[version.toString()]);
      } else {
        versions.push({
          v: [versionsMap[version.toString()]],
          ...data
        });
      }
      lastStr = str;
    });
    dependencies[index].push(versions);
  });

  // Combine
  manifest.exports = {};
  if (versions.length) {
    manifest.exports[options.name] = {
      v: versions,
      d: dependencies
    };
  }
  return manifest;
};
