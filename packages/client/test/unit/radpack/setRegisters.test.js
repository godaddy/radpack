import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Client, createClass } = t.context;
  t.context.instance = new (createClass(Client, {
    _setExports: () => {},
    _getExports: () => {}
  }))();
  t.context.registers = [];
  t.context.sut = (registers = t.context.registers) => t.context.instance._setRegisters(registers);
});

test('sets exports for each register', t => {
  const { sut, instance } = t.context;
  const registers = new Array(Math.floor(Math.random() * 10)).fill({});
  sut(registers);
  t.is(instance._setExports.calls.length, registers.length);
  t.is(instance._getExports.calls.length, registers.length);
});
