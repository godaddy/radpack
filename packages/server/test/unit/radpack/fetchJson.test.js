import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { id, Server, createClass } = t.context;
  t.context.url = `http://test/${ id }.js`;
  t.context.cache = { url: t.context.url };
  t.context.instance = new (createClass(Server, {
    _setCache: (key, handler) => handler(),
    _getCache: () => t.context.cache
  }))();
  t.context.options = { urls: new Set() };
  t.context.sut = (cache = t.context.cache, options = t.context.options) => t.context.instance._fetchJson(cache, options);
});

test('adds If-Modified-Since header', t => {
  const { sut, cache, fetch } = t.context;
  const last = cache.last = Date.now();
  return new Promise((resolve, reject) => {
    fetch.onUrl(cache.url, (_, { headers }) => {
      try {
        t.is(headers['If-Modified-Since'], last);
        resolve();
      } catch (e) {
        reject(e);
      }
      return fetch.createRes();
    });
    sut();
  });
});

test('adds If-None-Match header', t => {
  const { sut, cache, fetch } = t.context;
  const etag = cache.etag = 'etag';
  return new Promise((resolve, reject) => {
    fetch.onUrl(cache.url, (_, { headers }) => {
      try {
        t.is(headers['If-None-Match'], etag);
        resolve();
      } catch (e) {
        reject(e);
      }
      return fetch.createRes();
    });
    sut();
  });
});

test('returns cached', async t => {
  const { sut, cache, fetch } = t.context;
  fetch.onUrl(cache.url, fetch.createRes({ status: 304 }));
  const json = cache.json = {};
  t.is(await sut(), json);
});

test('sets cache last', async t => {
  const { sut, cache, fetch } = t.context;
  const json = {};
  const last = Date.now();
  fetch.onUrl(cache.url, fetch.createRes({
    json,
    headers: new Map(Object.entries({
      'Last-Modified': last
    }))
  }));
  t.is(await sut(), json);
  t.is(cache.last, last);
});

test('sets cache etag', async t => {
  const { sut, cache, fetch } = t.context;
  const json = {};
  const etag = 'etag';
  fetch.onUrl(cache.url, fetch.createRes({
    json,
    headers: new Map(Object.entries({
      ETag: etag
    }))
  }));
  t.is(await sut(), json);
  t.is(cache.etag, etag);
});

test('sets cache jsonString', async t => {
  const { sut, cache, fetch } = t.context;
  const json = { a: true };
  fetch.onUrl(cache.url, fetch.createRes({ json }));
  t.is(await sut(), json);
  t.is(cache.jsonString, JSON.stringify(json));
});
