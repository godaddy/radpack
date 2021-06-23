import MagicString from 'magic-string';
import { simple as walk } from 'acorn-walk';
import { getRelativeExport } from '@radpack/build';

function updateDependency(element, state) {
  const { ms, name, file } = state;
  const prev = element.value;
  const next = prev.startsWith('.')
    ? getRelativeExport(name + new URL(prev, `file:///${ file }`).pathname, state)
    : getRelativeExport(prev, state);
  if (prev !== next) {
    ms.overwrite(element.start, element.end, JSON.stringify(next));
  }
}

function handleIdentifier(node, state) {
  const { name } = node;
  if (name === 'radpack') {
    state.addRadpack = true;
  }
}

function handleCallExpression(node, state) {
  const { callee: { type, name } } = node;
  if (type === 'Identifier') {
    if (name === 'define') {
      handleDefineCall(node, state);
    } else if (name === 'require') {
      handleRequireCall(node, state);
    } else if (name === 'radpack') {
      handleRadpackCall(node, state);
    }
  }
}

function handleDefineCall(node, state) {
  if (state.define) {
    // Define already declared
    throw Error(`Multiple defines detected in '${ state.entry }' chunk`);
  }
  let dependencies, callback;
  const { callee, arguments: args } = node;
  const start = callee.end + 1;
  if (args.length === 1) {
    // No dependency array, create one
    dependencies = {
      type: 'ArrayExpression',
      start,
      elements: []
    };
    [callback] = args;
  } else if (args.length === 2) {
    [dependencies, callback] = args;
  } else {
    throw Error(`Expected only 1 or 2 define arguments, got ${ args.length }`);
  }
  const setId = id => {
    // Add define id
    state.ms.appendLeft(start, JSON.stringify(id) + ', ');
  };
  // Add to state to process later
  state.define = { dependencies, callback, setId };
}

function handleRequireCall(node, state) {
  const { callee, arguments: args } = node;
  const arg = args[0] || {};
  if (arg.type !== 'ArrayExpression') {
    // Leave native require calls alone
    return;
  }
  // Convert to radpack call
  state.addRadpack = true;
  state.ms.overwrite(callee.start, callee.end, 'radpack.require');
  arg.elements.forEach(element => {
    updateDependency(element, state);
  });
}

function handleRadpackCall(node, state) {
  const { arguments: args } = node;
  const arg = args[0] || {};
  if (arg.type === 'Literal') {
    updateDependency(arg, state);
  } else if (arg.type === 'ArrayExpression') {
    arg.elements.forEach(element => {
      updateDependency(element, state);
    });
  }
}

// eslint-disable-next-line max-statements
export default function transform({ code, ast }, options) {
  // Create state
  const ms = new MagicString(code);
  const state = { ...options, ms, addRadpack: false };
  // Parse code
  walk(ast, {
    Identifier: handleIdentifier,
    CallExpression: handleCallExpression
  }, null, state);
  // Validate
  if (!state.define) {
    throw Error(`No define definition found`);
  }
  const { dependencies, callback, setId } = state.define;
  if (dependencies.type !== 'ArrayExpression') {
    throw Error(`Expected 'ArrayExpression' for define dependencies, got '${ dependencies.type }'`);
  }
  if (callback.type !== 'FunctionExpression' && callback.type !== 'ArrowFunctionExpression') {
    throw Error(`Expected 'FunctionExpression' or 'ArrowFunctionExpression' for define callback, got '${ callback.type }'`);
  }
  if (dependencies.elements.length !== callback.params.length) {
    throw Error(`Mismatch of dependency to callback arguments`);
  }
  // Update define dependencies
  let hasRadpack = false;
  dependencies.elements.forEach((element, index) => {
    let value = element.value;
    if (value === 'require') {
      value = 'radpack';
      const param = callback.params[index];
      ms.overwrite(param.start, param.end, value);
      ms.overwrite(element.start, element.end, JSON.stringify(value));
    } else {
      updateDependency(element, state);
    }
    if (value === 'radpack') {
      hasRadpack = true;
    }
  });
  // Finalize dependency array/callback params
  const hasDependencyArray = 'end' in dependencies;
  if (state.addRadpack && !hasRadpack) {
    const parenthesisIndex = code.indexOf('(', callback.start);
    if (hasDependencyArray) {
      const arrayLength = dependencies.elements.length;
      if (arrayLength) {
        // Append to array
        const element = dependencies.elements[arrayLength - 1];
        const param = callback.params[arrayLength - 1];
        ms.appendRight(element.end, ', "radpack"');
        if (parenthesisIndex >= 0 && parenthesisIndex < callback.body.start) {
          ms.appendRight(param.end, ', radpack');
        } else {
          // Add parentheses
          ms.appendLeft(callback.params[0].start, '(');
          ms.appendRight(param.end, ', radpack)');
        }
      } else {
        // Append to empty array
        ms.appendRight(dependencies.start + 1, '"radpack"');
        ms.appendRight(parenthesisIndex + 1, 'radpack');
      }
    } else {
      // Create dependency array with radpack dependency
      ms.appendRight(dependencies.start, '["radpack"], ');
      ms.appendRight(parenthesisIndex + 1, 'radpack');
    }
  } else if (!hasDependencyArray) {
    // Create empty dependency array
    ms.appendRight(dependencies.start, '[], ');
  }
  return {
    setId,
    get code() {
      return ms.toString();
    },
    get map() {
      return ms.generateMap({ hires: true });
    }
  };

}
