import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Core, createClass } = t.context;
  t.context.cache = {};
  t.context._getCache = () => t.context.cache;
  t.context.instance = new (createClass(Core, {
    _getExport: (id) => ({ id }),
    _getCache: (key) => t.context._getCache(key)
  }))();
  t.context.sut = (id) => t.context.instance.static(id);
});

test('returns cache result', t => {
  const { id, cache, sut } = t.context;
  const result = cache.result = { id };
  const value = sut();
  t.is(value, result);
});

test('returns undefined if no cache', t => {
  const { sut } = t.context;
  t.context._getCache = () => void 0;
  t.is(typeof sut(), 'undefined');
});

test('handles arrays', t => {
  const { sut } = t.context;
  t.context._getCache = ({ id }) => ({ result: { id } });
  t.deepEqual(sut([1, 2, 3]), [{ id: 1 }, { id: 2 }, { id: 3 }]);
});
