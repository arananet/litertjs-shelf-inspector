import type { InferenceEngine } from './types';
import { MockInferenceEngine } from './mock-adapter';

export type EngineType = 'litert' | 'mock';

export async function createInferenceEngine(type: EngineType): Promise<InferenceEngine> {
  if (type === 'mock') {
    return new MockInferenceEngine();
  }

  try {
    const { LiteRtInferenceEngine } = await import('./litert-adapter');
    return new LiteRtInferenceEngine();
  } catch {
    console.warn('LiteRT.js not available, falling back to mock engine');
    return new MockInferenceEngine();
  }
}

export async function detectBestEngine(): Promise<EngineType> {
  try {
    const response = await fetch('/models/detector.tflite', { method: 'HEAD' });
    if (!response.ok) return 'mock';
    return 'litert';
  } catch {
    return 'mock';
  }
}
