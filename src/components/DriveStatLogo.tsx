import React from 'react';

interface DriveStatLogoProps {
  size?: number;
  className?: string;
}

const DriveStatLogo: React.FC<DriveStatLogoProps> = ({ 
  size = 60, 
  className = '' 
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      className={className}
      style={{ filter: 'drop-shadow(0 0 8px rgba(108, 74, 255, 0.3))' }}
    >
      {/* Циферблат спидометра */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="#6c4aff" strokeWidth="4"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="#6c4aff" strokeWidth="2" opacity="0.5"/>
      
      {/* Деления */}
      <g stroke="#6c4aff" strokeWidth="2">
        <line x1="50" y1="15" x2="50" y2="25"/>
        <line x1="78" y1="35" x2="72" y2="40"/>
        <line x1="85" y1="50" x2="75" y2="50"/>
        <line x1="78" y1="65" x2="72" y2="60"/>
        <line x1="50" y1="85" x2="50" y2="75"/>
        <line x1="22" y1="65" x2="28" y2="60"/>
        <line x1="15" y1="50" x2="25" y2="50"/>
        <line x1="22" y1="35" x2="28" y2="40"/>
      </g>
      
      {/* Стрелка указывающая на рост */}
      <line x1="50" y1="50" x2="70" y2="35" stroke="#00ff88" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="50" cy="50" r="4" fill="#00ff88"/>
      
      {/* Центральная точка */}
      <circle cx="50" cy="50" r="4" fill="#00ff88"/>
      
    </svg>
  );
};

export default DriveStatLogo;
