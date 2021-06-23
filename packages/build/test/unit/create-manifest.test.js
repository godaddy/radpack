import { createEntry, createExport } from '@radpack/core';
import { Semver } from '../../src';
import sut from '../../src/create-manifest';
import setup from '../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  t.context.options = {
    name: 'repo',
    vars: {},
    version: new Semver('1.2.3')
  };
  t.context.createEntry = (entry = t.context.entry || {}) => {
    return createEntry(entry, t.context.options);
  };
  t.context.createExport = (name = 'a', entries = [t.context.createEntry()]) => {
    return createExport(name, entries, t.context.options);
  };
  t.context.createManifest = (exps = [t.context.createExport()]) => {
    return sut(exps, t.context.options);
  };
});

test('returns empty manifest with empty exports', t => {
  t.deepEqual(t.context.createManifest([]), { exports: {} });
});

test('exports unique vars', t => {
  const baseUrl = t.context.options.vars.baseUrl = 'http://test.com';
  t.deepEqual(t.context.createManifest([]), { vars: { baseUrl }, exports: {} });
});

test('exports statics', t => {
  const dep = 'lodash';
  t.context.entry = t.context.createEntry({ statics: [dep] });
  t.deepEqual(t.context.createManifest(), {
    exports: {
      repo: {
        d: [
          ['a', [{ v: [0], s: [1] }]],
          dep
        ],
        v: [[1, 2, 3]]
      }
    }
  });
});

test('exports relative statics', t => {
  const a = t.context.createExport('a', [t.context.createEntry({ statics: ['~/b'] })]);
  const b = t.context.createExport('b', [t.context.createEntry()]);
  t.deepEqual(t.context.createManifest([a, b]), {
    exports: {
      repo: {
        d: [
          ['a', [{ v: [0], s: [1] }]],
          ['b', [{ v: [0] }]]
        ],
        v: [[1, 2, 3]]
      }
    }
  });
});

test('exports dynamics', t => {
  const dep = 'lodash';
  t.context.entry = t.context.createEntry({ dynamics: [dep] });
  t.deepEqual(t.context.createManifest(), {
    exports: {
      repo: {
        d: [
          ['a', [{ v: [0], d: [1] }]],
          dep
        ],
        v: [[1, 2, 3]]
      }
    }
  });
});

test('exports relative dynamics', t => {
  const a = t.context.createExport('a', [t.context.createEntry({ dynamics: ['~/b'] })]);
  const b = t.context.createExport('b', [t.context.createEntry()]);
  t.deepEqual(t.context.createManifest([a, b]), {
    exports: {
      repo: {
        d: [
          ['a', [{ v: [0], d: [1] }]],
          ['b', [{ v: [0] }]]
        ],
        v: [[1, 2, 3]]
      }
    }
  });
});

test('throws if relative entry is not defined', t => {
  t.context.entry = t.context.createEntry({ statics: ['~/404'] });
  t.throws(() => t.context.createManifest(), { message: /missing/ });
});

test('exports file', t => {
  const file = 'test.js';
  t.context.entry = t.context.createEntry({ file });
  t.deepEqual(t.context.createManifest(), {
    exports: {
      repo: {
        d: [
          ['a', [{ v: [0], f: file }]]
        ],
        v: [[1, 2, 3]]
      }
    }
  });
});

test('exports url', t => {
  const url = 'http://full.com/url.js';
  t.context.entry = t.context.createEntry({ url });
  t.deepEqual(t.context.createManifest(), {
    exports: {
      repo: {
        d: [
          ['a', [{ v: [0], u: url }]]
        ],
        v: [[1, 2, 3]]
      }
    }
  });
});

test('exports versions of unique entries', t => {
  const entryV1 = t.context.createEntry({ version: new Semver('1.0.0'), file: '1.js' });
  const entryV2 = t.context.createEntry({ version: new Semver('2.0.0'), file: '2.js' });
  t.deepEqual(t.context.createManifest([t.context.createExport('a', [entryV2, entryV1])]), {
    exports: {
      repo: {
        d: [
          ['a', [{ v: [1], f: '2.js' }, { v: [0], f: '1.js' }]]
        ],
        v: [[1], [2]]
      }
    }
  });
});

test('combines versions of same entries', t => {
  const entryV1 = t.context.createEntry({ version: new Semver('1.0.0'), file: 'same.js' });
  const entryV2 = t.context.createEntry({ version: new Semver('2.0.0'), file: 'same.js' });
  t.deepEqual(t.context.createManifest([t.context.createExport('a', [entryV2, entryV1])]), {
    exports: {
      repo: {
        d: [
          ['a', [{ v: [1, 0], f: 'same.js' }]]
        ],
        v: [[1], [2]]
      }
    }
  });
});
