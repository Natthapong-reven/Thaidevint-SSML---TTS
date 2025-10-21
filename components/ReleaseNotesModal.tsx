import React from 'react';
import { CloseIcon } from './CloseIcon';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const releaseNotes = [
    {
        version: "2.0.0",
        date: "2024-07-26",
        notes: [
            "Stable Release: Application is now marked as stable, signifying feature completion and reliability.",
            "Application Renamed: Changed name from \"Devanagari to SSML & TTS\" to \"SSML & TTS Generate\" for broader scope.",
            "UI Enhancements: Added new application logo and a 'Stable' release badge in the header.",
            "Author Attribution: Added a direct link to the author's ORCID profile.",
            "Release Information: Implemented this modal to provide users with a clear version history."
        ]
    },
    {
        version: "1.8.1",
        date: "Previous",
        notes: [
            "Enhanced AI Research: Gemini now provides more accurate pronunciation guides (IPA) and smarter voice/tone recommendations.",
            "UI/UX Polish: Improved layout, clearer loading states, and more responsive controls.",
            "SSML Generation Logic: Refined prompts for more reliable and syntactically correct SSML output.",
            "Error Handling: Implemented more specific error messages for API failures.",
        ]
    },
    {
        version: "1.7.0",
        date: "Previous",
        notes: [
            "Introduced AI Fast Research feature.",
            "Added voice previews and selection UI.",
            "Initial public release.",
        ]
    }
];


export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative mx-4 w-full max-w-2xl rounded-lg border border-slate-700 bg-slate-800 text-gray-300 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-start justify-between border-b border-slate-700 p-5">
            <h2 className="text-2xl font-bold text-cyan-400">Release Notes</h2>
            <button 
                onClick={onClose} 
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Close modal"
            >
                <CloseIcon className="h-6 w-6" />
            </button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
            {releaseNotes.map((release) => (
                <div key={release.version}>
                    <div className="flex items-baseline space-x-3">
                        <h3 className="text-xl font-semibold text-white">Version {release.version}</h3>
                        <span className="text-sm text-gray-400">{release.date}</span>
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-300">
                        {release.notes.map((note, index) => (
                            <li key={index}>{note}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        
        <div className="flex justify-end border-t border-slate-700 p-4">
            <button
                onClick={onClose}
                className="rounded-lg bg-cyan-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-cyan-500"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};