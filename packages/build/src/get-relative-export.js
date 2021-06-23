export default (source, { name }) => {
  if (source === name) {
    return `~/index`;
  }
  if (source.startsWith(`${ name }/`)) {
    return `~${ source.substr(name.length) }`;
  }
  return source;
};
