export default (source, { name }) => {
  if (source === name || source === '~/' || source === '~/index') {
    return name;
  }
  if (source.startsWith('~/')) {
    return name + source.substr(1);
  }
  if (source.startsWith(`${ name }/`)) {
    return source;
  }
};
