import { GoogleGenAI, Modality } from "@google/genai";

/**
 * Creates and returns a new GoogleGenAI client instance.
 * This function ensures that every API call uses the most current API key
 * available in the process environment, preventing issues with stale keys
 * that can lead to authentication failures misidentified as CORS errors.
 */
const getAiClient = () => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

const ssmlGenerationModel = 'gemini-2.5-flash';
const ttsModel = 'gemini-2.5-flash-preview-tts';

interface VoiceProfile {
    name: string;
    gender: string;
    age: string;
    description: string;
}

/**
 * Detects the primary language of the given text.
 * @param text The text to analyze.
 * @returns A promise that resolves to the name of the detected language.
 */
export const detectLanguage = async (text: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    Analyze the following text and identify its primary language. 
    Return ONLY the name of the language (e.g., "Sanskrit", "Hindi", "English"). 
    Do not add any other words, explanations, or formatting.

    Text to analyze:
    ---
    ${text}
    ---
  `;
  try {
    const response = await ai.models.generateContent({
        model: ssmlGenerationModel,
        contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error detecting language:", error);
    return "Unknown";
  }
};

/**
 * Generates an SSML script from text using the Gemini API, with custom guidance.
 * @param text The input text to convert.
 * @param guideText The user-provided guide for pronunciation.
 * @param vocalExpression The desired vocal expression (e.g., 'Speech', 'Chant').
 * @param tone The desired emotional tone (e.g., 'Calm', 'Energetic').
 * @param language The detected language of the input text.
 * @returns A promise that resolves to the generated SSML string.
 */
export const generateSSML = async (
  text: string,
  guideText: string,
  vocalExpression: string,
  tone: string,
  language: string,
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    You are an expert in phonology and Speech Synthesis Markup Language (SSML). 
    Your task is to convert the following text, identified as **${language}**, into a valid SSML script.
    Your primary goal is to produce nuanced, natural-sounding speech by strictly following the provided settings and guides.

    Input Text to Convert:
    ---
    ${text}
    ---

    Pronunciation Guide:
    ---
    ${guideText}
    ---

    **Core Instructions:**

    1.  **Phonetic Precision (Highest Priority)**:
        -   Carefully analyze the \`Pronunciation Guide\`.
        -   If the guide provides an International Phonetic Alphabet (IPA) transcription for a specific word (e.g., \`oṃ: /oːm/\`), you **MUST** wrap that word in a \`<phoneme>\` tag with the provided IPA. Example: \`<phoneme alphabet="ipa" ph="oːm">oṃ</phoneme>\`.
        -   If no IPA is provided, use standard pronunciation for the language.

    2.  **Dynamic Prosody Generation**:
        -   You **MUST** dynamically generate \`<prosody>\` tags (controlling rate, pitch, and volume) based on the combined effect of the \`Vocal Expression\` and \`Tone\` settings below.

        **Vocal Expression Setting: ${vocalExpression}**
        -   **Speech**: Apply default prosody for natural conversation. Use \`<prosody rate="medium">\`.
        -   **Chant**: Apply a rhythmic, steady pace. Use \`<prosody rate="slow">\` and maintain a relatively constant pitch contour. Use consistent \`<break time="300ms"/>\` between phrases to enhance rhythm.
        -   **Recitation**: Apply a deliberate, formal, and clear pace. Use \`<prosody rate="medium" pitch="medium">\` and insert meaningful pauses with \`<break time="500ms"/>\` at the end of lines or verses to respect the text's structure.

        **Tone Setting: ${tone}**
        -   **Standard / Age-appropriate**: Use default engine prosody. No major adjustments needed unless specified by the expression.
        -   **Calm / Meditative / Relaxed**: Combine with the expression's rate and apply \`<prosody volume="soft" pitch="low">\`. Slow the rate further if logical (e.g., \`rate="x-slow"\`).
        -   **Energetic / Motivational**: Use \`<prosody rate="fast" volume="loud" pitch="high">\`. Introduce more pitch variation within sentences.
        -   **Reverent**: Use \`<prosody rate="x-slow" volume="medium">\`. Employ longer, more significant pauses (\`<break time="800ms"/>\`) for dramatic effect.
        -   **Stylish**: Use more dynamic pitch contours and a slightly faster rate.

        **Combining Settings Example**: If \`Vocal Expression\` is 'Recitation' and \`Tone\` is 'Reverent', the SSML should reflect a very slow, deliberate, and formal reading with significant pauses.

    3.  **Structural Pauses**:
        -   Beyond prosody rules, use \`<break>\` tags to represent natural pauses, such as at the end of lines in poetry or between sentences.

    4.  **Final Output Rules**:
        -   The entire output **MUST** be wrapped in a single, root \`<speak>\` tag.
        -   The output **MUST** be only the raw SSML script. Do not include any explanations, comments, or markdown formatting like \`\`\`xml.

    Generate the SSML script now.
  `;

  try {
    const response = await ai.models.generateContent({
        model: ssmlGenerationModel,
        contents: prompt,
    });
    // Clean up the response to ensure it's valid XML/SSML
    let ssml = response.text.trim();
    if (ssml.startsWith('```xml')) {
        ssml = ssml.substring(7);
    }
    if (ssml.endsWith('```')) {
        ssml = ssml.substring(0, ssml.length - 3);
    }
    return ssml.trim();
  } catch (error) {
    console.error("Error generating SSML:", error);
    throw new Error("Failed to communicate with the Gemini API for SSML generation.");
  }
};


/**
 * Generates speech audio from an SSML script or plain text using the Gemini TTS API.
 * @param text The SSML script or plain text to synthesize.
 * @param voiceName The name of the pre-built voice to use for synthesis.
 * @returns A promise that resolves to the base64 encoded audio data string.
 */
export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
        model: ttsModel,
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("No audio data received from the API.");
    }
    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to communicate with the Gemini API for speech synthesis.");
  }
};

const researchResponseSchema = {
    type: 'OBJECT',
    properties: {
        guidance: {
            type: 'STRING',
            description: "A multi-line string with detailed pronunciation and rhythm instructions.",
        },
        voiceProfile: {
            type: 'OBJECT',
            properties: {
                sex: { type: 'STRING', description: "The speaker's gender. Must be 'Male' or 'Female'." },
                age: { type: 'STRING', description: "The speaker's age category. Must be one of: 'Child', 'Adult', 'Senior'." },
                occupation: { type: 'STRING', description: "e.g., Priest, Scholar, Storyteller" },
            },
            required: ["sex", "age", "occupation"],
        },
        recommendedVoice: {
            type: 'STRING',
            description: "The single best voice name from the provided list of available voices.",
        },
        recommendedVocalExpression: {
            type: 'STRING',
            description: "The single best vocal expression from the list: ['Speech', 'Chant', 'Recitation']",
        },
        recommendedTone: {
            type: 'STRING',
            description: "The single best tone/prosody from the list: ['Standard', 'Age-appropriate', 'Stylish', 'Calm', 'Meditative', 'Reverent', 'Relaxed', 'Energetic', 'Motivational']",
        },
        reasoning: {
            type: 'OBJECT',
            description: "An explanation for why the recommendations were made.",
            properties: {
                voice: { type: 'STRING', description: "Why the recommended voice is a good fit." },
                expression: { type: 'STRING', description: "Why the recommended vocal expression is suitable." },
                tone: { type: 'STRING', description: "Why the recommended tone is appropriate." },
            },
            required: ["voice", "expression", "tone"],
        }
    },
    required: ["guidance", "voiceProfile", "recommendedVoice", "recommendedVocalExpression", "recommendedTone", "reasoning"],
};


/**
 * Analyzes input text to recommend pronunciation and voice settings.
 * @param text The input text to analyze.
 * @param language The detected language of the input text.
 * @param availableVoices A list of voice profile objects the AI can choose from.
 * @returns A promise that resolves to an object with guidance and voice recommendations.
 */
export const performAiResearch = async (
    text: string, 
    language: string,
    availableVoices: VoiceProfile[]
): Promise<{
    guidance: string;
    voiceProfile: { sex: string; age: string; occupation: string; };
    recommendedVoice: string;
    recommendedVocalExpression: string;
    recommendedTone: string;
    reasoning: {
        voice: string;
        expression: string;
        tone: string;
    };
}> => {
    const ai = getAiClient();
    const voiceDescriptions = availableVoices.map(v => 
        `- ${v.name}: ${v.gender}, ${v.age}. ${v.description}`
    ).join('\n');

    const availableVoiceNames = availableVoices.map(v => v.name);
    const availableExpressionNames = ['Speech', 'Chant', 'Recitation'];

    const prompt = `
        You are an expert in linguistics, phonology, and Indic languages, particularly those using the Devanagari script.
        Analyze the provided text, identified as being in **${language}**, to determine its context, origin, and intended delivery style.
        Based on your analysis, provide recommendations for generating high-quality text-to-speech audio.

        Available Voices: [${availableVoiceNames.map(name => `'${name}'`).join(', ')}].
        Use the following detailed voice descriptions to make your choice:
        ${voiceDescriptions}
        
        Available Age Groups: ['Child', 'Adult', 'Senior']
        Available Vocal Expressions: [${availableExpressionNames.map(name => `'${name}'`).join(', ')}]
        Available Tones: ['Standard', 'Age-appropriate', 'Stylish', 'Calm', 'Meditative', 'Reverent', 'Relaxed', 'Energetic', 'Motivational']

        Your task is to populate a JSON object with the following information:
        1.  **guidance**: Create a detailed pronunciation guide for key or difficult words identified in the text. For each word, you **must** provide its pronunciation using the International Phonetic Alphabet (IPA) notation. For example, for "सूर्यः प्रकाशते", provide a guide like "सूर्यः (/suːɾ.jəh/), प्रकाशते (/pɾə.kɑː.ʃə.te/)". Focus on crucial aspects of Indic phonology like vowel length, aspiration (e.g., 'kh', 'gh'), and retroflex consonants (e.g., 'ṭ', 'ḍ').
        2.  **voiceProfile**: Define an ideal speaker profile (Sex, Age, Occupation).
        3.  **recommendedVoice**: Choose the ONE best voice from the available list that matches the profile.
        4.  **recommendedVocalExpression**: Choose the ONE most appropriate vocal expression.
        5.  **recommendedTone**: Choose the ONE most appropriate tone.
        6.  **reasoning**: This is critical. Provide a detailed, specific explanation for your choices.
            -   **reasoning.voice**: Explain why the chosen voice's characteristics (e.g., 'deep and resonant') are a perfect fit for the text's subject matter.
            -   **reasoning.expression**: Justify your choice by referencing the text's structure. For example: "The text is a religious verse, structured with a clear rhythm, making 'Recitation' a more fitting style than conversational 'Speech'."
            -   **reasoning.tone**: Justify your choice by referencing the text's content. For example: "The phrase 'सूर्यः प्रकाशते' (The sun shines) contains powerful and bright imagery, so an 'Energetic' tone is recommended to match this feeling."

        Input Text to Analyze:
        ---
        ${text}
        ---

        Return your response ONLY as a JSON object that conforms to the provided schema. Every field, especially the 'reasoning' object, must be fully populated with detailed, context-aware explanations.
    `;
    try {
        const response = await ai.models.generateContent({
            model: ssmlGenerationModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: researchResponseSchema,
            },
        });

        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error performing AI research:", error);
        throw new Error("Failed to communicate with the Gemini API for AI research.");
    }
};