import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (options) => core._parsePath(options);
});

test('returns path', t => {
  const { sut } = t.context;
  t.is(sut('test'), 'test');
});

test('ignores unknown context', t => {
  const { sut } = t.context;
  const path = '/test/${ locale }.js';
  t.is(sut(path), path);
});

test('returns path with context', t => {
  const { sut, core } = t.context;
  const path = '/test/${ locale }.js';
  core._context = { locale: 'en-US' };
  t.is(sut(path), '/test/en-US.js');
});
