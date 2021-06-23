import flatten from './flatten';
import parseRegister from './parse-register';
import mergeRegisters from './merge-registers';

const fetchRegister = async (config, options) => {
  const configs = await flatten(config);
  const { fetch, parse = parseRegister, register = fetchRegister } = options;
  return (await Promise.all(configs.map(async partial => {
    const parsed = parse(partial, options);
    const url = parsed.url;
    if (url) {
      const baseUrl = url.slice(0, url.lastIndexOf('/'));
      const children = await register(fetch(url, options).then(res => res || {}), { ...options, base: url });
      return mergeRegisters(parsed, children).map(child => {
        const vars = child.vars;
        if (!vars.baseUrl) {
          vars.baseUrl = baseUrl;
        }
        return child;
      });
    }
    return parsed;
  }))).flat();
};

export default fetchRegister;
