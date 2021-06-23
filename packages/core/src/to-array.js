import isArray from './is-array';

export default value => {
  if (!value) {
    return [];
  }
  return isArray(value)
    ? value
    : [value];
};
