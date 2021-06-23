import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Server, createClass } = t.context;
  t.context.registers = [];
  t.context.instance = new (createClass(Server, {
    _getExports: (config) => config
  }))();
  t.context.sut = (index = 0, registers = t.context.registers) => t.context.instance._setRegister(index, registers);
});

test('gets exports for each register', t => {
  const { sut, instance } = t.context;
  const registers = t.context.registers = new Array(Math.floor(Math.random() * 10)).fill({});
  sut();
  t.is(instance._getExports.calls.length, registers.length);
});

test('returns registers and exports', t => {
  const { sut } = t.context;
  t.deepEqual(sut(), { registers: [], exports: [] });
});
