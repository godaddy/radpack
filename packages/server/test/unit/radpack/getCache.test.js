import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { server } = t.context;
  t.context.exp = t.context.create.exp();
  t.context.sut = (exp = t.context.exp, create) => server._getCache(exp, create);
});

test('sets time on new caches', t => {
  const { id, sut } = t.context;
  const cache = sut(id);
  t.is(typeof cache.time, 'number');
});

test('updates time on existing caches', async t => {
  const { id, sut } = t.context;
  const last = sut(id).time;
  await new Promise(resolve => setTimeout(resolve, 1));
  t.true(sut(id).time > last);
});

test('returns undefined', t => {
  const { id, sut } = t.context;
  t.is(typeof sut(id, false), 'undefined');
});
