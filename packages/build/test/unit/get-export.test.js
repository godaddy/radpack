import { createEntry, createExport } from '@radpack/core';
import { Semver } from '../../src';
import sut from '../../src/get-export';
import setup from '../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  t.context.options = {
    name: 'repo',
    version: new Semver('1.0.0'),
    dependencies: {
      lodash: '4.0.0'
    }
  };
  t.context.lodashOptions = {
    name: 'lodash',
    version: new Semver('4.0.0')
  };
  t.context.exports = {
    lodash: createExport('index', [
      createEntry({}, t.context.lodashOptions)
    ], t.context.lodashOptions)
  };
  t.context.getExport = (source, exports = t.context.exports) => {
    return sut(exports, source, t.context.options);
  };
});

test('throws if source is radpack', t => {
  t.throws(() => t.context.getExport('@radpack/client'), { message: /prohibited/ });
  t.throws(() => t.context.getExport('@radpack/server'), { message: /prohibited/ });
});

test('returns undefined for file paths', t => {
  t.is(t.context.getExport(__dirname));
  t.is(t.context.getExport('/test'));
  t.is(t.context.getExport('./test'));
  t.is(t.context.getExport('../test'));
});

test('returns named paths for relative paths', t => {
  t.is(t.context.getExport('repo'), 'repo');
  t.is(t.context.getExport('repo/test'), 'repo/test');
  t.is(t.context.getExport('~/'), 'repo');
  t.is(t.context.getExport('~/test'), 'repo/test');
});

test('returns undefined for unknown dependencies', t => {
  t.is(t.context.getExport('test'));
  t.is(t.context.getExport('test@1'));
});

test('returns versioned dependency', t => {
  t.is(t.context.getExport('lodash'), 'lodash@^4');
});

test('returns non-versioned dependency', t => {
  t.context.options.dependencies.lodash = '*';
  t.is(t.context.getExport('lodash'), 'lodash');
});

test('returns already versioned dependency', t => {
  t.is(t.context.getExport('lodash@5'), 'lodash@5');
});
