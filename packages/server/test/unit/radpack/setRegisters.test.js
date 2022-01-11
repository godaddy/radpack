import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Server, createClass } = t.context;
  t.context.instance = new (createClass(Server, {
    _watch: () => {},
    _setExports: () => {},
    _setRegister: (index, registers) => ({ registers, exports: registers })
  }))();
  t.context.registers = [];
  t.context.options = { tts: 0, urls: new Set(), done: () => {} };
  t.context.sut = (registers = t.context.registers, options = t.context.options) => t.context.instance._setRegisters(registers, options);
});

test('sets exports for each register', t => {
  const { sut, instance } = t.context;
  const registers = new Array(Math.floor(Math.random() * 10)).fill({});
  sut(registers);
  t.is(instance._setExports.calls.length, registers.length);
});

test('calls done', t => {
  const { sut, options, stub } = t.context;
  const done = stub();
  const urls = new Set(['a']);
  t.is(done.calls.length, 0);
  options.done = done;
  options.urls = urls;
  sut([{}]);
  t.is(done.calls.length, 1);
  t.deepEqual(done.calls[0].arguments[0], [...urls]);
});

test('calls watch', t => {
  const { sut, options, instance } = t.context;
  t.is(instance._watch.calls.length, 0);
  options.tts = 1;
  options.urls = new Set(['a']);
  sut([{}]);
  t.is(instance._watch.calls.length, 1);
});
