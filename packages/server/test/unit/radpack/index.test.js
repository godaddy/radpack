import setup from '../../../../../configs/test/unit';
import { mockManifest } from '../../../../../configs/mocks/create';

const test = setup();

test.beforeEach(t => {
  const { Server, createClass } = t.context;
  t.context.instance = new (createClass(Server, {}))();
});

test('load single', async t => {
  const { id, instance, fetch } = t.context;
  instance.register(mockManifest({ name: id }), { tts: 0 });
  fetch.onUrl(`${ id }/index.js`, fetch.createRes({
    text: `define('${ id }/index.js', ['exports'], exports => {
      exports.default = 'a_default';
    });`
  }));
  t.deepEqual(await instance(id), { default: 'a_default' });
});

test('load static entries', async t => {
  const { id, instance, fetch } = t.context;
  instance.register(mockManifest({
    name: id,
    exports: [{
      entry: 'a',
      statics: ['~/b']
    }, {
      entry: 'b'
    }]
  }), { tts: 0 });
  fetch.onUrl(`${ id }/a.js`, fetch.createRes({
    text: `define('${ id }/a.js', ['exports', '~/b'], (exports, b) => {
      exports.default = 'hello ' + b.default;
    });`
  }));
  fetch.onUrl(`${ id }/b.js`, fetch.createRes({
    text: `define('${ id }/b.js', ['exports'], exports => {
      exports.default = 'world';
    });`
  }));
  t.deepEqual(await instance(`${ id }/a`), { default: 'hello world' });
});

test('load static exports', async t => {
  const { id, instance, fetch } = t.context;
  const a = id + '_a';
  const b = id + '_b';
  instance.register([
    mockManifest({
      name: a,
      exports: [{
        entry: 'a',
        statics: [`${ b }/b`]
      }]
    }),
    mockManifest({
      name: b,
      exports: [{
        entry: 'b'
      }]
    })
  ], { tts: 0 });
  fetch.onUrl(`${ a }/a.js`, fetch.createRes({
    text: `define('${ a }/a.js', ['exports', '${ b }/b'], (exports, b) => {
      exports.default = 'foo ' + b.default;
    });`
  }));
  fetch.onUrl(`${ b }/b.js`, fetch.createRes({
    text: `define('${ b }/b.js', ['exports'], exports => {
      exports.default = 'bar';
    });`
  }));
  t.deepEqual(await instance(`${ a }/a`), { default: 'foo bar' });
});

test('with context', async t => {
  const { id, instance, fetch } = t.context;
  instance.register(mockManifest({
    name: id,
    exports: [{
      entry: 'i18n',
      file: '${locale}.js'
    }]
  }), { tts: 0 });
  fetch.onUrl(`${ id }/en-us.js`, fetch.createRes({
    text: `define('${ id }/en-us.js', ['exports'], exports => {
      exports.default = 'english';
    });`
  }));
  fetch.onUrl(`${ id }/es-mx.js`, fetch.createRes({
    text: `define('${ id }/es-mx.js', ['exports'], exports => {
      exports.default = 'spanish';
    });`
  }));
  t.deepEqual(await instance.withContext({ locale: 'en-us' })(`${ id }/i18n`), { default: 'english' });
  t.deepEqual(await instance.withContext({ locale: 'es-mx' })(`${ id }/i18n`), { default: 'spanish' });
});

