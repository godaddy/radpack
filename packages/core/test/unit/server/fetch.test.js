import proxyquire from 'proxyquire';
import { pathToFileURL } from 'url';
import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  t.context.fileFetch = () => Promise.resolve();
  t.context.fetchSpy = t.context.stub((...args) => t.context.fetch(...args));
  t.context.fileFetchSpy = t.context.stub((...args) => t.context.fileFetch(...args));
  t.context.sut = proxyquire('../../../src/server/fetch', {
    'cross-fetch': t.context.fetchSpy,
    './fetch-file': {
      default: t.context.fileFetchSpy
    }
  }).default;
});

test('calls file fetch', async t => {
  const { id, sut, fileFetchSpy } = t.context;
  await sut(pathToFileURL(id).href);
  t.is(fileFetchSpy.calls.length, 1);
});

test('by default does not retry', async t => {
  const { id, sut, fetch, fetchSpy } = t.context;
  fetch.onUrl(id, fetch.createRes({ status: 500 }));
  const res = await sut(id);
  t.false(res.ok);
  t.is(fetchSpy.calls.length, 1);
});

test('will retry on fails', async t => {
  const { id, sut, fetch, fetchSpy } = t.context;
  fetch.onUrl(id, fetch.createRes({ status: 500 }));
  const res = await sut(id, { retries: 5, delay: 1 });
  t.false(res.ok);
  t.is(fetchSpy.calls.length, 6);
});

test('will retry on errors', async t => {
  const { id, sut, fetch, fetchSpy } = t.context;
  fetch.onUrl(id, fetch.createRes({ error: Error() }));
  await t.throwsAsync(() => sut(id, { retries: 5, delay: 1 }));
  t.is(fetchSpy.calls.length, 6);
});

test('does not retry 304', async t => {
  const { id, sut, fetch, fetchSpy } = t.context;
  fetch.onUrl(id, fetch.createRes({ status: 304 }));
  const res = await sut(id, { retries: 1, delay: 1 });
  t.false(res.ok);
  t.is(res.status, 304);
  t.is(fetchSpy.calls.length, 1);
});

test('does not retry file urls', async t => {
  const { id, sut, fileFetchSpy } = t.context;
  t.context.fileFetch = () => Promise.reject(Error());
  await t.throwsAsync(() => sut(pathToFileURL(id).href, { retries: 5, delay: 1 }));
  t.is(fileFetchSpy.calls.length, 1);
});


