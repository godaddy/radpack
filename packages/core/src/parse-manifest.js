import createExport from './create-export';
import createEntry from './create-entry';
import toArray from './to-array';
import isArray from './is-array';
import defaultVars from './constants/vars';

export default (manifest, resolveEntry, resolveVersion) => {
  return Object.keys(manifest.exports).reduce((exps, name) => {
    const exp = manifest.exports[name];
    const versions = exp.v.map(v => resolveVersion(v));
    const dependencies = exp.d.slice(0);
    const index = dependencies.findIndex(value => !isArray(value));
    const entries = dependencies.slice(0, index >= 0 ? index : void 0);
    const options = { vars: { ...defaultVars, ...manifest.vars }, name };
    entries.forEach(([entry], index) => {
      dependencies[index] = resolveEntry(entry, options);
    });
    entries.forEach(([entry, variants]) => {
      const exp = createExport(entry, variants.reduce((arr, { v, u = null, f = null, s = [], d = [] }) => {
        const statics = s.map(dependency => dependencies[dependency]);
        const dynamics = d.map(dependency => dependencies[dependency]);
        toArray(v).forEach(version => {
          arr.push(createEntry({
            url: u,
            file: f,
            statics,
            dynamics
          }, { version: versions[version] }));
        });
        return arr;
      }, []), options);
      exps.push(exp);
    });
    return exps;
  }, []);
};
