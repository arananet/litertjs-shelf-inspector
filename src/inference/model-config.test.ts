import { describe, it, expect } from 'vitest';
import { validateModelConfig, DEFAULT_MODEL_CONFIG } from './model-config';

describe('validateModelConfig', () => {
  it('accepts a valid config', () => {
    expect(validateModelConfig(DEFAULT_MODEL_CONFIG)).toBe(true);
  });

  it('rejects null', () => {
    expect(validateModelConfig(null)).toBe(false);
  });

  it('rejects missing id', () => {
    expect(validateModelConfig({ ...DEFAULT_MODEL_CONFIG, id: '' })).toBe(false);
  });

  it('rejects invalid input layout', () => {
    const bad = {
      ...DEFAULT_MODEL_CONFIG,
      input: { ...DEFAULT_MODEL_CONFIG.input, layout: 'INVALID' },
    };
    expect(validateModelConfig(bad)).toBe(false);
  });

  it('rejects invalid dataType', () => {
    const bad = {
      ...DEFAULT_MODEL_CONFIG,
      input: { ...DEFAULT_MODEL_CONFIG.input, dataType: 'float16' },
    };
    expect(validateModelConfig(bad)).toBe(false);
  });

  it('rejects invalid decoder', () => {
    const bad = {
      ...DEFAULT_MODEL_CONFIG,
      output: { ...DEFAULT_MODEL_CONFIG.output, decoder: 'invalid' },
    };
    expect(validateModelConfig(bad)).toBe(false);
  });

  it('rejects negative input dimensions', () => {
    const bad = {
      ...DEFAULT_MODEL_CONFIG,
      input: { ...DEFAULT_MODEL_CONFIG.input, width: -1 },
    };
    expect(validateModelConfig(bad)).toBe(false);
  });

  it('rejects non-object input', () => {
    expect(validateModelConfig('string')).toBe(false);
    expect(validateModelConfig(42)).toBe(false);
    expect(validateModelConfig(undefined)).toBe(false);
  });
});
