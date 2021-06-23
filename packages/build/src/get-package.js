import findUp from 'find-up';

const cache = new Map();

export default cwd => {
  let pkg = cache.get(cwd);
  if (!pkg) {
    cache.set(cwd, pkg = require(findUp.sync('package.json', { cwd })));
  }
  return pkg;
};
