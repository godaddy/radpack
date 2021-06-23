import setup from '../../../../../configs/test/unit';

const test = setup();

test.beforeEach(t => {
  const { Core, createClass, create } = t.context;
  t.context._getExport = (id) => create.exp({ id });
  t.context.instance = new (createClass(Core, {
    _loadExport: () => {},
    _getCache: () => ({}),
    _getExport: (id) => t.context._getExport(id)
  }))();
  t.context.sut = (id) => t.context.instance._load(id);
});

test('loads id', t => {
  const { sut, instance } = t.context;
  sut('test');
  t.is(instance._loadExport.calls.length, 1);
});

test('loads array of ids', t => {
  const { sut, instance } = t.context;
  sut(['a', 'b']);
  t.is(instance._loadExport.calls.length, 2);
});
