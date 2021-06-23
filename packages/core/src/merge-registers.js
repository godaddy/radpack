import toArray from './to-array';

const KEYS = ['register'];
const OBJECT_KEYS = ['vars', 'exports'];

export default (register, config) => toArray(config).map(childReg => { // config may contain an array of results
  // parent explicit props take priority over child
  register = register || {};
  childReg = childReg || {};
  KEYS.forEach(key => {
    const value = register[key] != null ? register[key]  : childReg[key];
    if (value != null) {
      childReg[key] = value;
    }
  });
  OBJECT_KEYS.forEach(key => {
    childReg[key] = Object.assign(childReg[key] || {}, register[key]);
  });
  return childReg;
});
