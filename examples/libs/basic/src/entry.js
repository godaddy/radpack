// this module is also referenced in the index entry, causing the module to become a chunk
import * as chunk from './chunk';

export { chunk };
export const named = 'entry.named';
export default 'entry.default';
