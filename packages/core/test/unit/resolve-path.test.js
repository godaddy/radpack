import test from 'ava';
import sut from '../../src/resolve-path';

test('returns original value', t => {
  t.is(sut('url'), 'url');
});

test('returns original value of variables that are not found', t => {
  t.is(sut('url${VAR}'), 'url${VAR}');
});

test('returns with variable replaced', t => {
  t.is(sut('url${VAR}', { VAR: 1 }), 'url1');
});

test('returns with variable replaced multiple times', t => {
  t.is(sut('url${VAR}_${VAR}', { VAR: 2 }), 'url2_2');
});

test('returns with multiple variables replaced', t => {
  t.is(sut('url${a}_${b}', { a: 3, b: 4 }), 'url3_4');
});

test('supports spaces in template', t => {
  t.is(sut('url${     VAR}', { VAR: '!' }), 'url!');
});

test('supports alpha-numeric and underscores in variables', t => {
  t.is(sut('url${VAR_123}', { VAR_123: 123 }), 'url123');
});
