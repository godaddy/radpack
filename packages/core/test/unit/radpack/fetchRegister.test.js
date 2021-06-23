import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Core, createClass } = t.context;
  t.context._loadJson = () => Promise.resolve([]);
  t.context.instance = new (createClass(Core, {
    _loadJson: (url) => t.context._loadJson(url)
  }))();
  t.context.sut = (config, options) => t.context.instance._fetchRegister(config, options);
});

test('returns empty array', async t => {
  const { sut } = t.context;
  t.deepEqual(await sut([]), []);
});

test('returns array of registers', async t => {
  const { sut } = t.context;
  const result = await sut([{}, {}]);
  t.is(result.length, 2);
});

test('fetches configs with urls', async t => {
  const { sut, instance } = t.context;
  const result = await sut({ url: 'http://test/a.json' });
  t.is(result.length, 0);
  t.is(instance._loadJson.calls.length, 1);
});

test('sets baseUrl of sub configs', async t => {
  const { sut, instance } = t.context;
  t.context._loadJson = () => Promise.resolve([{}]);
  const result = await sut('http://test/a.json');
  t.is(result.length, 1);
  t.is(result[0].vars.baseUrl, 'http://test');
  t.is(instance._loadJson.calls.length, 1);
});

test('supports nested urls', async t => {
  const { sut, instance } = t.context;
  t.context._loadJson = url => {
    if (url === 'http://test/a.js') {
      return Promise.resolve([{ url: 'http://test/b.js' }]);
    }
    if (url === 'http://test/b.js') {
      return Promise.resolve([{}]);
    }
    t.fail();
  };
  const result = await sut('http://test/a.js');
  t.is(result.length, 1);
  t.is(instance._loadJson.calls.length, 2);
});
