import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = () => core._loaded();
});

test('resolves all load promises', async t => {
  const { sut, core } = t.context;
  core._cache.set('pass', { load: Promise.resolve() });
  core._cache.set('fail', { load: Promise.reject(Error()) });
  core._cache.set('unresolved', { fetch: new Promise((resolve) => setTimeout(resolve, 10)) });
  await sut();
  t.pass();
});
