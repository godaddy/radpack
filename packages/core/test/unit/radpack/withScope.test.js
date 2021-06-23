import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (scope) => core.withScope(scope);
});

test('returns a new instance', t => {
  const { core, sut } = t.context;
  const instance = sut();
  t.not(core, instance);
});

test('sets scope', t => {
  const { sut } = t.context;
  const scope = 'test';
  const instance = sut(scope);
  t.is(instance._scope, scope);
});
