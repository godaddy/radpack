import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { server } = t.context;
  t.context.sut = (options) => server.copy(options);
});

test('returns a new instance', t => {
  const { sut, server } = t.context;
  const instance = sut();
  t.not(server, instance);
});

test('inherits registers', t => {
  const { sut, server } = t.context;
  const instance = sut();
  t.is(instance._registers, server._registers);
});

test('sets registers', t => {
  const { sut } = t.context;
  const registers = [{}];
  const instance = sut({ registers });
  t.is(instance._registers, registers);
});
