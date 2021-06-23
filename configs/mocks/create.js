import { createManifest, Semver } from '../../packages/build';
import { createEntry, createExport, mergeRegisters } from '../../packages/core';

export const manifest = createManifest;
export const exports = createExport;
export const entry = createEntry;
export const semver = v => new Semver(v);

export function mockEntry({ version = [1], ...opts } = {}) {
  const entry = opts.entry = opts.entry || 'index';
  if (!('file' in opts)) {
    opts.file = `${ entry }.js`;
  }
  return createEntry(opts, { version: semver(version) });
}

export function mockExport({ entries = [{}], ...opts } = {}) {
  const entry = opts.entry = opts.entry || 'index';
  return createExport(entry, entries.map(ent => mockEntry({ ...opts, ...ent })), opts);
}

export function mockManifest({ exports = [{ entry: 'index' }], ...opts } = {}) {
  opts.name = opts.name || 'a';
  opts.vars = opts.vars || { baseUrl: opts.name };
  return createManifest(exports.map((exp, index) =>
    mockExport({ entry: `entry${ index }`, ...opts, ...exp })
  ), opts);
}

export function mockManifests(manifests = [{ name: 'a' }]) {
  return mergeRegisters(...manifests.map((manifest, index) =>
    mockManifest({ name: `manifest${ index }`, ...manifest })
  ));
}
