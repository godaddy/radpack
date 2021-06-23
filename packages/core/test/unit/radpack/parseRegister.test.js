import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.default = { url: false, vars: {}, exports: {} };
  t.context.sut = (config) => core._parseRegister(config);
});

test('returns object', t => {
  const { sut } = t.context;
  t.deepEqual(sut(), t.context.default);
});

test('converts string to url register', t => {
  const { id: url, sut } = t.context;
  t.deepEqual(sut(url), {
    ...t.context.default,
    url
  });
});
