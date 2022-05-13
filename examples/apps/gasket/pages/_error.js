import React from 'react';
import PropTypes from 'prop-types';
export default function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `A ${ statusCode } error occurred on server`
        : 'An error occurred on client'}
    </p>
  );
}
Error.getInitialProps = ({ res, err }) => {
  let statusCode = 404;
  if (res) {
    statusCode = res.statusCode;
  } else if (err) {
    statusCode = err.statusCode;
  }
  return { statusCode };
};
Error.propTypes = {
  statusCode: PropTypes.number
};
