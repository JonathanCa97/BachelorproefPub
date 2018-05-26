import React from 'react';
import Spinner from 'react-spinkit';

export default ({
  message,
  spinner,
  imageData,
  messageStyle,
  recognizeMessage,
  personName,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
      }}>
      {spinner && (
        <Spinner style={{ margin: '15px auto' }} name={spinner} color="red" />
      )}
      {mesage ? (
        <h2>{message}</h2>
      ) : personName ? (
        <h1>
          {recognizeMessage}
          <span style={{ color: 'green' }}>{personName}</span>
        </h1>
      ) : (
        <h1 style={{ color: 'red' }}>{recognizeMessage}</h1>
      )}
      {imageData && (
        <img src={imageData} style={{ margin: '15px auto', width: '50%' }} />
      )}
    </div>
  );
};
