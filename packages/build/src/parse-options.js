import { createHash } from 'crypto';
import { constants, toArray } from '@radpack/core';
import SemVer from './semver';
import getPackage from './get-package';

export default options => {
  const parsed = {
    tmp: new Map(),
    cwd: process.cwd(),
    filename: 'radpack.json',
    override: 'radpack',
    hash(content) {
      const hash = createHash('sha256');
      hash.update(content);
      return hash.digest('hex').substr(0, 8);
    },
    ...options
  };
  const { cwd, version, register, partials } = parsed;
  const pkg = getPackage(cwd);
  parsed.vars = { ...constants.vars, ...parsed.vars };
  parsed.name = parsed.name || pkg.name;
  parsed.version = new SemVer(version || pkg.version);
  parsed.register = toArray(register).flat().map(config => {
    if (typeof config === 'string') {
      config = { url: config };
    }
    if (!('register' in config)) {
      config.register = true;
    }
    return config;
  });
  parsed.partials = toArray(partials);
  parsed.dependencies = {
    ...pkg.devDependencies,
    ...pkg.dependencies,
    ...pkg.peerDependencies
  };
  return parsed;
};
