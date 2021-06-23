import fs from 'fs';
import { fileURLToPath } from 'url';
import { Response } from 'cross-fetch';

export default url => new Promise((resolve, reject) => {
  try {
    const stream = fs.createReadStream(require.resolve(fileURLToPath(url)));
    stream.on('open', () => {
      resolve(new Response(stream, {
        url,
        status: 200,
        statusText: 'OK'
      }));
    });
    stream.on('error', reject);
  } catch (err) {
    reject(err);
  }
});
