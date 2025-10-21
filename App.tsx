import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TextAreaInput } from './components/TextAreaInput';
import { Button } from './components/Button';
import { CodeBlock } from './components/CodeBlock';
import { Loader } from './components/Loader';
import { SpellGuide } from './components/SpellGuide';
import { AiResearchReport } from './components/AiResearchReport';
import { generateSSML, generateSpeech, performAiResearch, detectLanguage } from './services/geminiService';
import { playAudio, createWavBlob } from './utils/audioUtils';
import { PlayIcon } from './components/PlayIcon';
import { SelectionCard } from './components/SelectionCard';
import { SpeechIcon } from './components/SpeechIcon';
import { ChantIcon } from './components/ChantIcon';
import { RecitationIcon } from './components/RecitationIcon';
import { ErrorAlert } from './components/ErrorAlert';

const DEFAULT_INPUT = `नमस्ते (namaste)
धन्यवाद (dhanyavād)
सूर्यः प्रकाशते (sūryaḥ prakāśate)`;

const DEFAULT_GUIDE_TEXT = `// Provide pronunciation guidance for the AI.
// Use phonetics or descriptive language.
// Example for "oṃ śāntiḥ":

oṃ: Pronounce as a long "om" sound, with the "m" resonating.
śāntiḥ:
- śā: Pronounce 'sha' with a long 'a' vowel sound (like in "father").
- ntiḥ: Pronounce 'n' and 't' clearly, followed by a short 'i' and a final breathy 'h' sound (visarga).
`;

const VOICES = [
    { name: 'Kore', gender: 'Female', age: 'Adult', description: 'A clear and versatile female voice, ideal for standard speech.' },
    { name: 'Puck', gender: 'Male', age: 'Adult', description: 'A deep and resonant male voice, great for authoritative narration.' },
    { name: 'Charon', gender: 'Male', age: 'Senior', description: 'An older, gravelly male voice, perfect for storytelling.' },
    { name: 'Fenrir', gender: 'Male', age: 'Adult', description: 'A powerful and epic male voice, suited for dramatic content.' },
    { name: 'Zephyr', gender: 'Female', age: 'Adult', description: 'A gentle and soothing female voice, excellent for calm or meditative text.' },
];
const VOCAL_EXPRESSIONS = [
    { name: 'Speech', icon: SpeechIcon },
    { name: 'Chant', icon: ChantIcon },
    { name: 'Recitation', icon: RecitationIcon }
];
const TONES = ['Standard', 'Age-appropriate', 'Stylish', 'Calm', 'Meditative', 'Reverent', 'Relaxed', 'Energetic', 'Motivational'];

const APP_VERSION = '1.8.1';


interface AiResearchReportData {
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
}

/**
 * Validates an SSML string for basic syntax and structure.
 * @param ssml The SSML string to validate.
 * @returns An object with `isValid` boolean and an error `message` string.
 */
const validateSSML = (ssml: string): { isValid: boolean; message: string | null } => {
  if (!ssml || !ssml.trim()) {
    return { isValid: false, message: 'SSML script is empty.' };
  }
  
  const trimmedSsml = ssml.trim();
  if (!trimmedSsml.startsWith('<speak>') || !trimmedSsml.endsWith('</speak>')) {
    return { isValid: false, message: 'SSML must be wrapped in a single <speak> tag.' };
  }

  // Use the browser's built-in parser to check for well-formed XML
  const parser = new DOMParser();
  const doc = parser.parseFromString(ssml, 'application/xml');

  // The parser creates a <parsererror> element if there's a syntax error
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    const errorMessage = parserError.textContent?.split('\n')[0] || 'Invalid SSML syntax. Check for unclosed tags or invalid characters.';
    return { isValid: false, message: errorMessage };
  }
  
  if (doc.documentElement.tagName.toLowerCase() !== 'speak') {
       return { isValid: false, message: 'The root element of the SSML script must be <speak>.' };
  }

  return { isValid: true, message: null };
};


export default function App() {
  const [inputText, setInputText] = useState<string>(DEFAULT_INPUT);
  const [guideText, setGuideText] = useState<string>(DEFAULT_GUIDE_TEXT);
  const [ssmlOutput, setSsmlOutput] = useState<string>('');
  const [audioData, setAudioData] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [vocalExpression, setVocalExpression] = useState<string>('Speech');
  const [tone, setTone] = useState<string>('Standard');
  const [showSpellGuide, setShowSpellGuide] = useState<boolean>(false);
  const [isLoadingSSML, setIsLoadingSSML] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [isLoadingResearch, setIsLoadingResearch] = useState<boolean>(false);
  const [loadingSampleVoice, setLoadingSampleVoice] = useState<string | null>(null);
  const [aiResearchReport, setAiResearchReport] = useState<AiResearchReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceSampleError, setVoiceSampleError] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  
  const isInitialMount = useRef(true);
  
  const selectedVoiceDetails = VOICES.find(v => v.name === selectedVoice) || VOICES[0];
  
  const balancedVoices = useMemo(() => {
    const maleVoices = VOICES.filter(v => v.gender === 'Male');
    const femaleVoices = VOICES.filter(v => v.gender === 'Female');
    const minCount = Math.min(maleVoices.length, femaleVoices.length);
    const reorderedVoices = [];

    for (let i = 0; i < minCount; i++) {
        reorderedVoices.push(femaleVoices[i]);
        reorderedVoices.push(maleVoices[i]);
    }
    
    const remainingVoices = maleVoices.length > femaleVoices.length 
        ? maleVoices.slice(minCount) 
        : femaleVoices.slice(minCount);
        
    return reorderedVoices.concat(remainingVoices);
  }, []);

  useEffect(() => {
    // This effect ensures that if a user changes settings that affect the SSML (expression, tone),
    // the outdated SSML and audio are cleared. This forces them to regenerate the SSML,
    // preventing a mismatch between the visible settings and the generated audio.
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      setSsmlOutput('');
      setAudioData(null);
    }
  }, [vocalExpression, tone]);

  const handleGenerateSSML = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Input text cannot be empty.');
      return;
    }
    setIsLoadingSSML(true);
    setError(null);
    setSsmlOutput('');
    setAudioData(null);
    try {
      const lang = await detectLanguage(inputText);
      setDetectedLanguage(lang);
      const result = await generateSSML(inputText, guideText, vocalExpression, tone, lang);
      setSsmlOutput(result);
    } catch (e) {
      console.error(e);
      setError('Failed to generate SSML. Please check your input and try again.');
    } finally {
      setIsLoadingSSML(false);
    }
  }, [inputText, guideText, vocalExpression, tone]);

  const handlePlayAudio = useCallback(async () => {
    const validation = validateSSML(ssmlOutput);
    if (!validation.isValid) {
      setError(`SSML Validation Error: ${validation.message}`);
      return;
    }
    
    setIsLoadingAudio(true);
    setError(null);
    try {
      const newAudioData = await generateSpeech(ssmlOutput, selectedVoice);
      setAudioData(newAudioData);
      await playAudio(newAudioData);
    } catch (e) {
      console.error(e);
      setError('Failed to generate or play audio. The API may have rejected the SSML.');
    } finally {
      setIsLoadingAudio(false);
    }
  }, [ssmlOutput, selectedVoice]);
  
  const handleAiResearch = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Input text cannot be empty for research.');
      return;
    }
    setIsLoadingResearch(true);
    setError(null);
    setAiResearchReport(null);
    try {
      const lang = await detectLanguage(inputText);
      setDetectedLanguage(lang);
      const result = await performAiResearch(inputText, lang, VOICES);
       const voiceNames = VOICES.map(v => v.name);
       const expressionNames = VOCAL_EXPRESSIONS.map(e => e.name);
       if (
            result &&
            voiceNames.includes(result.recommendedVoice) &&
            expressionNames.includes(result.recommendedVocalExpression) &&
            TONES.includes(result.recommendedTone) &&
            result.reasoning &&
            typeof result.reasoning.voice === 'string' &&
            typeof result.reasoning.expression === 'string' &&
            typeof result.reasoning.tone === 'string'
        ) {
            setAiResearchReport(result);
        } else {
            throw new Error("Received invalid or incomplete research data from AI.");
        }
    } catch (e) {
      console.error(e);
      setError('Failed to perform AI research. Please try again.');
    } finally {
      setIsLoadingResearch(false);
    }
  }, [inputText]);
  
  const handlePlayVoiceSample = useCallback(async (voice: string) => {
    setLoadingSampleVoice(voice);
    setVoiceSampleError(null);
    setError(null);
    const sampleText = "This is a sample of my voice.";
    try {
      const audioData = await generateSpeech(sampleText, voice);
      await playAudio(audioData);
    } catch (e) {
      console.error(e);
      setVoiceSampleError(`Failed to play sample for ${voice}.`);
    } finally {
      setLoadingSampleVoice(null);
    }
  }, []);

  const handleApplySuggestions = () => {
    if (!aiResearchReport) return;
    setGuideText(aiResearchReport.guidance);
    setSelectedVoice(aiResearchReport.recommendedVoice);
    setVocalExpression(aiResearchReport.recommendedVocalExpression);
    setTone(aiResearchReport.recommendedTone);
    setAiResearchReport(null); // Hide report after applying
  };
  
  const handleDismissReport = () => {
    setAiResearchReport(null);
  };
  
  const handleDismissError = () => {
    setError(null);
  };

  const handleExportAudio = () => {
    if (!audioData) {
      setError('No audio data available to export.');
      return;
    }
    try {
      const blob = createWavBlob(audioData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'speech.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError('Failed to create audio file for export.');
    }
  };
  
  const handleSaveSSML = () => {
    if (!ssmlOutput.trim()) {
      setError('No SSML script available to save.');
      return;
    }
    try {
      const blob = new Blob([ssmlOutput], { type: 'application/ssml+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'script.ssml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError('Failed to create SSML file for download.');
    }
  };
  
  const handleClearInput = () => setInputText('');
  const handleResetInput = () => setInputText(DEFAULT_INPUT);


  const isProcessing = isLoadingSSML || isLoadingAudio || isLoadingResearch || !!loadingSampleVoice;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-gray-200">
      <Header />
      <main className="container mx-auto flex-grow px-4 py-8">
        {error && (
          <ErrorAlert message={error} onDismiss={handleDismissError} />
        )}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Input Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-semibold text-cyan-400">Input Text & Guide</h2>
               <div className="flex items-center space-x-4">
                 <button onClick={handleResetInput} className="text-sm text-slate-400 transition-colors hover:text-white hover:underline focus:outline-none">Reset</button>
                 <button onClick={handleClearInput} className="text-sm text-slate-400 transition-colors hover:text-white hover:underline focus:outline-none">Clear</button>
                 <button
                    onClick={() => setShowSpellGuide(!showSpellGuide)}
                    className="text-sm text-cyan-400 transition-colors hover:text-cyan-300 hover:underline focus:outline-none"
                  >
                    {showSpellGuide ? 'Hide Guide' : 'Show Guide'}
                  </button>
               </div>
            </div>
            
            <div className={`grid gap-4 ${showSpellGuide ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {showSpellGuide && (
                    <SpellGuide
                        value={guideText}
                        onChange={(e) => setGuideText(e.target.value)}
                        disabled={isProcessing}
                    />
                )}
                <div className={!showSpellGuide ? 'col-span-1 md:col-span-2' : ''}>
                  <TextAreaInput
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g., नमस्ते (namaste)"
                    rows={12}
                    disabled={isProcessing}
                    aria-label="Input text for SSML generation"
                  />
                </div>
            </div>
            
             {detectedLanguage && (
                <p className="text-sm text-slate-400">Detected Language: <span className="font-semibold text-slate-300">{detectedLanguage}</span></p>
             )}

             {aiResearchReport && (
              <>
                <AiResearchReport 
                  report={aiResearchReport} 
                  onDismiss={handleDismissReport} 
                />
                <div className="mt-4 flex justify-end">
                  <div className="w-full sm:w-auto">
                    <Button onClick={handleApplySuggestions}>
                      Apply Suggestions
                    </Button>
                  </div>
                </div>
              </>
            )}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button onClick={handleAiResearch} disabled={isProcessing || !inputText.trim()} variant="secondary">
                    {isLoadingResearch ? <Loader /> : 'AI Fast Research'}
                </Button>
                <Button onClick={handleGenerateSSML} disabled={isProcessing || !inputText.trim()}>
                    {isLoadingSSML ? <Loader /> : 'Generate SSML'}
                </Button>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold text-cyan-400">Generated SSML & Audio</h2>
            <CodeBlock code={ssmlOutput} />
            <div className="space-y-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              
              {/* Vocal Expression & Tone */}
              <div className="space-y-4">
                 <div>
                    <label className="mb-3 block text-sm font-medium text-gray-400">Vocal Expression</label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {VOCAL_EXPRESSIONS.map((exp) => (
                        <SelectionCard
                          key={exp.name}
                          label={exp.name}
                          icon={<exp.icon className="mb-2 h-6 w-6" />}
                          isSelected={vocalExpression === exp.name}
                          onClick={() => setVocalExpression(exp.name)}
                          disabled={isProcessing}
                        />
                      ))}
                    </div>
                 </div>
                 <div>
                    <label className="mb-3 block text-sm font-medium text-gray-400">Tone / Prosody</label>
                    <div className="flex flex-wrap gap-2">
                        {TONES.map((t) => (
                          <button
                            key={t}
                            onClick={() => setTone(t)}
                            disabled={isProcessing}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-50
                              ${tone === t 
                                ? 'bg-cyan-600 text-white' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`
                            }
                          >
                            {t}
                          </button>
                        ))}
                    </div>
                 </div>
              </div>


              <fieldset>
                <legend className="mb-2 block text-sm font-medium text-gray-400">
                  Select Voice
                </legend>
                <div className="space-y-2">
                  {balancedVoices.map((voice) => (
                    <div key={voice.name} className="flex items-center justify-between rounded-lg bg-slate-700/50 px-3 py-2 transition-colors hover:bg-slate-700">
                      <div className="flex items-center">
                        <input
                          id={`voice-${voice.name}`}
                          name="voice-selection"
                          type="radio"
                          value={voice.name}
                          checked={selectedVoice === voice.name}
                          onChange={() => setSelectedVoice(voice.name)}
                          disabled={isProcessing}
                          className="h-4 w-4 border-gray-500 bg-slate-600 text-cyan-600 focus:ring-cyan-500"
                        />
                        <label htmlFor={`voice-${voice.name}`} className="ml-3 block text-sm font-medium text-gray-300">
                          {voice.name} <span className="text-gray-400">({voice.gender}, {voice.age})</span>
                        </label>
                      </div>
                      <button
                        onClick={() => handlePlayVoiceSample(voice.name)}
                        disabled={isProcessing}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-600 text-white transition-colors hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:opacity-70"
                        aria-label={`Play sample for ${voice.name} voice`}
                      >
                        {loadingSampleVoice === voice.name ? <Loader /> : <PlayIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  ))}
                </div>
                {voiceSampleError && <p className="mt-2 text-xs text-red-400">{voiceSampleError}</p>}
                 {selectedVoiceDetails && (
                    <div className="mt-2 rounded-md bg-slate-700/50 p-2 text-xs text-slate-300">
                        <p><span className="font-semibold text-slate-200">Description:</span> {selectedVoiceDetails.description}</p>
                    </div>
                )}
              </fieldset>

              <div className="flex flex-wrap gap-4">
                <Button onClick={handlePlayAudio} disabled={isProcessing || !ssmlOutput.trim()}>
                  {isLoadingAudio ? <Loader /> : 'Play Audio'}
                </Button>
                <Button onClick={handleSaveSSML} disabled={!ssmlOutput.trim()} variant="secondary">
                  Save SSML
                </Button>
                <Button onClick={handleExportAudio} disabled={!audioData} variant="secondary">
                  Export Audio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-slate-500">
        <p>
          &copy; 2025 Thaidevint -{' '}
          <a href="https://orcid.org/0009-0006-1923-4837" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline">
            View ORCID Profile
          </a>
        </p>
        <p className="mt-1">Version {APP_VERSION}</p>
      </footer>
    </div>
  );
}