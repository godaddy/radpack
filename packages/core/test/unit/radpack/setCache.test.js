import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (cache, handler, prop) => core._setCache(cache, handler, prop);
});

test('returns existing prop', t => {
  const { id, sut, core } = t.context;
  const cache = core._getCache(id);
  const load = cache.load = Promise.resolve();
  t.is(sut(cache, () => t.fail(), 'load'), load);
});

test('handler sees existing prop', t => {
  const { id, sut, core } = t.context;
  const cache = core._getCache(id);
  return sut(cache, () => {
    t.true(cache.load instanceof Promise);
  });
});

test('properly handles errors', async t => {
  const { id, sut, core } = t.context;
  const cache = core._getCache(id);
  await t.throwsAsync(() => sut(cache, () => {
    throw Error('fail');
  }));
  t.is(typeof cache.load, 'undefined');
});
