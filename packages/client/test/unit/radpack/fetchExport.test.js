import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { client } = t.context;
  t.context.exp = {};
  t.context.cache = { url: 'http://test/file.js' };
  t.context.sut = (exp = t.context.exp, cache = t.context.cache) => client._fetchExport(exp, cache);
});

test('sets cache resolve/reject', t => {
  const { sut, cache } = t.context;
  t.is(typeof cache.resolve, 'undefined');
  t.is(typeof cache.reject, 'undefined');
  sut();
  t.is(typeof cache.resolve, 'function');
  t.is(typeof cache.reject, 'function');
});

test.serial('appends script to body', t => {
  const { sut, client, document: { head: { appendChild } } } = t.context;
  sut();
  t.is(appendChild.calls.length, 1);
  t.is(appendChild.calls[0].arguments[0].instance, client);
});
