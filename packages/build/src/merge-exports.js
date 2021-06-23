import semverEq from 'semver/functions/eq';
import semverGt from 'semver/functions/gt';

export default (exps, existing) => exps.reduce((arr, exp) => {
  const old = existing.find(old => old.entry === exp.entry);
  if (!old) {
    // New entry
    arr.push(exp);
    return arr;
  }
  // Update existing entry
  let replace = false;
  const data = exp.versions[0];
  const versions = old.versions;
  // Find where to update
  const index = versions.findIndex(old => {
    if (semverEq(data.version, old.version)) {
      // Same version, replace at index
      return (replace = true);
    }
    if (semverGt(data.version, old.version)) {
      // Newer version, prepend to index
      return true;
    }
  });
  if (index >= 0) {
    // Prepend/Replace
    versions.splice(index, replace ? 1 : 0, data);
  } else {
    // Older version, append
    versions.push(data);
  }
  return arr;
}, existing.slice(0));
