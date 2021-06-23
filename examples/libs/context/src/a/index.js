// does not need to be installed, will fetch at runtime
import log from '@radpack/example-logger-lib';

// because only this entry uses this, the module is bundled into the entry
import * as module from './module';

export default () => log('context-a.module', module);
