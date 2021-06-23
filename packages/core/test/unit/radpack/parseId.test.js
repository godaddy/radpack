import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (options) => core._parseId(options);
});

test('returns id', t => {
  const { sut } = t.context;
  t.is(sut('test'), 'test');
});

test('returns id if no scope', t => {
  const { sut } = t.context;
  t.is(sut('~/test'), '~/test');
});

test('returns relative to scope id', t => {
  const { sut, core } = t.context;
  core._scope = 'scope';
  t.is(sut('~/test'), 'scope/test');
});
