import { useState, useEffect, useRef } from 'react';

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner">
        <div className="bounce1"></div>
        <div className="bounce2"></div>
        <div className="bounce3"></div>
      </div>
      <p>Loading 3D Shoe Customizer...</p>
    </div>
  );
}

export default LoadingSpinner;
