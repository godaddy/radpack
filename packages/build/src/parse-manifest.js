import { parseManifest } from '@radpack/core';
import SemVer from './semver';

export default manifest => parseManifest(
  manifest,
  entry => `~/${ entry }`,
  version => new SemVer(version)
);
