import React from 'react';
import PropTypes from 'prop-types';
import withRadpack from '@radpack/gasket-plugin/withRadpack';

const App = function ({ Component, pageProps }) {
  return (
    <Component { ...pageProps } />
  );
};

App.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object
};
//
// export const getServerSideProps = (ctx) => {
//   console.log('in app getServerSideProps', ctx)
// }
//
// export const getInitialProps = (context) => {
//   console.log({ context });
//   // return App.getInitialProps(context);
//   return {};
// };

export default withRadpack(App);
// export default withRadpack(App);
