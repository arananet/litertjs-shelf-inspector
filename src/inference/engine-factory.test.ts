import { describe, it, expect } from 'vitest';
import { createInferenceEngine } from './engine-factory';
import { MockInferenceEngine } from './mock-adapter';

describe('createInferenceEngine', () => {
  it('creates a mock engine when type is mock', async () => {
    const engine = await createInferenceEngine('mock');
    expect(engine).toBeInstanceOf(MockInferenceEngine);
  });

  it('returns an engine with the InferenceEngine interface when type is litert', async () => {
    const engine = await createInferenceEngine('litert');
    expect(engine).toBeDefined();
    expect(typeof engine.initialize).toBe('function');
    expect(typeof engine.loadModel).toBe('function');
    expect(typeof engine.infer).toBe('function');
    expect(typeof engine.getBackend).toBe('function');
    expect(typeof engine.getStatus).toBe('function');
    expect(typeof engine.dispose).toBe('function');
  });
});
