import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { server } = t.context;
  t.context.sut = () => server.dehydrate();
});

test('returns scope', async t => {
  const { sut, server } = t.context;
  const scope = server._scope = 'test_scope';
  const state = await sut();
  t.is(state[0], scope);
});

test('returns context', async t => {
  const { sut, server } = t.context;
  const context = server._context = { test: 'context' };
  const state = await sut();
  t.deepEqual(state[1], context);
});

test('returns registers', async t => {
  const { sut, server, create } = t.context;
  const register = { exports: { a: {} } };
  server._registers = [{ registers: [create.register(register)], exports: {} }];
  const state = await sut();
  t.deepEqual(state[2], [register]);
});

test('filters empty registers', async t => {
  const { sut, server, create } = t.context;
  server._registers = [{ registers: [create.register()], exports: {} }];
  const state = await sut();
  t.deepEqual(state[2], []);
});

test('filters non-register registers', async t => {
  const { sut, server, create } = t.context;
  server._registers = [{ registers: [create.register({ exports: { a: {} }, register: false })], exports: {} }];
  const state = await sut();
  t.deepEqual(state[2], []);
});

test('returns registers vars', async t => {
  const { sut, server, create } = t.context;
  const register = { exports: { a: {} }, vars: { a: true } };
  server._registers = [{ registers: [create.register(register)], exports: {} }];
  const state = await sut();
  t.deepEqual(state[2], [register]);
});
