import type { ModelConfig } from './types';

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  id: 'ssd-mobilenet-v2',
  name: 'SSD MobileNet V2',
  modelUrl: '/models/detector.tflite',
  labelsUrl: '/models/labels.txt',
  input: {
    width: 300,
    height: 300,
    layout: 'NHWC',
    dataType: 'float32',
    normalization: { type: 'zero-to-one' },
  },
  output: {
    decoder: 'ssd',
    tensorIndexes: {
      boxes: 0,
      classes: 1,
      scores: 2,
      count: 3,
    },
  },
  confidenceThreshold: 0.5,
  iouThreshold: 0.5,
  maxDetections: 20,
};

export function validateModelConfig(config: unknown): config is ModelConfig {
  if (!config || typeof config !== 'object') return false;
  const c = config as Record<string, unknown>;

  if (typeof c.id !== 'string' || !c.id) return false;
  if (typeof c.name !== 'string' || !c.name) return false;
  if (typeof c.modelUrl !== 'string' || !c.modelUrl) return false;
  if (typeof c.labelsUrl !== 'string') return false;

  const input = c.input as Record<string, unknown> | undefined;
  if (!input || typeof input !== 'object') return false;
  if (typeof input.width !== 'number' || input.width <= 0) return false;
  if (typeof input.height !== 'number' || input.height <= 0) return false;
  if (input.layout !== 'NHWC' && input.layout !== 'NCHW') return false;
  if (!['float32', 'uint8', 'int8'].includes(input.dataType as string)) return false;

  const norm = input.normalization as Record<string, unknown> | undefined;
  if (!norm || typeof norm !== 'object') return false;
  if (!['zero-to-one', 'minus-one-to-one', 'mean-std', 'none'].includes(norm.type as string))
    return false;

  const output = c.output as Record<string, unknown> | undefined;
  if (!output || typeof output !== 'object') return false;
  if (!['ssd', 'yolo', 'custom'].includes(output.decoder as string)) return false;

  if (typeof c.confidenceThreshold !== 'number') return false;
  if (typeof c.iouThreshold !== 'number') return false;
  if (typeof c.maxDetections !== 'number') return false;

  return true;
}
