import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TextAreaInput } from './components/TextAreaInput';
import { Button } from './components/Button';
import { CodeBlock } from './components/CodeBlock';
import { Loader } from './components/Loader';
import { SpellGuide } from './components/SpellGuide';
import { AiResearchReport } from './components/AiResearchReport';
import { SelectionCard } from './components/SelectionCard';
import { SpeechIcon } from './components/SpeechIcon';
import { ChantIcon } from './components/ChantIcon';
import { RecitationIcon } from './components/RecitationIcon';
import { playAudio, createWavBlob } from './utils/audioUtils';
import { detectLanguage, generateSSML, generateSpeech, performAiResearch } from './services/geminiService';
import { ErrorAlert } from './components/ErrorAlert';
import { PlayIcon } from './components/PlayIcon';
import { ReleaseNotesModal } from './components/ReleaseNotesModal';
import { InfoIcon } from './components/InfoIcon';

// Types
interface VoiceProfile {
  name: string;
  gender: 'Male' | 'Female';
  age: 'Adult' | 'Senior' | 'Child';
  description: string;
}

type AiReport = Awaited<ReturnType<typeof performAiResearch>> | null;

// Constants
const APP_VERSION = "2.0.0";
const RELEASE_TIMESTAMP = "2024-07-26";
const DEFAULT_TEXT = "ॐ भूर्भुवः स्वः\nतत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि\nधियो यो नः प्रचोदयात्॥";
const DEFAULT_GUIDE = "ॐ (/oːm/) - A sacred syllable.\nभूर्भुवः स्वः (/bʱuːɾ.bʱʊ.ʋəh.sʋəh/) - The three realms.\nधीमहि (/dʱiː.mə.ɦi/) - We meditate.\nप्रचोदयात् (/pɾə.t͡ʃoː.d̪ə.jɑːt/) - May he inspire.";

const voices: VoiceProfile[] = [
    { name: 'Puck', gender: 'Male', age: 'Adult', description: 'A clear, standard male voice.' },
    { name: 'Charon', gender: 'Male', age: 'Senior', description: 'A deep, resonant, and mature male voice.' },
    { name: 'Kore', gender: 'Female', age: 'Adult', description: 'A standard, warm female voice.' },
    { name: 'Fenrir', gender: 'Male', age: 'Adult', description: 'A strong and authoritative male voice.' },
    { name: 'Zephyr', gender: 'Female', age: 'Adult', description: 'A gentle and soft-spoken female voice.' },
];

const vocalExpressions = [
    { id: 'Speech', label: 'Speech', icon: <SpeechIcon className="mb-1 h-6 w-6" /> },
    { id: 'Chant', label: 'Chant', icon: <ChantIcon className="mb-1 h-6 w-6" /> },
    { id: 'Recitation', label: 'Recitation', icon: <RecitationIcon className="mb-1 h-6 w-6" /> },
];

const tones = [ 'Standard', 'Age-appropriate', 'Stylish', 'Calm', 'Meditative', 'Reverent', 'Relaxed', 'Energetic', 'Motivational' ];

function App() {
  // State management
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [guideText, setGuideText] = useState(DEFAULT_GUIDE);
  const [language, setLanguage] = useState('Sanskrit');
  const [ssml, setSSML] = useState('');
  const [base64Audio, setBase64Audio] = useState('');
  
  const [vocalExpression, setVocalExpression] = useState('Recitation');
  const [tone, setTone] = useState('Reverent');
  const [selectedVoice, setSelectedVoice] = useState('Charon');

  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [isGeneratingSSML, setIsGeneratingSSML] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [aiReport, setAiReport] = useState<AiReport>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
  
  // FIX: Use `ReturnType<typeof setTimeout>` for browser-compatible timeout type.
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to clear outputs when settings change
  const clearOutputs = () => {
    setSSML('');
    setBase64Audio('');
  };

  // Debounced language detection
  useEffect(() => {
    if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
    }
    if (!inputText.trim()) {
        setLanguage('Unknown');
        return;
    }
    debounceTimeout.current = setTimeout(async () => {
        try {
            const detectedLang = await detectLanguage(inputText);
            setLanguage(detectedLang);
        } catch (e) {
            console.error(e);
            setLanguage('Unknown');
        }
    }, 500);

    return () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    };
  }, [inputText]);
  
  // Effect to clear outputs on input or settings change
  useEffect(() => {
    clearOutputs();
  }, [inputText, guideText, vocalExpression, tone, selectedVoice]);

  const handleError = (message: string, duration = 5000) => {
    setError(message);
    setTimeout(() => setError(null), duration);
  };
  
  // Handlers
  const handleReset = () => {
    setInputText(DEFAULT_TEXT);
    setGuideText(DEFAULT_GUIDE);
    setAiReport(null);
    clearOutputs();
  };

  const handleClear = () => {
    setInputText('');
    setGuideText('');
    setAiReport(null);
    clearOutputs();
  };
  
  const handleAiResearch = async () => {
    if (!inputText) {
        handleError("Input text cannot be empty.");
        return;
    }
    setIsResearching(true);
    setAiReport(null);
    setError(null);
    try {
        const report = await performAiResearch(inputText, language, voices);
        setAiReport(report);
    } catch (e) {
        handleError((e as Error).message);
    } finally {
        setIsResearching(false);
    }
  };
  
  const handleApplySuggestions = () => {
    if (!aiReport) return;
    setGuideText(aiReport.guidance);
    setSelectedVoice(aiReport.recommendedVoice);
    setVocalExpression(aiReport.recommendedVocalExpression);
    setTone(aiReport.recommendedTone);
    setShowGuide(true);
    setAiReport(null); // Dismiss report after applying
  };
  
  const handleGenerateSSML = async () => {
      if (!inputText) {
        handleError("Input text cannot be empty.");
        return;
    }
    setIsGeneratingSSML(true);
    setError(null);
    clearOutputs();
    try {
        const generatedSsml = await generateSSML(inputText, guideText, vocalExpression, tone, language);
        setSSML(generatedSsml);
    } catch (e) {
        handleError((e as Error).message);
    } finally {
        setIsGeneratingSSML(false);
    }
  };

  const handlePlayAudio = async () => {
    const textToPlay = ssml || inputText;
    if (!textToPlay) {
        handleError("There is nothing to play.");
        return;
    }
    setIsPlaying(true);
    setError(null);
    try {
      let audioData = base64Audio;
      if (!audioData) {
        audioData = await generateSpeech(textToPlay, selectedVoice);
        setBase64Audio(audioData);
      }
      await playAudio(audioData);
    } catch (e) {
        handleError((e as Error).message);
    } finally {
        setIsPlaying(false);
    }
  };
  
  const handleSaveSSML = () => {
    if (!ssml) {
        handleError("Generate SSML first before saving.");
        return;
    }
    const blob = new Blob([ssml], { type: 'application/ssml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.ssml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleExportAudio = async () => {
    if (!base64Audio) {
      handleError("Play the audio first to generate the file, then export.");
      return;
    }
    try {
      const blob = createWavBlob(base64Audio);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'speech_output.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      handleError("Failed to create WAV file.");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column: Input & Research */}
            <div className="flex flex-col space-y-6">
                <div className="flex-grow rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-cyan-400">Input Text</h2>
                        <span className="text-sm font-medium text-gray-400">Detected Language: <span className="font-bold text-cyan-300">{language}</span></span>
                    </div>
                    <TextAreaInput
                        rows={10}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter Devanagari text here..."
                    />
                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Button onClick={handleReset} variant="secondary" disabled={isLoading}>🌀 Reset</Button>
                        <Button onClick={handleClear} variant="secondary" disabled={isLoading}>🧹 Clear</Button>
                        <Button onClick={() => setShowGuide(!showGuide)} variant="secondary" disabled={isLoading}>
                            {showGuide ? 'Hide' : 'Show'} Guide
                        </Button>
                        <Button onClick={handleAiResearch} disabled={isLoading || !inputText}>
                            {isResearching ? <><Loader /> Researching...</> : '⚡ AI Fast Research'}
                        </Button>
                    </div>
                </div>

                {showGuide && <SpellGuide value={guideText} onChange={(e) => setGuideText(e.target.value)} disabled={isLoading} />}
                
                {aiReport && (
                    <div className="flex flex-col space-y-4">
                        <AiResearchReport report={aiReport} onDismiss={() => setAiReport(null)} />
                        <Button onClick={handleApplySuggestions}>
                           ✅ Apply AI Suggestions
                        </Button>
                    </div>
                )}
            </div>
            
            {/* Right Column: Output & Controls */}
            <div className="flex flex-col space-y-6">
                 <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                    <h2 className="mb-3 text-xl font-semibold text-cyan-400">Audio Configuration</h2>
                    
                    {/* Vocal Expression */}
                    <div className="mb-4">
                        <h3 className="mb-2 text-base font-medium text-gray-300">Vocal Expression</h3>
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            {vocalExpressions.map(exp => (
                                <SelectionCard
                                    key={exp.id}
                                    label={exp.label}
                                    icon={exp.icon}
                                    isSelected={vocalExpression === exp.id}
                                    onClick={() => setVocalExpression(exp.id)}
                                    disabled={isLoading}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {/* Tone */}
                    <div className="mb-4">
                        <h3 className="mb-2 text-base font-medium text-gray-300">Tone / Prosody</h3>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          disabled={isLoading}
                          className="w-full rounded-lg border-2 border-slate-600 bg-slate-700 p-2.5 text-gray-200 shadow-inner transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                            {tones.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    
                    {/* Voice Selection */}
                    <div>
                        <h3 className="mb-2 text-base font-medium text-gray-300">Voice Selection</h3>
                        <div className="space-y-2">
                          {voices.map(voice => (
                            <div
                              key={voice.name}
                              onClick={() => !isLoading && setSelectedVoice(voice.name)}
                              className={`flex cursor-pointer items-center justify-between rounded-md p-3 transition-colors ${selectedVoice === voice.name ? 'bg-cyan-600/30 ring-2 ring-cyan-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                            >
                              <div>
                                <p className="font-semibold">{voice.name} <span className="text-xs font-normal text-gray-400">{`(${voice.gender}, ${voice.age})`}</span></p>
                                <p className="text-xs text-gray-300">{voice.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                    <h2 className="mb-3 text-xl font-semibold text-cyan-400">Output</h2>
                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex h-full flex-col space-y-4">
                            <Button onClick={handleGenerateSSML} disabled={isLoading || !inputText}>
                                {isGeneratingSSML ? <><Loader /> Generating...</> : '🧠 Generate SSML'}
                            </Button>
                            <CodeBlock code={ssml} />
                        </div>
                        <div className="flex h-full flex-col space-y-4">
                            <Button onClick={handlePlayAudio} disabled={isLoading || (!inputText && !ssml)}>
                                {isPlaying ? <><Loader /> Playing...</> : <><PlayIcon className="mr-2 h-5 w-5" /> Play Audio</>}
                            </Button>
                            <div className="grid grid-cols-2 gap-4">
                               <Button onClick={handleSaveSSML} variant="secondary" disabled={isLoading || !ssml}>💾 Save SSML</Button>
                               <Button onClick={handleExportAudio} variant="secondary" disabled={isLoading || !base64Audio}>🔊 Export Audio</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <footer className="mt-8 border-t border-slate-800 py-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()}{' '}
          <a
            href="https://orcid.org/0009-0006-1923-4837"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cyan-500 transition-colors hover:text-cyan-400 hover:underline"
          >
            Thaidevint
          </a>
          . All rights reserved. Licensed under{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cyan-500 transition-colors hover:text-cyan-400 hover:underline"
          >
            CC BY-NC-SA 4.0
          </a>.
        </p>
        <button onClick={() => setIsReleaseNotesOpen(true)} className="mt-2 inline-flex items-center text-cyan-400 hover:underline">
            <InfoIcon className="mr-1 h-4 w-4" />
            Version {APP_VERSION} <span className="ml-2 text-gray-500">(Released: {RELEASE_TIMESTAMP})</span>
        </button>
      </footer>
      <ReleaseNotesModal isOpen={isReleaseNotesOpen} onClose={() => setIsReleaseNotesOpen(false)} />
    </div>
  );
}

export default App;