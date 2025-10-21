import React from 'react';

interface AiResearchReportProps {
  report: {
    guidance: string;
    voiceProfile: {
      sex: string;
      age: string;
      occupation: string;
    };
    recommendedVoice: string;
    recommendedVocalExpression: string;
    recommendedTone: string;
    reasoning: {
        voice: string;
        expression: string;
        tone: string;
    };
  };
  onDismiss: () => void;
}

export const AiResearchReport: React.FC<AiResearchReportProps> = ({ report, onDismiss }) => {
  return (
    <div className="animate-fade-in-up flex flex-col space-y-4 rounded-lg border-2 border-cyan-500/50 bg-slate-800 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-cyan-400">AI Research Report</h3>
        <button onClick={onDismiss} className="text-2xl font-light text-slate-400 transition-colors hover:text-white">&times;</button>
      </div>

      <div className="space-y-3 rounded-md bg-slate-900/50 p-3">
        <h4 className="font-semibold text-gray-300">Recommended Settings</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
          <div className="flex space-x-2">
            <span className="font-medium text-gray-400">Sex:</span>
            <span className="text-gray-200">{report.voiceProfile.sex}</span>
          </div>
          <div className="flex space-x-2">
            <span className="font-medium text-gray-400">Age:</span>
            <span className="text-gray-200">{report.voiceProfile.age}</span>
          </div>
          <div className="flex space-x-2">
            <span className="font-medium text-gray-400">Occupation:</span>
            <span className="text-gray-200">{report.voiceProfile.occupation}</span>
          </div>
          <div className="flex space-x-2">
            <span className="font-medium text-gray-400">Expression:</span>
            <span className="text-gray-200">{report.recommendedVocalExpression}</span>
          </div>
          <div className="flex space-x-2">
            <span className="font-medium text-gray-400">Tone:</span>
            <span className="text-gray-200">{report.recommendedTone}</span>
          </div>
        </div>
         <p className="pt-2 text-sm">
            <span className="font-medium text-gray-400">Best Voice Match: </span>
            <span className="font-bold text-cyan-400">{report.recommendedVoice}</span>
        </p>
      </div>
      
       {report.reasoning && (
        <div className="space-y-2 rounded-md bg-slate-900/50 p-3">
          <h4 className="font-semibold text-gray-300">AI Reasoning</h4>
          <p className="text-xs italic text-gray-300">
            <span className="font-semibold text-gray-400">Voice: </span>
            {report.reasoning.voice}
          </p>
          <p className="text-xs italic text-gray-300">
            <span className="font-semibold text-gray-400">Expression: </span>
            {report.reasoning.expression}
          </p>
          <p className="text-xs italic text-gray-300">
            <span className="font-semibold text-gray-400">Tone: </span>
            {report.reasoning.tone}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-semibold text-gray-300">Suggested Pronunciation Guide</h4>
        <pre className="max-h-40 w-full overflow-auto whitespace-pre-wrap rounded-md bg-slate-900/50 p-3 font-sans text-sm text-gray-300">
            {report.guidance}
        </pre>
      </div>
      
    </div>
  );
};