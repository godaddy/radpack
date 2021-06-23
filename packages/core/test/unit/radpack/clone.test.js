import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (options) => core.clone(options);
});

test('returns a new instance', async t => {
  const { core, sut } = t.context;
  const instance = await sut();
  t.not(core, instance);
});

['cache', 'exports'].forEach(key => {
  const prop = `_${ key }`;
  test(`inherits ${ key } copy`, async t => {
    const { core, sut } = t.context;
    core[prop].set('test', true);
    const instance = await sut();
    t.not(instance[prop], core[prop]);
    t.deepEqual(instance[prop], core[prop]);
  });

  test(`sets ${ key }`, async t => {
    const { sut } = t.context;
    const value = new Map();
    const instance = await sut({ [key]: value });
    t.is(instance[prop], value);
  });
});
