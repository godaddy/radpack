import path from 'path';
import { fetchRegister } from '@radpack/core/server';
import { options } from '../constants';
import writeFile from '../utils/write-file';
import parseFalse from '../utils/parse-false';

export const command = 'register <file|url>';
export const description = 'load radpack register';

export function builder(yargs) {
  yargs.positional('file', {
    describe: 'location of register to import'
  }).options({
    ...options,
    optional: {
      describe: 'If true will fail silently and return {}',
      type: 'boolean',
      default: false
    }
  }).coerce(['out'], parseFalse);
}

export async function handler({ file, optional, cwd, out }) {
  let json;
  try {
    json = await fetchRegister(file, { cwd });
  } catch (err) {
    if (optional === false) {
      // register is not optional, fail
      throw err;
    }
  }
  const result = JSON.stringify(json || [], null, 2);
  if (out) {
    writeFile(path.resolve(cwd, out), result);
  } else {
    process.stdout.write(result);
  }
}
