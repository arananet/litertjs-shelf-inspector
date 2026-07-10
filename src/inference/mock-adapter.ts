import type {
  InferenceEngine,
  ModelConfig,
  InferenceResult,
  PerformanceMetrics,
  ModelStatus,
  Detection,
} from './types';

const MOCK_LABELS = [
  'bottle', 'can', 'box', 'jar', 'bag', 'carton', 'tube', 'container',
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateMockDetections(width: number, height: number): Detection[] {
  const count = Math.floor(randomBetween(3, 8));
  const detections: Detection[] = [];

  for (let i = 0; i < count; i++) {
    const bw = randomBetween(40, width * 0.2);
    const bh = randomBetween(60, height * 0.3);
    detections.push({
      classId: Math.floor(Math.random() * MOCK_LABELS.length),
      label: MOCK_LABELS[Math.floor(Math.random() * MOCK_LABELS.length)],
      confidence: randomBetween(0.5, 0.98),
      boundingBox: {
        x: randomBetween(0, width - bw),
        y: randomBetween(0, height - bh),
        width: bw,
        height: bh,
      },
    });
  }

  return detections;
}

export class MockInferenceEngine implements InferenceEngine {
  private status: ModelStatus = 'unloaded';
  private initTime = 0;
  private downloadTime = 0;
  private compileTime = 0;
  private inferenceTimes: number[] = [];

  async initialize(): Promise<void> {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 100));
    this.initTime = performance.now() - start;
  }

  async loadModel(_config: ModelConfig): Promise<void> {
    this.status = 'loading';

    const dlStart = performance.now();
    await new Promise((r) => setTimeout(r, 200));
    this.downloadTime = performance.now() - dlStart;

    this.status = 'compiling';
    const compStart = performance.now();
    await new Promise((r) => setTimeout(r, 150));
    this.compileTime = performance.now() - compStart;

    this.status = 'ready';
  }

  async infer(input: ImageData | HTMLVideoElement): Promise<InferenceResult> {
    if (this.status !== 'ready') {
      throw new Error('Model not ready');
    }

    const isVideo = 'videoWidth' in input;
    const width = isVideo ? (input as HTMLVideoElement).videoWidth : (input as ImageData).width;
    const height = isVideo ? (input as HTMLVideoElement).videoHeight : (input as ImageData).height;

    const preStart = performance.now();
    await new Promise((r) => setTimeout(r, 5));
    const preprocessTimeMs = performance.now() - preStart;

    const infStart = performance.now();
    await new Promise((r) => setTimeout(r, randomBetween(15, 40)));
    const inferenceTimeMs = performance.now() - infStart;

    const postStart = performance.now();
    const detections = generateMockDetections(width, height);
    const postprocessTimeMs = performance.now() - postStart;

    this.inferenceTimes.push(inferenceTimeMs);
    if (this.inferenceTimes.length > 30) {
      this.inferenceTimes.shift();
    }

    return { detections, inferenceTimeMs, preprocessTimeMs, postprocessTimeMs };
  }

  getBackend(): 'webgpu' | 'wasm' {
    return 'wasm';
  }

  getStatus(): ModelStatus {
    return this.status;
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const times = this.inferenceTimes;
    const mean = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const last = times.length > 0 ? times[times.length - 1] : 0;
    return {
      runtimeInitMs: this.initTime,
      modelDownloadMs: this.downloadTime,
      modelCompileMs: this.compileTime,
      lastInferenceMs: last,
      rollingMeanMs: mean,
      fps: mean > 0 ? 1000 / mean : 0,
      totalInferences: times.length,
      backend: 'wasm',
    };
  }

  async dispose(): Promise<void> {
    this.status = 'unloaded';
    this.inferenceTimes = [];
  }
}
