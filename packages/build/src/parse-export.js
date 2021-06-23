import { getExportId } from '@radpack/core';

export default (id) => {
  const split = id.split('/');
  const scope = split[0].startsWith('@') ? (split.shift() + '/') : '';
  const [repo, version] = (split.shift() || '').split('@');
  const name = scope + repo;
  const entry = split.join('/') || 'index';
  const path = getExportId('', entry);
  return  {
    id: name + path,
    version,
    name,
    entry,
    path
  };
};
