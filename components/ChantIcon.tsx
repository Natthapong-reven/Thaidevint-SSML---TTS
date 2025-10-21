import React from 'react';

export const ChantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M12 18V2M7 6l10 0M5 10l14 0M8 14l8 0M6 18l12 0"></path>
    </svg>
  );
};