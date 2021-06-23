export default (partial, options = {}) => {
  const config = typeof partial === 'string'
    ? { url: partial }
    : { ...partial };
  return {
    ...config,
    url: config.url && options.base
      ? new URL(config.url, options.base).href
      : (config.url || false),
    vars: { ...config.vars },
    exports: { ...config.exports }
  };
};
