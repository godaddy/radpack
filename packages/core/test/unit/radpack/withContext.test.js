import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (context) => core.withContext(context);
});

test('returns a new instance', t => {
  const { core, sut } = t.context;
  const instance = sut();
  t.not(core, instance);
});

test('sets context', t => {
  const { sut } = t.context;
  const context = { test: true };
  const instance = sut(context);
  t.deepEqual(instance._context, context);
});
