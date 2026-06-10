import proxyquire from 'proxyquire';
import setup from '../../../../configs/test/unit';

const test = setup();

const createSut = (pkg = {}) => {
  const mockPkg = {
    name: 'test-pkg',
    version: '1.0.0',
    dependencies: {},
    devDependencies: {},
    peerDependencies: {},
    ...pkg
  };
  const mock = () => mockPkg;
  mock.default = mock;
  return proxyquire('../../src/parse-options', {
    './get-package': mock
  }).default;
};

test('strips workspace: protocol from dependencies', t => {
  const sut = createSut({
    dependencies: {
      '@wsb/guac-widget-core': 'workspace:*',
      '@wsb/guac-dials': 'workspace:^1.7.1',
      '@wsb/guac-widget-shared': 'workspace:~1.7.11',
      'lodash': '^4.17.21'
    }
  });
  const result = sut({});
  t.is(result.dependencies['@wsb/guac-widget-core'], '*');
  t.is(result.dependencies['@wsb/guac-dials'], '^1.7.1');
  t.is(result.dependencies['@wsb/guac-widget-shared'], '~1.7.11');
  t.is(result.dependencies['lodash'], '^4.17.21');
});

test('handles workspace:^ shorthand', t => {
  const sut = createSut({
    devDependencies: {
      'react': 'workspace:^'
    }
  });
  const result = sut({});
  t.is(result.dependencies['react'], '^');
});

test('handles workspace:~ shorthand', t => {
  const sut = createSut({
    peerDependencies: {
      'react': 'workspace:~'
    }
  });
  const result = sut({});
  t.is(result.dependencies['react'], '~');
});

test('merges all dependency types with workspace stripping', t => {
  const sut = createSut({
    dependencies: { a: '1.0.0' },
    devDependencies: { b: 'workspace:^2.0.0' },
    peerDependencies: { c: '3.0.0' }
  });
  const result = sut({});
  t.is(result.dependencies.a, '1.0.0');
  t.is(result.dependencies.b, '^2.0.0');
  t.is(result.dependencies.c, '3.0.0');
});
