import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { core } = t.context;
  t.context.sut = (options) => core._parseUrl(options);
});

test('returns false', t => {
  const { sut } = t.context;
  t.false(sut());
});

test('returns url', t => {
  const { id: url, sut } = t.context;
  t.is(sut(url), url);
});
