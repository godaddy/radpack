import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Core, createClass } = t.context;
  t.context.cache = {};
  t.context._load = () => Promise.resolve();
  t.context.instance = new (createClass(Core, {
    _getExport: (id) => ({ id }),
    _getCache: () => t.context.cache,
    _load: (id) => t.context._load(id)
  }))();
  t.context.sut = (...args) => t.context.instance.define(...args);
});

test('sets id', t => {
  const { id, sut, instance } = t.context;
  const result = 'test_result';
  t.context.spy(t.context.instance, 'set');
  return new Promise((resolve, reject) => sut(id, ['exports'], (exports) => {
    exports.default = result;
    resolve();
  }, reject)).then(() => {
    t.is(instance.set.calls.length, 1);
    t.deepEqual(instance.set.calls[0].arguments, [id, { default: result }]);
  });
});

test('resolves cache', t => {
  const { id, sut, cache } = t.context;
  cache.resolve = t.context.stub();
  return new Promise((resolve, reject) => sut(id, [], resolve, reject)).then(() => {
    t.is(cache.resolve.calls.length, 1);
  });
});

test('properly handles errors', t => {
  const { id, sut } = t.context;
  const reason = 'failed to load';
  t.context._load = () => Promise.reject(Error(reason));
  return new Promise((resolve, reject) => sut(id, ['test'], reject, err => {
    t.true(err.message.includes(reason));
    resolve();
  }));
});

test('rejects cache', t => {
  const { id, sut, cache } = t.context;
  cache.reject = t.context.stub();
  t.context._load = () => Promise.reject(Error('failed to load'));
  return new Promise((resolve, reject) => sut(id, [], reject, resolve)).then(() => {
    t.is(cache.reject.calls.length, 1);
  });
});
