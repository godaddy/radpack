import React from 'react';
import { Provider } from '@radpack/react';
import hoistNonReactStatics from 'hoist-non-react-statics';

export default function withRadpack(App) {
  console.log('in wrapper', App);
  let radpackState;
  let radpackClient;
  if (process.browser) {
    radpackState = require('@gasket/data').radpackState;
    radpackClient = require('@radpack/client');
  }

  console.log('wrapper client', radpackClient, radpackState);

  function WrappedApp(props) {
    console.log('in wrapped render', radpackState);
    return (
      <Provider radpack={ radpackClient } value={ radpackState }>
        <App { ...props }/>
      </Provider>
    );
  }

  hoistNonReactStatics(WrappedApp, App);

  // WrappedApp.getInitialProps = async function (context) {
  //   const props = await App.getInitialProps?.() || {};
  //   console.dir({ locals: context.res?.locals }, { depth: null });
  //   let radpackState = null;
  //   if (context.res?.locals?.radpack) {
  //     radpackState = await context.res.locals.radpack.dehydrate();
  //   }
  //   return {
  //     ...props,
  //     radpackState
  //   };
  // };

  console.log('WrappedApp', WrappedApp);

  return WrappedApp;
}
