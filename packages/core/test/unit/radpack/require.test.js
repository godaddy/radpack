import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Core, createClass } = t.context;
  t.context._load = () => Promise.resolve();
  t.context.Class = createClass(Core, {
    _load: (id) => t.context._load(id),
    static: (id) => ({ id })
  });
  t.context.instance = new t.context.Class();
  t.context.sut = (...args) => t.context.instance.require(...args);
});

test('returns instance', t => {
  const { sut, Class } = t.context;
  return new Promise((resolve, reject) => sut(['radpack'], (arg) => {
    t.is(typeof arg, 'function');
    t.true(arg instanceof Class);
    resolve();
  }, reject));
});

test('returns scoped instance', t => {
  const { sut } = t.context;
  const deps = ['radpack'];
  const scope = 'test';
  Object.defineProperty(deps, 'scope', { value: scope });
  return new Promise((resolve, reject) => sut(deps, (arg) => {
    t.is(arg._scope, scope);
    resolve();
  }, reject));
});

test('returns require', t => {
  const { sut } = t.context;
  return new Promise((resolve, reject) => sut(['require'], (arg) => {
    t.is(typeof arg, 'function');
    resolve();
  }, reject));
});

test('returns exports', t => {
  const { sut } = t.context;
  return new Promise((resolve, reject) => sut(['exports'], (arg) => {
    t.is(typeof arg, 'object');
    resolve();
  }, reject));
});

test('returns statics', t => {
  const { sut, instance } = t.context;
  return new Promise((resolve, reject) => sut(['test'], (arg) => {
    t.deepEqual(arg, { id: 'test' });
    t.is(instance.static.calls.length, 1);
    resolve();
  }, reject));
});

test('properly handles errors', t => {
  const { sut } = t.context;
  const reason = 'failed to load';
  t.context._load = () => Promise.reject(Error(reason));
  return new Promise((resolve, reject) => sut([], reject, err => {
    t.true(err.message.includes(reason));
    resolve();
  }));
});
