import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Client, createClass } = t.context;
  t.context._fetchRegister = () => {
    throw Error('register pass');
  };
  t.context.instance = new (createClass(Client, {
    _fetchRegister: () => ([])
  }))();
  t.context.sut = (...args) => t.context.instance.register(...args);
});

test('sets base', async t => {
  const { id: href, sut, document, instance } = t.context;
  document.location.href = href;
  await sut({});
  t.is(instance._fetchRegister.calls.length, 1);
  t.is(instance._fetchRegister.calls[0].arguments[1].base, href);
});
