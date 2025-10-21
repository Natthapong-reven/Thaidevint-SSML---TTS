import React from 'react';

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-red-400 bg-red-900/50 p-4 text-red-300" role="alert">
      <span className="font-medium">{message}</span>
      <button
        onClick={onDismiss}
        className="-mr-1 -mt-1 ml-4 rounded-md p-1 text-red-300 transition-colors hover:bg-red-800/50 focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Dismiss"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};