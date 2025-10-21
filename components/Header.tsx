import React from 'react';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 py-6 text-center shadow-lg backdrop-blur-md">
      <div className="container mx-auto flex flex-col items-center px-4">
        <Logo className="mb-4 h-16 w-16 text-cyan-400" />
        <div className="flex items-center">
          <h1 className="text-4xl font-bold tracking-tight text-cyan-400">
            SSML & TTS Generate
          </h1>
          <span className="ml-4 rounded-full bg-green-500/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-100">
            Stable
          </span>
        </div>
        <p className="mt-2 text-lg text-gray-300">
          Powered by Google Gemini
        </p>
        <p className="mt-2 text-base text-gray-400">
          <a
            href="https://orcid.org/0009-0006-1923-4837"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-cyan-300 hover:underline"
          >
            Thaidevint - Thailand Development & Integrate
          </a>
        </p>
      </div>
    </header>
  );
};