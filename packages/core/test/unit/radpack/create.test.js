import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (options) => core.create(options);
});

test('returns a new instance', t => {
  const { core, sut } = t.context;
  const instance = sut();
  t.not(core, instance);
});

test('inherits scope', t => {
  const { core, sut } = t.context;
  const scope = core._scope = 'scope';
  t.is(sut()._scope, scope);
});

test('sets scope', t => {
  const { sut } = t.context;
  t.is(sut({ scope: 'new' })._scope, 'new');
});

test('inherits context', t => {
  const { core, sut } = t.context;
  const context = core._context = { old: true };
  const instance = sut({ context });
  t.deepEqual(instance._context, context);
});

test('shallow merges context', t => {
  const { core, sut } = t.context;
  core._context = { id: 1, old: true, deep: { old: true } };
  const instance = sut({ context: { id: 2, new: true, deep: { new: true } } });
  t.deepEqual(instance._context, { id: 2, old: true, new: true, deep: { new: true } });
});
