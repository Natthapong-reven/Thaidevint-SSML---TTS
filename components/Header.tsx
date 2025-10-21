import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 py-6 text-center shadow-lg backdrop-blur-md">
      <div className="container mx-auto flex flex-col items-center px-4">
        <h1 className="text-4xl font-bold tracking-tight text-cyan-400">
          Devanagari to SSML & TTS
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Powered by Google Gemini
        </p>
        <p className="mt-2 text-base text-gray-400">
          Thaidevint - Thailand Development & Integrate
        </p>
      </div>
    </header>
  );
};