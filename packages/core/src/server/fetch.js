import fetch from 'cross-fetch';
import AbortController from 'abort-controller';
import fetchFile from './fetch-file';
import { DEFAULT_DELAY, DEFAULT_TIMEOUT, DEFAULT_RETRIES } from './constants';

const sleep = ms => new Promise(resolve => ms > 0 ? setTimeout(resolve, ms) : resolve());

const smartFetch = (url, { delay = DEFAULT_DELAY, timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, ...options } = {}) => {
  if (url.startsWith('file:')) {
    return fetchFile(url);
  }
  let signal = options.signal;
  let timeoutTimer;
  if (!signal && timeout > 0) {
    const controller = new AbortController();
    signal = controller.signal;
    timeoutTimer = setTimeout(() => controller.abort(), timeout);
    timeoutTimer.unref();
  }
  const retry = retries > 0
    ? () => sleep(delay).then(() => smartFetch(url, { ...options, delay, timeout, retries: retries - 1 }))
    : false;
  return fetch(url, { ...options, signal })
    .finally(() => clearTimeout(timeoutTimer))
    .then(res => retry && !res.ok && res.status !== 304 ? retry() : res)
    .catch(err => {
      if (retry) {
        return retry();
      }
      throw err;
    });
};

export default smartFetch;

