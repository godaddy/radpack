import React, { useContext, useEffect, useState } from 'react';
import context from './context';

const Components = {};
const requests = {};

export default ({ name, entry, version, children, fallback = null }) => {
  // Get radpack instance
  const radpack = useContext(context);

  // Generate radpack id
  let id = name;
  if (version) {
    id += `@${ version }`;
  }
  if (entry && entry !== 'index') {
    id += `/${ entry }`;
  }

  // Fetch Component
  const [Component, setComponent] = useState(Components[id]);
  useEffect(() => {
    if (id in Components) {
      return void setComponent(Components[id]);
    }
    if (!radpack) {
      throw Error('radpack is required: expose a global or pass a radpack prop to Provider');
    }
    (requests[id] = requests[id] || radpack(id)).then(res => {
      setComponent(Components[id] = res);
    });
  }, [id]);

  // Render
  return Component
    ? children(Component.default)
    : fallback;
};
