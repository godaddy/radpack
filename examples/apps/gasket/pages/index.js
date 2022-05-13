import React from 'react';
import { Consumer } from '@radpack/react';

function IndexPage() {
  return (
    <Consumer name="@radpack/example-basic-lib" fallback={ <div>Loading...</div> }>
      { (run) => (
        <>
          React: { React.version }
          <div dangerouslySetInnerHTML={ { __html: run(false) } }/>
        </>
      ) }
    </Consumer>
  );
}
//
// IndexPage.getInitialProps = (context) => {
//   console.log({ context });
//   return {};
// };

export default IndexPage;
