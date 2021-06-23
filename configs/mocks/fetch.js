export default () => {
  let call = 0;
  const urls = new Map();
  const calls = new Map();
  const fetch = async (url, options) => {
    const callback = calls.get(++call) || urls.get(url);
    if (!callback) {
      return fetch.createRes();
    }
    if (typeof callback === 'function') {
      return callback(url, options);
    }
    return callback;
  };
  fetch.onUrl = (url, callback) => urls.set(url, callback);
  fetch.onCall = (index, callback) => calls.set(index, callback);
  fetch.createRes = ({
    error,
    status = 200,
    text = '',
    json = {},
    headers = new Map(),
    ...options
  } = {}) => {
    return error ? Promise.reject(error) : Promise.resolve({
      ok: status >= 200 && status < 300,
      status: status,
      text: async () => text,
      json: async () => json,
      headers,
      ...options
    });
  };
  return fetch;
};
