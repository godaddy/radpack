import isArray from './is-array';
import toArray from './to-array';

const flatten = async obj => {
  const arr = await Promise.all(toArray(obj));
  const promises = await Promise.all(arr.map(val => isArray(val) ? flatten(val) : val));
  return promises.flat();
};

export default flatten;
