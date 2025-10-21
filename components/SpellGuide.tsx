import React from 'react';
import { TextAreaInput } from './TextAreaInput';

interface SpellGuideProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}

export const SpellGuide: React.FC<SpellGuideProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex flex-col space-y-2 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <h3 className="text-lg font-semibold text-cyan-400">Pronunciation Guide (Editable)</h3>
      <p className="text-xs text-gray-400">
        Provide custom pronunciation instructions for the AI to improve SSML generation.
      </p>
      <TextAreaInput
        value={value}
        onChange={onChange}
        rows={10}
        disabled={disabled}
        aria-label="Editable pronunciation guide for the AI"
      />
    </div>
  );
};