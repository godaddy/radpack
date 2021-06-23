import Yargs from 'yargs';
import commands from './commands';

const yargs = Yargs
  .scriptName('radpack')
  .usage('Usage: $0 <command>');

export default commands.reduce((yargs, command) => yargs.command(command), yargs)
  .demandCommand()
  .strict()
  .help()
  .argv;
