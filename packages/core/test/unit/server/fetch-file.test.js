import ava from 'ava';
import ninos from 'ninos';
import proxyquire from 'proxyquire';
import EventEmitter from 'events';
import { pathToFileURL } from 'url';

let _id = 0;
const test = ninos(ava);

test.beforeEach(t => {
  t.context.id = `test_${ _id++ }`;
  t.context.readStream = new EventEmitter();
  t.context.sut = proxyquire('../../../src/server/fetch-file', {
    'fs': {
      createReadStream: () => t.context.readStream
    },
    'cross-fetch': {
      Response: function (stream, options) {
        return options;
      }
    }
  }).default;
});

test('catches errors', t => {
  const { id, sut } = t.context;
  return t.throwsAsync(() => sut(pathToFileURL(id).href));
});

test('catches stream errors', t => {
  const { id, sut, readStream } = t.context;
  const promise = sut(pathToFileURL(__filename).href + '?' + id);
  return t.throwsAsync(() => {
    setTimeout(() => readStream.emit('error', Error('stream error')), 1);
    return promise;
  });
});

test('returns Response on open', async t => {
  const { id, sut, readStream } = t.context;
  const promise = sut(pathToFileURL(__filename).href + '?' + id);
  setTimeout(() => readStream.emit('open'), 1);
  const res = await promise;
  t.is(res.status, 200);
});
