export default (pkg = {}) => {
  const externals = Object.keys({
    ...pkg.dependencies,
    ...pkg.peerDependencies
  });
  return id => externals.find(external => id === external || id.startsWith(`${ external }/`));
};
