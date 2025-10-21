import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      {...props}
    >
      {/* Sound waves */}
      <path d="M55 40 a8 8 0 0 1 0 20" strokeWidth="6" />
      <path d="M65 30 a18 18 0 0 1 0 40" strokeWidth="5" />
      <path d="M75 20 a28 28 0 0 1 0 60" strokeWidth="4" />
      
      {/* Devanagari 'A' character (अ) */}
      <text 
        x="30" 
        y="75" 
        fontFamily="system-ui, sans-serif" 
        fontSize="60" 
        fill="currentColor" 
        stroke="none"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        अ
      </text>
    </svg>
  );
};
