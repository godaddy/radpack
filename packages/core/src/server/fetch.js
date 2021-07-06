import fetch from 'cross-fetch';
import fetchFile from './fetch-file';
import { DEFAULT_DELAY, DEFAULT_TIMEOUT } from './constants';

const sleep = ms => new Promise(resolve => ms > 0 ? setTimeout(resolve, ms) : resolve());

const smartFetch = (url, { delay = DEFAULT_DELAY, timeout = DEFAULT_TIMEOUT, retries = 0, ...options } = {}) => {
  if (url.startsWith('file:')) {
    return fetchFile(url);
  }
  const retry = retries-- > 0
    ? () => sleep(delay).then(() => smartFetch(url, { ...options, delay, retries }))
    : false;
  return fetch(url, { ...options, timeout }).then(res => !res.ok && res.status !== 304 && retry ? retry() : res, err => {
    if (retry) {
      return retry();
    }
    throw err;
  });
};

export default smartFetch;

