import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (options) => core.copy(options);
});

test('returns a new instance', t => {
  const { core, sut } = t.context;
  const instance = sut();
  t.not(core, instance);
});

['cache', 'exports', 'promise'].forEach(key => {
  const prop = `_${ key }`;
  test(`inherits ${ key }`, t => {
    const { core, sut } = t.context;
    const instance = sut();
    t.is(instance[prop], core[prop]);
  });

  test(`sets ${ key }`, t => {
    const { id: value, sut } = t.context;
    const instance = sut({ [key]: value });
    t.is(instance[prop], value);
  });
});
