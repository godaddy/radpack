import { isArray } from '@radpack/core';
import SemVer from 'semver/classes/semver';
import diff from 'semver/functions/diff';
import satisfies from 'semver/functions/satisfies';
import createVersionArray from './create-version-array';

export default class extends SemVer {
  constructor(version, options = { loose: true, includePrerelease: true }) {
    let array;
    if (isArray(version)) {
      const [major = 0, minor = 0, patch = 0, release = ''] = (array = version);
      version = `${ major }.${ minor }.${ patch }${ release }`;
    }
    super(version, options);
    if (array) {
      this.array = array;
    }
  }

  satisfies(range) {
    return satisfies(this, range);
  }

  diff(version) {
    return diff(this, version);
  }

  format() {
    super.format(...arguments);
    delete this.array;
  }

  toArray() {
    if (!this.array) {
      const { major, minor, patch, prerelease } = this;
      this.array = createVersionArray({
        major,
        minor,
        patch,
        release: prerelease.length && `-${ prerelease.join('.') }`
      });
    }
    return this.array;
  }
}
