export default (name, entry) => entry === 'index' ? name : `${ name }/${ entry }`;
