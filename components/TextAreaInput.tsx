
import React from 'react';

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextAreaInput: React.FC<TextAreaInputProps> = (props) => {
  return (
    <textarea
      {...props}
      className="w-full flex-grow rounded-lg border-2 border-slate-700 bg-slate-800 p-4 text-gray-200 shadow-inner transition-colors duration-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
};
