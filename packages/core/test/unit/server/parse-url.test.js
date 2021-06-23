import ava from 'ava';
import path from 'path';
import ninos from 'ninos';
import { pathToFileURL } from 'url';
import sut from '../../../src/server/parse-url';

const test = ninos(ava);

test('returns original value if falsy', t => {
  t.is(sut());
  t.is(sut(''), '');
  t.is(sut(false), false);
});

test('returns original value if not a path', t => {
  t.is(sut('http://blah'), 'http://blah');
});

test('returns relative path url', t => {
  t.is(sut('./a', __dirname), pathToFileURL(path.join(__dirname, 'a')).href);
});

test('returns absolute path url', t => {
  t.is(sut(__dirname), pathToFileURL(__dirname).href);
});

test('returns require resolved path url', t => {
  const cwd = process.cwd();
  t.is(sut('./packages/client', cwd), pathToFileURL(path.join(cwd, 'packages/client/lib/index.cjs.js')).href);
});
