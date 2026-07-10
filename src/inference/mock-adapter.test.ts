import { describe, it, expect } from 'vitest';
import { MockInferenceEngine } from './mock-adapter';
import { DEFAULT_MODEL_CONFIG } from './model-config';

function createMockImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  return { data, width, height, colorSpace: 'srgb' } as ImageData;
}

describe('MockInferenceEngine', () => {
  it('initializes and loads model', async () => {
    const engine = new MockInferenceEngine();
    expect(engine.getStatus()).toBe('unloaded');

    await engine.initialize();
    await engine.loadModel(DEFAULT_MODEL_CONFIG);

    expect(engine.getStatus()).toBe('ready');
    expect(engine.getBackend()).toBe('wasm');
  });

  it('returns detections from infer', async () => {
    const engine = new MockInferenceEngine();
    await engine.initialize();
    await engine.loadModel(DEFAULT_MODEL_CONFIG);

    const imageData = createMockImageData(640, 480);
    const result = await engine.infer(imageData);
    expect(result.detections.length).toBeGreaterThan(0);
    expect(result.inferenceTimeMs).toBeGreaterThan(0);
  });

  it('throws when inferring before model is ready', async () => {
    const engine = new MockInferenceEngine();
    const imageData = createMockImageData(100, 100);
    await expect(engine.infer(imageData)).rejects.toThrow('Model not ready');
  });

  it('tracks performance metrics', async () => {
    const engine = new MockInferenceEngine();
    await engine.initialize();
    await engine.loadModel(DEFAULT_MODEL_CONFIG);

    const metrics = engine.getPerformanceMetrics();
    expect(metrics.runtimeInitMs).toBeGreaterThan(0);
    expect(metrics.modelDownloadMs).toBeGreaterThan(0);
    expect(metrics.modelCompileMs).toBeGreaterThan(0);
    expect(metrics.backend).toBe('wasm');
  });

  it('disposes cleanly', async () => {
    const engine = new MockInferenceEngine();
    await engine.initialize();
    await engine.loadModel(DEFAULT_MODEL_CONFIG);
    await engine.dispose();

    expect(engine.getStatus()).toBe('unloaded');
  });
});
