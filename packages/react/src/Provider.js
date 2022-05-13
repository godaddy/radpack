import React, { useContext } from 'react';
import context from './context';

export default ({ radpack, value, children }) => {
  // Get radpack instance
  const curRadpack = useContext(context);
  let applyProvider = false;
  if (!radpack) {
    radpack = curRadpack;
  } else if (radpack !== curRadpack) {
    applyProvider = true;
  }

  // Hydrate radpack
  if (radpack && value) {
    radpack.hydrate(
      typeof value === 'string'
        ? JSON.parse(value)
        : value
    );
  }

  // Render children
  return applyProvider ? (
    <context.Provider value={ radpack }>{ children }</context.Provider>
  ) : children;
};
