import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.exp = t.context.create.exp();
  t.context.sut = (exp = t.context.exp) => core._getUrls(exp);
});

test('returns array', t => {
  const { sut } = t.context;
  t.deepEqual(sut(), []);
});

test('adds exp url', t => {
  const { exp, sut } = t.context;
  exp.url = 'test';
  t.deepEqual(sut(exp), ['test']);
});

test('adds dependency urls', t => {
  const { sut, core, create } = t.context;
  const exp = create.exp({ data: { statics: ['a', 'b'] } });
  core._exports.set('a', create.exp({ url: 'url-a' }));
  core._exports.set('b', create.exp({ url: 'url-b' }));
  t.deepEqual(sut(exp), ['url-a', 'url-b']);
});

test('adds deep dependency urls', t => {
  const { sut, core, create } = t.context;
  const exp = create.exp({ data: { statics: ['a'] } });
  core._exports.set('a', create.exp({ url: 'url-a', data: { statics: ['b'] } }));
  core._exports.set('b', create.exp({ url: 'url-b' }));
  t.deepEqual(sut(exp), ['url-a', 'url-b']);
});
