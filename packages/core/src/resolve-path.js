const propsRegex = /\${\s*(\w+)\s*}/g;

export default (path, props = {}) => path.replace(propsRegex, (match, prop) => prop in props ? props[prop] : match);
