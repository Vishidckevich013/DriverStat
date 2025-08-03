import React from 'react';
import './Loading.css';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = "Завожусь" }) => {
  return (
    <div className="loading-container">
      <div className="loading-wheel">
        {/* SVG иконка колёсного диска */}
        <svg 
          className="wheel-icon" 
          viewBox="0 0 100 100" 
          width="60" 
          height="60"
        >
          {/* Внешний обод колеса */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="#6c4aff" 
            strokeWidth="4"
          />
          
          {/* Внутренний диск */}
          <circle 
            cx="50" 
            cy="50" 
            r="35" 
            fill="none" 
            stroke="#6c4aff" 
            strokeWidth="3"
            opacity="0.7"
          />
          
          {/* Спицы колеса */}
          <g stroke="#6c4aff" strokeWidth="2" opacity="0.8">
            <line x1="50" y1="15" x2="50" y2="85" />
            <line x1="15" y1="50" x2="85" y2="50" />
            <line x1="25.5" y1="25.5" x2="74.5" y2="74.5" />
            <line x1="74.5" y1="25.5" x2="25.5" y2="74.5" />
          </g>
          
          {/* Центральная ступица */}
          <circle 
            cx="50" 
            cy="50" 
            r="8" 
            fill="#6c4aff"
          />
        </svg>
      </div>
      
      <div className="loading-text">
        {message}
      </div>
    </div>
  );
};

export default Loading;
