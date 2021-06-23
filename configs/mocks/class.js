export default t => (Class, fns) => {
  const Mock = class extends Class {};
  Object.entries(fns).forEach(([name, fn]) => {
    Mock.prototype[name] = t.context.stub(fn);
  });
  return Mock;
};
