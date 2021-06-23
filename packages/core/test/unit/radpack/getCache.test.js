import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.exp = t.context.create.exp();
  t.context.sut = (exp = t.context.exp, create) => core._getCache(exp, create);
});

test('creates cache by default', t => {
  const { id, sut, core, create } = t.context;
  t.false(core._cache.has(id));
  sut(create.exp({ id }));
  t.true(core._cache.has(id));
});

test('can use string key', t => {
  const { id, sut, core } = t.context;
  t.false(core._cache.has(id));
  sut(id);
  t.true(core._cache.has(id));
});

test('uses url as key', t => {
  const { id: url, sut, create, core } = t.context;
  const exp = create.exp({ url });
  t.false(core._cache.has(url));
  sut(exp);
  t.true(core._cache.has(url));
});

test('uses url with context as key', t => {
  const { id, sut, create, core } = t.context;
  core._context = { foo: 'bar' };
  const url = 'http://${ foo }/' + id;
  const key = 'http://bar/' + id;
  const exp = create.exp({ url });
  t.false(core._cache.has(key));
  sut(exp);
  t.true(core._cache.has(key));
});

test('uses urls from statics in key', t => {
  const { id, sut, create, core } = t.context;
  const exp = create.exp({ id, data: { statics: ['a', 'b'] } });
  core._exports.set('a', create.exp({ url: 'a-url' }));
  core._exports.set('b', create.exp({ url: 'b-url' }));
  const key = id + ',a-url,b-url';
  t.false(core._cache.has(key));
  sut(exp);
  t.true(core._cache.has(key));
});

test('uses urls from statics with context in key', t => {
  const { id, sut, create, core } = t.context;
  const exp = create.exp({ id, data: { statics: ['b'] } });
  core._context = { bar: 'baz' };
  core._exports.set('b', create.exp({ url: 'http://${ bar }/' }));
  const key = id + ',http://baz/';
  t.false(core._cache.has(key));
  sut(exp);
  t.true(core._cache.has(key));
});

test('uses deep urls from statics in key', t => {
  const { sut, create, core } = t.context;
  const exp = create.exp({ url: 'a-url', data: { statics: ['b'] } });
  core._exports.set('b', create.exp({ url: 'b-url', data: { statics: ['c'] } }));
  core._exports.set('c', create.exp({ url: 'c-url' }));
  const key = 'a-url,b-url,c-url';
  t.false(core._cache.has(key));
  sut(exp);
  t.true(core._cache.has(key));
});

test('returns undefined', t => {
  const { id, sut } = t.context;
  t.is(typeof sut(id, false), 'undefined');
});
