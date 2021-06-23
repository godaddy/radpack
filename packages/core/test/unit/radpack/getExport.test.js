import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (id) => core._getExport(id);
});

test('throws if id not found', t => {
  const { id, sut } = t.context;
  t.throws(() => sut(id));
});

test('returns export', t => {
  const { id, sut, core } = t.context;
  const exp = { id };
  core._exports.set(id, exp);
  t.is(sut(id), exp);
});
