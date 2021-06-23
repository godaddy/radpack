import { parseVersionArray } from '@radpack/core';

export default (exp, options) => {
  let version;
  if (exp.name in options.dependencies) {
    version = options.dependencies[exp.name];
    if (version === '*') {
      // wildcard, use latest at run-time
      return;
    }
    if (version === 'latest') {
      // latest, use latest at build-time
      version = '';
    }
  }
  const match = version
    ? exp.versions.find(e => e.version.satisfies(version))
    : exp.versions[0];
  if (!match) {
    throw Error(`Unsupported version '${ version }' specified for '${ exp.id }, available: ${exp.versions.map(e => e.version.toString()).join(', ')}`);
  }
  const parsed = parseVersionArray(match.version.toArray());
  if (parsed.release) {
    return parsed.release;
  }
  let prefix = version && version.charAt(0);
  if (!prefix || (prefix !== '^' && prefix !== '~')) {
    prefix = options.defaultPrefix || (parsed.major ? '^' : '~');
  }
  return prefix === '~'
    ? parsed.tilde
    : parsed.caret;
};
