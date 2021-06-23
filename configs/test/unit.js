import ava from 'ava';
import ninos from 'ninos';
import proxyquire from 'proxyquire';
import fetch from '../mocks/fetch';
import createClass from '../mocks/class';
import Core from '../../packages/core/src/radpack';

export default (defaultState) => {
  let id = 0;
  const test = ninos(ava);

  test.before(t => {
    Object.assign(t.context, {
      fetch: globalThis.fetch = fetch()
    });
  });

  test.beforeEach(t => {
    const state = { ...defaultState };
    Object.assign(t.context, {
      Core,
      createClass: createClass(t),
      get id() {
        return `test_${ id++ }`;
      },
      get Client() {
        return state.Client
          ? state.Client
          : (state.Client = proxyquire('../../packages/client/src/radpack', {}).default);
      },
      get Server() {
        return state.Server
          ? state.Server
          : (state.Server = proxyquire('../../packages/server/src/radpack', {
            '@radpack/core/server': {
              fetch: (...args) => t.context.fetch(...args)
            }
          }).default);
      },
      get core() {
        return state.core
          ? state.core
          : (state.core = new Core());
      },
      get client() {
        return state.client
          ? state.client
          : (state.client = new t.context.Client());
      },
      get server() {
        return state.server
          ? state.server
          : (state.server = new t.context.Server());
      },
      document: globalThis.document = {
        createElement: t.context.stub((tagName) => ({ tagName })),
        head: {
          appendChild: t.context.stub()
        },
        location: {
          href: ''
        }
      },
      create: {
        exp: (config) => ({
          id: '',
          url: false,
          ...config,
          data: {
            statics: [],
            ...(config && config.data)
          }
        }),
        register: (config) => ({
          vars: {},
          exports: {},
          ...config
        })
      }
    });
  });

  return test;
};
