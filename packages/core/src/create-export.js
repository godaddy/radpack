import getExportId from './get-export-id';

export default (entry, versions, { name, vars }) => {
  return {
    id: getExportId(name, entry),
    vars,
    name,
    entry,
    versions
  };
};
