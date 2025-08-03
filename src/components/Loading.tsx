import React from 'react';
import './Loading.css';
import DriveStatLogo from './DriveStatLogo';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = "Завожусь" }) => {
  return (
    <div className="loading-container">
      <div className="loading-wheel">
        <DriveStatLogo size={80} className="loading-logo" />
      </div>
      
      <div className="loading-text">
        {message}
      </div>
    </div>
  );
};

export default Loading;
