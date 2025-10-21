
// Utility functions for handling raw audio data from Gemini API

/**
 * Decodes a base64 string into a Uint8Array of bytes.
 * @param base64 The base64 encoded string.
 * @returns A Uint8Array containing the decoded bytes.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer that can be played.
 * @param data The raw audio data as a Uint8Array.
 * @param ctx The AudioContext to use for creating the buffer.
 * @param sampleRate The sample rate of the audio (e.g., 24000 for Gemini TTS).
 * @param numChannels The number of audio channels (typically 1 for mono).
 * @returns A promise that resolves to an AudioBuffer.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // The raw data is 16-bit PCM, so we create an Int16Array view on the buffer
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize the 16-bit integer samples to floating-point values between -1.0 and 1.0
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


/**
 * Plays the base64 encoded audio data.
 * @param base64Audio The base64 string of the raw audio data.
 */
export const playAudio = async (base64Audio: string): Promise<void> => {
    // The Gemini TTS model returns audio at a 24000 sample rate
    const SAMPLE_RATE = 24000;
    const NUM_CHANNELS = 1;

    // Use the modern AudioContext constructor with fallback
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
        throw new Error("Browser does not support AudioContext.");
    }
    const outputAudioContext = new AudioContext({ sampleRate: SAMPLE_RATE });

    const decodedBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decodedBytes, outputAudioContext, SAMPLE_RATE, NUM_CHANNELS);
    
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
};


/**
 * Helper function to write a string to a DataView.
 * @param view The DataView to write to.
 * @param offset The offset to start writing at.
 * @param string The string to write.
 */
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Creates a WAV file Blob from base64 encoded raw PCM audio data.
 * @param base64Audio The base64 string of the raw audio data.
 * @returns A Blob representing the WAV file.
 */
export const createWavBlob = (base64Audio: string): Blob => {
    const SAMPLE_RATE = 24000;
    const NUM_CHANNELS = 1;
    const BITS_PER_SAMPLE = 16;

    const pcmData = decode(base64Audio);
    const dataSize = pcmData.length;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // chunkSize
    writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // audioFormat (1 for PCM)
    view.setUint16(22, NUM_CHANNELS, true); // numChannels
    view.setUint32(24, SAMPLE_RATE, true); // sampleRate
    const byteRate = SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
    view.setUint32(28, byteRate, true); // byteRate
    const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
    view.setUint16(32, blockAlign, true); // blockAlign
    view.setUint16(34, BITS_PER_SAMPLE, true); // bitsPerSample

    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true); // subchunk2Size

    // Write PCM data to the rest of the buffer
    const wavBuffer = new Uint8Array(buffer);
    wavBuffer.set(pcmData, 44);

    return new Blob([wavBuffer], { type: 'audio/wav' });
};
