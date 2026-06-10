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
    if (version === '^' || version === '~') {
      // bare prefix (from workspace:^ or workspace:~), use latest at build-time with prefix
      const prefix = version;
      const latest = exp.versions[0];
      if (!latest) return;
      const p = parseVersionArray(latest.version.toArray());
      if (p.release) return p.release;
      return prefix === '~' ? p.tilde : p.caret;
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
