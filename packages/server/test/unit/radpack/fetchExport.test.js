import { pathToFileURL } from 'url';
import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { id: url, Server, createClass } = t.context;
  t.context.exp = { id: url };
  t.context.cache = { url };
  t.context.define = () => { t.context.cache.resolve(); };
  t.context.instance = new (createClass(Server, {
    _setCache: (key, handler) => handler(),
    define: (...args) => t.context.define(...args)
  }))();
  t.context.sut = (exp = t.context.exp, cache = t.context.cache) => t.context.instance._fetchExport(exp, cache);
});

test('throws on fetch error', t => {
  const { sut, cache, fetch } = t.context;
  fetch.onUrl(cache.url, fetch.createRes({ status: 500 }));
  return t.throwsAsync(() => sut());
});

test('throws on unknown format', t => {
  const { sut } = t.context;
  return t.throwsAsync(() => sut(), { message: /Unknown format/ });
});

test('eval define', async t => {
  const { sut, cache, fetch, instance } = t.context;
  const text = `define('a', [], () => {}, e => { throw e; });`;
  fetch.onUrl(cache.url, fetch.createRes({ text }));
  await sut();
  t.is(instance.define.calls.length, 1);
});

test('eval file', async t => {
  const { sut, cache, fetch } = t.context;
  cache.url = pathToFileURL(cache.url).href;
  const text = `RADPACK_RESULT.default = 'test'`;
  fetch.onUrl(cache.url, fetch.createRes({ text }));
  await sut();
  t.is(cache.result, 'test');
});

test('provides radpack require', async t => {
  const { sut, cache, fetch } = t.context;
  cache.url = pathToFileURL(cache.url).href;
  const text = `RADPACK_RESULT.default = require.isRadpack === true`;
  fetch.onUrl(cache.url, fetch.createRes({ text }));
  await sut();
  t.true(cache.result);
});

test('eval is named with exp.id', async t => {
  const { id, sut, exp, cache, fetch } = t.context;
  exp.id = `@test/${id}`;
  cache.url = pathToFileURL(cache.url).href;
  const text = `throw Error('test error');`;
  fetch.onUrl(cache.url, fetch.createRes({ text }));
  const { message, stack } = await t.throwsAsync(sut);
  t.is(message, 'test error');
  t.true(stack.includes(`eval (${ exp.id }`), stack);
});
