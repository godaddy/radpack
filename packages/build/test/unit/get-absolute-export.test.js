import sut from '../../src/get-absolute-export';
import setup from '../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  t.context.options = { name: 'repo' };
  t.context.getAbsExp = source => sut(source, t.context.options);
});

test('handles relative root', t => {
  t.is(t.context.getAbsExp('repo'), 'repo');
  t.is(t.context.getAbsExp('~/index'), 'repo');
  t.is(t.context.getAbsExp('~/'), 'repo');
});

test('handles relative entry', t => {
  t.is(t.context.getAbsExp('repo/test'), 'repo/test');
  t.is(t.context.getAbsExp('~/test'), 'repo/test');
});

test('returns undefined if not relative', t => {
  t.is(t.context.getAbsExp('lodash'));
  t.is(t.context.getAbsExp('lodash/entry'));
  t.is(t.context.getAbsExp('./entry.js'));
});
