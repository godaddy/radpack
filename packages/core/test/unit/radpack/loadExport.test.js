import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { id: url, Core, createClass } = t.context;
  t.context.exp = { url, data: { statics: [] } };
  t.context.instance = new (createClass(Core, {
    _load: () => {},
    _fetchExport: () => {},
    _getDeps: () => new Set(),
    _getCache: (exp) => ({ key: exp.url, ...exp }),
    _setCache: (cache, handler) => handler()
  }))();
  t.context.sut = (exp = t.context.exp) => t.context.instance._loadExport(exp);
});

test('fetches export', async t => {
  const { sut, exp, instance } = t.context;
  await sut(exp);
  t.is(instance._load.calls.length, 0);
  t.is(instance._fetchExport.calls.length, 1);
  t.is(instance._fetchExport.calls[0].arguments[0].url, exp.url);
});

test('fetches statics', async t => {
  const { sut, exp, instance } = t.context;
  const statics = exp.data.statics = ['a', 'b'];
  await sut(exp);
  t.is(instance._load.calls.length, 1);
  t.is(instance._load.calls[0].arguments[0], statics);
  t.is(instance._fetchExport.calls.length, 1);
});

test('fetches all deps of exports with no url', async t => {
  const { sut, instance } = t.context;
  await sut({ url: false });
  t.is(instance._getDeps.calls.length, 1);
  t.is(instance._fetchExport.calls.length, 0);
});
