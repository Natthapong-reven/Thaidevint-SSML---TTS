
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative h-full min-h-[290px] w-full rounded-lg border-2 border-slate-700 bg-slate-800 p-4 font-mono text-sm text-gray-300 shadow-inner">
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 rounded-md bg-slate-700 px-3 py-1 text-xs text-gray-200 transition-colors hover:bg-slate-600"
        disabled={!code}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="h-full w-full overflow-auto whitespace-pre-wrap">
        <code>{code || '// SSML output will be shown here...'}</code>
      </pre>
    </div>
  );
};
