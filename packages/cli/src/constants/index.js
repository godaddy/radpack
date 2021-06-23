export const options = {
  cwd: {
    type: 'string',
    default: process.cwd(),
    describe: 'working directory'
  },
  out: {
    alias: 'o',
    describe: 'output file'
  }
};
