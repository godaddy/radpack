import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { server } = t.context;
  t.context.sut = (options) => server.clone(options);
});

test('returns a new instance', async t => {
  const { sut, server } = t.context;
  const instance = await sut();
  t.not(server, instance);
});

test('inherits registers copy', async t => {
  const { sut, server } = t.context;
  server._registers = [{}];
  const instance = await sut();
  t.not(instance._registers, server._registers);
  t.deepEqual(instance._registers, server._registers);
});

test('sets registers', async t => {
  const { sut } = t.context;
  const registers = [{}];
  const instance = await sut({ registers });
  t.is(instance._registers, registers);
});
