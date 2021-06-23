import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { fetch } from '@radpack/core/server';
import { options }  from '../constants';
import writeFile from '../utils/write-file';
import parseFalse from '../utils/parse-false';
import mergeManifests from '../utils/merge-manifests';

export const command = 'merge [files..]';
export const description = 'Merge multiple radpack registry files';

export function builder(yargs) {
  yargs.positional('files', {
    describe: 'globs/files to radpack output',
    type: 'array',
    default: ['dist']
  }).options({
    ...options,
    filename: {
      alias: 'f',
      type: 'string',
      describe: 'registry file name',
      default: 'radpack.json'
    }
  }).coerce(['out'], parseFalse);
}

function isUrl(str) {
  return /^(file|http(s?)):/i.test(str);
}

export async function handler({ cwd, files, filename, out }) {
  const filesOrUrls = files.reduce((files, file) => {
    const isGlob = /\*/.test(file);
    const isDir = isGlob || (!isUrl(file) && fs.statSync(file).isDirectory());
    const input = path.resolve(cwd, file);
    if (isDir) {
      // use glob for directories
      files = files.concat(glob.sync(isGlob ? file : `**/${ filename }`, { cwd: input, absolute: true }));
    } else {
      files.push(input);
    }
    return files;
  }, []);

  const loadPromises = filesOrUrls.map(async fileOrUrl => {
    if (isUrl(fileOrUrl)) {
      const res = await fetch(fileOrUrl);
      if (!res.ok) {
        throw Error(`Failed to fetch ${ fileOrUrl }: ${ await res.text() }`);
      }
      return res.json();
    }
    // file path
    const json = await fs.promises.readFile(fileOrUrl);
    return JSON.parse(json);
  });

  const manifests = await Promise.all(loadPromises);

  const mergedManifest = mergeManifests(manifests);
  const result = JSON.stringify(mergedManifest, null, 2);

  if (out) {
    writeFile(path.resolve(cwd, out), result);
  } else {
    process.stdout.write(result);
  }
}
