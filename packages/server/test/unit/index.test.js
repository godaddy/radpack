import sut from '../../src';
import setup from '../../../../configs/test/unit';

const test = setup();

test('exports instance', t => {
  t.is(typeof sut, 'function');
  t.is(globalThis.radpack, void 0);
});
