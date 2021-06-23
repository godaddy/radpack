import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Core, createClass } = t.context;
  t.context.instance = new (createClass(Core, {
    _loaded: () => {},
    _setRegisters: () => {},
    _loadJson: (...args) => t.context._loadJson(...args),
    _fetchRegister() {
      return Core.prototype._fetchRegister.apply(this, arguments);
    }
  }))();
  t.context.sut = (...args) => t.context.instance.register(...args);
});

test('returns promise', t => {
  const { sut } = t.context;
  t.true(sut() instanceof Promise);
});

test('always resolves', async t => {
  const { sut, instance } = t.context;
  instance._promise = Promise.reject(Error());
  t.true(await sut().then(() => true, () => false));
});

test('fetches config', async t => {
  const { sut, instance } = t.context;
  const config = { foo: 'bar' };
  await sut(config);
  t.is(instance._fetchRegister.calls.length, 1);
  t.is(instance._fetchRegister.calls[0].arguments[0], config);
});

test('sets registers', async t => {
  const { sut, instance } = t.context;
  const config = {};
  await sut(config);
  t.is(instance._setRegisters.calls.length, 1);
});

test('applies proper order', async t => {
  const { sut, instance } = t.context;
  const delayWith = (res, delay) => new Promise(resolve => {
    setTimeout(() => resolve(res), delay);
  });
  const a = 'url-a';
  const b = 'url-b';
  t.context._loadJson = async (url) => {
    if (url === a) {
      return delayWith({ id: a }, 2);
    }
    if (url === b) {
      return delayWith({ id: b }, 1);
    }
    t.fail();
  };
  await sut([
    delayWith({ url: a }, 2),
    delayWith({ url: b }, 1)
  ]);
  t.is(instance._setRegisters.calls.length, 1);
  const registers = instance._setRegisters.calls[0].arguments[0];
  t.is(registers[0].id, a);
  t.is(registers[1].id, b);
});
