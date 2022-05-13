// does not need to be installed, will fetch at runtime
import log from '@radpack/example-logger-lib';

// this is @radpack/example-basic-lib/entry
import * as entry from './entry';

// because more than one entry depends on this module, it becomes an chunk
import * as chunk from './chunk';

// because only this entry uses this, the module is bundled into the entry
import * as module from './module';

export default (addHtml) => [
  log('basic.entry', entry, addHtml),
  log('basic.chunk', chunk, addHtml),
  log('basic.module', module, addHtml)
].join('\n');
