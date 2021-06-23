import ava from 'ava';
import ninos from 'ninos';
import sut from '../../src';

const test = ninos(ava);

test('exports instance', t => {
  t.is(typeof sut, 'function');
  t.not(globalThis.radpack, sut);
});

test('sets global define', t => {
  t.is(typeof globalThis.define, 'function');
});
