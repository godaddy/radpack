import path from 'path';
import fetchJson from './fetch-json';
import parseRegister from '../parse-register';
import fetchRegister from '../fetch-register';
import parseUrl from './parse-url';

const isUrlRegEx = /^(file:|https?:)?\/\//i;

export default async (file, { cwd = process.cwd() } = {}) => {
  const isUrl = isUrlRegEx.test(file);
  const config = isUrl ? file : path.resolve(cwd, file);
  return fetchRegister(config, {
    base: isUrl && file,
    parse(partial, options) {
      const config = parseRegister(partial, options);
      if (!isUrl && config && config.url) {
        config.url = parseUrl(config.url, cwd);
      }
      return config;
    },
    async fetch(url) {
      const res = url.match(isUrlRegEx)
        ? await fetchJson(url)
        : require(url);
      return res;
    }
  });
};
