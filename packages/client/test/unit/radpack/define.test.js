import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Client, createClass } = t.context;
  t.context.error = Error('define pass');
  t.context.instance = new (createClass(Client, {
    _getExport: () => {
      throw t.context.error;
    }
  }))();
  t.context.sut = (...args) => t.context.instance.define(...args);
});

test('calls super', t => {
  const { id, sut, document } = t.context;
  delete document.currentScript;
  return new Promise((resolve, reject) => sut(id, [], reject, err => {
    t.true(err.message.includes(t.context.error.message));
    resolve();
  }));
});

test('calls super with currentScript', t => {
  const { id, sut, createClass, Client, document } = t.context;
  const message = 'currentScript define pass';
  document.currentScript = {
    instance: new (createClass(Client, {
      _getExport: () => {
        throw Error(message);
      }
    }))()
  };
  return new Promise((resolve, reject) => sut(id, [], reject, err => {
    t.true(err.message.includes(message));
    resolve();
  }));
});
