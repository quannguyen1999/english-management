/**
 * Convert Float32Array mono audio (e.g. from @ricky0123/vad at 16kHz) to WAV Blob
 * for OpenAI Whisper API.
 */
const SAMPLE_RATE = 16000;

export function float32ToWavBlob(samples: Float32Array): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const dataLength = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size (16 for PCM)
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * numChannels * bytesPerSample, true); // byte rate
  view.setUint16(32, numChannels * bytesPerSample, true); // block align
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // PCM 16-bit LE from float [-1, 1]
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(44 + i * 2, int16, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
