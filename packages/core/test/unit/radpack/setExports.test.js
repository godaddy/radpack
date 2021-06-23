import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (exports) => core._setExports(exports);
});

test('sets exports', t => {
  const { sut, core } = t.context;
  const exports = { a: 'a', b: 'b', c: 'c' };
  sut(exports);
  t.deepEqual(core._exports, new Map(Object.entries(exports)));
});
