export interface ModelConfig {
  id: string;
  name: string;
  modelUrl: string;
  labelsUrl: string;
  input: {
    width: number;
    height: number;
    layout: 'NHWC' | 'NCHW';
    dataType: 'float32' | 'uint8' | 'int8';
    normalization:
      | { type: 'zero-to-one' }
      | { type: 'minus-one-to-one' }
      | { type: 'mean-std'; mean: number[]; std: number[] }
      | { type: 'none' };
  };
  output: {
    decoder: 'ssd' | 'yolo' | 'custom';
    tensorIndexes: Record<string, number>;
  };
  confidenceThreshold: number;
  iouThreshold: number;
  maxDetections: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  classId: number;
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface InferenceResult {
  detections: Detection[];
  inferenceTimeMs: number;
  preprocessTimeMs: number;
  postprocessTimeMs: number;
}

export interface PerformanceMetrics {
  runtimeInitMs: number;
  modelDownloadMs: number;
  modelCompileMs: number;
  lastInferenceMs: number;
  rollingMeanMs: number;
  fps: number;
  totalInferences: number;
  backend: 'webgpu' | 'wasm';
}

export type ModelStatus = 'unloaded' | 'loading' | 'compiling' | 'ready' | 'failed';

export interface InferenceEngine {
  initialize(): Promise<void>;
  loadModel(config: ModelConfig): Promise<void>;
  infer(input: ImageData | HTMLVideoElement): Promise<InferenceResult>;
  getBackend(): 'webgpu' | 'wasm';
  getStatus(): ModelStatus;
  getPerformanceMetrics(): PerformanceMetrics;
  dispose(): Promise<void>;
}

export interface AnalysisReport {
  schemaVersion: '1.0';
  createdAt: string;
  source: {
    type: 'image' | 'camera';
    width: number;
    height: number;
    filename?: string;
  };
  runtime: {
    backend: 'webgpu' | 'wasm';
    modelId: string;
    modelName: string;
    inferenceLatencyMs: number;
  };
  summary: {
    totalObjects: number;
    averageConfidence: number;
    estimatedOccupancy: number;
    estimatedEmptySpace: number;
    countsByClass: Record<string, number>;
  };
  detections: Array<{
    classId: number;
    label: string;
    confidence: number;
    boundingBox: BoundingBox;
  }>;
}

export interface ShelfSummary {
  totalObjects: number;
  countsByClass: Record<string, number>;
  averageConfidence: number;
  detectionDensity: number;
  estimatedOccupancy: number;
  estimatedEmptySpace: number;
}

export interface LetterboxInfo {
  scale: number;
  offsetX: number;
  offsetY: number;
  paddedWidth: number;
  paddedHeight: number;
}
