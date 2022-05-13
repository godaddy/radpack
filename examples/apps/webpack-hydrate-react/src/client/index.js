import React from 'react';
import ReactDOM from 'react-dom';
import { Consumer, Provider } from '@radpack/react';

ReactDOM.render((
  <Provider radpack={ radpack /* exposed by @radpack/webpack-plugin */ }>
    <Consumer name="@radpack/example-basic-lib" fallback={ <div>Loading...</div> }>
      { (run) => (
        <>
          React: { React.version }
          <div dangerouslySetInnerHTML={ { __html: run(false) } }/>
        </>
      ) }
    </Consumer>
  </Provider>
), document.getElementById('app'));
