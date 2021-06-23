import fs from 'fs';
import path from 'path';

export default function writeFile(filepath, ...args) {
  try {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
  } catch (_e) {
    // Ignore
  }
  return fs.writeFileSync(filepath, ...args);
}
