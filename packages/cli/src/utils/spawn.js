import { spawn } from 'cross-spawn';

export default (cmd, args, { callback, ...options } = {}) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    ...options,
    env: {
      ...(options.env || process.env),
      NO_UPDATE_NOTIFIER: 'true'
    }
  });
  if (callback) {
    // eslint-disable-next-line callback-return
    callback(child);
  }
  let stdout = '';
  let stderr = '';
  if (child.stdout) {
    child.stdout.on('data', (data) => {
      stdout += data;
    });
  }
  if (child.stderr) {
    child.stderr.on('data', (data) => {
      stderr += data;
    });
  }
  child.on('error', reject);
  child.on('close', code => {
    if (!code || code === 0) {
      return resolve();
    }
    const err = new Error(`spawn closed with exit code ${ code }`);
    err.code = code;
    if (stdout) {
      err.stdout = stdout;
    }
    if (stderr) {
      err.stderr = stderr;
    }
    reject(err);
  });
  return child;
});
