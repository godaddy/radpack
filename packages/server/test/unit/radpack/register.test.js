import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Server, createClass } = t.context;
  t.context.instance = new (createClass(Server, {
    _setRegisters: () => {},
    _fetchRegister: () => {}
  }))();
  t.context.sut = (config, options) => t.context.instance.register(config, options);
});

test('returns promise', t => {
  const { sut } = t.context;
  t.true(sut() instanceof Promise);
});

test('creates options', async t => {
  const { sut, instance } = t.context;
  const config = {};
  await sut(config);
  t.is(instance._fetchRegister.calls.length, 1);
  t.is(instance._fetchRegister.calls[0].arguments.length, 2);
});

test('creates urls set', async t => {
  const { sut, instance } = t.context;
  const config = {};
  await sut(config);
  t.deepEqual(instance._fetchRegister.calls[0].arguments[1].urls, new Set());
});
