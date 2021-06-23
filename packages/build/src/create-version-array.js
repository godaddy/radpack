export default ({ major, minor, patch, release }) => {
  if (release) {
    return [major, minor, patch, release];
  }
  const array = [major];
  if (patch) {
    array.push(minor);
    array.push(patch);
  } else if (minor) {
    array.push(minor);
  }
  return array;
};
