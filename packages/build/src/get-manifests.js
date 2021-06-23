import { mergeRegisters, parseRegister } from '@radpack/core';
import { fetchRegister } from '@radpack/core/server';

export default async (sources, options) => {
  return (await Promise.all(sources.map(async (source) => {
    const config = parseRegister(source, options);
    if (config.url) {
      const manifest = await fetchRegister(config.url, options);
      return mergeRegisters(config, manifest);
    }
    return config;
  }))).flat().filter(manifest => {
    if (!manifest || !manifest.exports) {
      // eslint-disable-next-line no-console
      console.warn('Skipping unknown manifest format', manifest);
      return false;
    }
    return true;
  });
};
