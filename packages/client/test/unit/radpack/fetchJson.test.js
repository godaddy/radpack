import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { client } = t.context;
  t.context.sut = (cache) => client._fetchJson(cache);
});

test('throws an error if not ok', async t => {
  const { id: url, sut, fetch, client } = t.context;
  const cache = client._getCache(url);
  fetch.onUrl(url, fetch.createRes({ status: 500 }));
  await t.throwsAsync(() => sut(cache));
});

test('returns json', async t => {
  const { id: url, sut, fetch, client } = t.context;
  const cache = client._getCache(url);
  const json = { test: true };
  fetch.onUrl(url, fetch.createRes({ status: 200, json }));
  t.deepEqual(await sut(cache), json);
});
