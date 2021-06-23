const defaultKeys = ['vars', 'exports'];

export default function mergeManifests(manifests = [], { keys = defaultKeys } = {}) {
  return manifests.reduce((obj, manifest) => {
    keys.forEach(key => {
      if (key in manifest) {
        if (!(key in obj)) {
          obj[key] = {};
        }
        Object.assign(obj[key], manifest[key]);
      }
    });
    return obj;
  }, {});
}
