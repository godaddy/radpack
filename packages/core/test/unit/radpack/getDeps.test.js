import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.exp = t.context.create.exp();
  t.context.sut = (exp = t.context.exp, exps) => core._getDeps(exp, exps);
});

test('returns empty set', t => {
  const { sut } = t.context;
  t.deepEqual(sut(), new Set());
});

test('adds dependencies to set', t => {
  const { sut, core, create } = t.context;
  const exp = create.exp({ data: { statics: ['a'] } });
  const a = create.exp();
  core._exports.set('a', a);
  t.deepEqual(sut(exp), new Set([a]));
});
