import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { id, Server, createClass } = t.context;
  const url = 'http://test/' + id;
  t.context.urls = [url];
  t.context.options = { tts: 1, urls: new Set(t.context.urls), done: () => {} };
  t.context.cache = { url, jsonString: JSON.stringify({}) };
  t.context._loadJson = () => {};
  t.context.instance = new (createClass(Server, {
    _getCache: () => t.context.cache,
    _loadJson: (url, opts) => t.context._loadJson(url, opts),
    _setRegister: () => {},
    _fetchRegister: () => {}
  }))();
  let count = 0;
  t.context.sut = (index = 0, urls = t.context.urls, options = t.context.options) => {
    if (count++) {
      return; // only run once for testing
    }
    return t.context.instance._watch(index, urls, options);
  };
});

test('fetches url', async t => {
  const { sut, instance, wait } = t.context;
  t.is(instance._loadJson.calls.length, 0);
  sut();
  await wait(1);
  t.is(instance._loadJson.calls.length, 1);
  t.is(instance._fetchRegister.calls.length, 0);
});

test('fetches register on change', async t => {
  const { sut, cache, instance, wait } = t.context;
  t.is(instance._loadJson.calls.length, 0);
  t.is(instance._setRegister.calls.length, 0);
  t.is(instance._fetchRegister.calls.length, 0);
  t.context._loadJson = () => {
    cache.jsonString = JSON.stringify({ new: true });
  };
  sut();
  await wait(1);
  t.is(instance._loadJson.calls.length, 1);
  t.is(instance._setRegister.calls.length, 1);
  t.is(instance._fetchRegister.calls.length, 1);
});

test('calls done on change', async t => {
  const { sut, instance, cache, options, stub, wait } = t.context;
  const done = options.done = stub();
  t.is(done.calls.length, 0);
  t.context._loadJson = (url, opts) => {
    opts.urls.add(url);
    cache.jsonString = JSON.stringify({ new: true });
  };
  sut();
  await wait(1);
  t.is(done.calls.length, 1);
  t.deepEqual(done.calls[0].arguments[0], { urls: [...options.urls] });
  t.is(done.calls[0].arguments[1], instance);
});

test('does not call done if no changes', async t => {
  const { sut, options, stub, wait } = t.context;
  const done = options.done = stub();
  sut();
  await wait(1);
  t.is(done.calls.length, 0);
});
