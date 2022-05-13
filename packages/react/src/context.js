import { createContext } from 'react';

export default createContext(globalThis.radpack || null);
