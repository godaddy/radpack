import path from 'path';
import { getExportId } from '@radpack/core';
import getVersion from './get-version';
import getAbsolute from './get-absolute-export';
import parseExport from './parse-export';
import { CLIENT_LIBRARY, SERVER_LIBRARY } from './constants';

export default (exports, source, options) => {
  if (source === CLIENT_LIBRARY || source === SERVER_LIBRARY) {
    throw Error(`importing '${ source }' is prohibited, use the global 'radpack' instance`);
  }
  const prefix = source.charAt(0);
  if (prefix === '.' || prefix === '/' || path.isAbsolute(source)) {
    return;
  }
  const abs = getAbsolute(source, options);
  if (abs) {
    return abs;
  }
  if (source in exports) {
    const exp = exports[source];
    // non-versioned, add one
    let version = getVersion(exp, options) || '';
    if (version) {
      version = '@' + version;
    }
    return getExportId(exp.name + version, exp.entry);
  }
  try {
    const { id, version } = parseExport(source);
    if (version && id in exports) {
      // already versioned, pass through
      return source;
    }
  } catch {
    // ignore
  }
};
