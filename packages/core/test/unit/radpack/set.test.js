import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Core, createClass } = t.context;
  t.context.cache = {};
  t.context.instance = new (createClass(Core, {
    _getExport: (id) => ({ id }),
    _getCache: () => t.context.cache
  }))();
  t.context.sut = (...args) => t.context.instance.set(...args);
});

test('sets cache result', t => {
  const { id, sut, cache } = t.context;
  const result = { id };
  t.is(typeof cache.result, 'undefined');
  sut(id, result);
  t.is(cache.result, result);
});

test('sets cache load', t => {
  const { id, sut, cache } = t.context;
  t.is(typeof cache.load, 'undefined');
  sut(id, {});
  t.not(typeof cache.load, 'undefined');
});

test('keeps existing cache load', t => {
  const { id, sut, cache } = t.context;
  const resolve = cache.load = Promise.resolve();
  sut(id, {});
  t.is(cache.load, resolve);
});
