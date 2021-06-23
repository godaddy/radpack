import path from 'path';
import { pathToFileURL } from 'url';

export default (url, cwd) => {
  if (!url || !url.startsWith('.') && !path.isAbsolute(url)) {
    return url;
  }
  let file = path.resolve(cwd, url);
  try {
    file = require.resolve(file);
  } catch {
    // Ignore, let consumer handle
  }
  return pathToFileURL(file).href;
};
