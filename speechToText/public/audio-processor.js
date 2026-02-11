// AudioWorklet processor for real-time audio chunk capture
// Outputs chunks at 16kHz: 10ms=160, 20ms=320, 100ms=1600 samples
// Includes Voice Activity Detection (VAD) to filter silent segments

const SAMPLE_RATE_16K = 16000;
const CHUNK_CONFIG = {
  10: 160,   // 10ms → 160 samples
  20: 320,   // 20ms → 320 samples
  100: 1600, // 100ms → 1600 samples
};

class AudioChunkProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const chunkMs = options.processorOptions?.chunkMs ?? 20;
    this.targetSamples = CHUNK_CONFIG[chunkMs] ?? 320;
    this.buffer = [];
    this.vadThreshold = options.processorOptions?.vadThreshold ?? 0.01;
  }

  // Downsample from context sample rate (typically 48000) to 16kHz
  downsampleTo16k(inputData) {
    const contextSampleRate = sampleRate;
    const ratio = contextSampleRate / SAMPLE_RATE_16K;
    const outputLength = Math.floor(inputData.length / ratio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, inputData.length - 1);
      const t = srcIndex - srcIndexFloor;
      output[i] = inputData[srcIndexFloor] * (1 - t) + inputData[srcIndexCeil] * t;
    }
    return output;
  }

  // Simple RMS-based Voice Activity Detection
  computeRMS(samples) {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

  process(inputs, _outputs, _parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];
    const downsampled = this.downsampleTo16k(channelData);
    this.buffer.push(...downsampled);

    while (this.buffer.length >= this.targetSamples) {
      const chunk = this.buffer.splice(0, this.targetSamples);
      const rms = this.computeRMS(chunk);

      // Only emit non-silent chunks (VAD)
      if (rms >= this.vadThreshold) {
        const chunkMs = (this.targetSamples / SAMPLE_RATE_16K) * 1000;
        this.port.postMessage({
          type: "chunk",
          samples: this.targetSamples,
          durationMs: Math.round(chunkMs),
          rms,
          data: chunk,
        });
      }
    }

    return true;
  }
}

registerProcessor("audio-chunk-processor", AudioChunkProcessor);
