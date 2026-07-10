import type {
  InferenceEngine,
  ModelConfig,
  InferenceResult,
  PerformanceMetrics,
  ModelStatus,
} from './types';
import { preprocessImage } from './preprocess';
import { decodeSSD } from './postprocess/ssd-decoder';
import { decodeYOLO } from './postprocess/yolo-decoder';
import { nonMaxSuppression } from './postprocess/nms';

export class LiteRtInferenceEngine implements InferenceEngine {
  private status: ModelStatus = 'unloaded';
  private config: ModelConfig | null = null;
  private labels: string[] = [];
  private backend: 'webgpu' | 'wasm' = 'wasm';
  private liteRt: unknown = null;
  private model: unknown = null;
  private initTime = 0;
  private downloadTime = 0;
  private compileTime = 0;
  private inferenceTimes: number[] = [];

  async initialize(): Promise<void> {
    const start = performance.now();
    try {
      // Dynamic import — the package may not be installed
      const moduleName = '@litertjs/core';
      const mod = await import(/* @vite-ignore */ moduleName);
      const loadLiteRt = mod.loadLiteRt || mod.default?.loadLiteRt;
      if (!loadLiteRt) throw new Error('loadLiteRt not found in @litertjs/core');
      this.liteRt = await loadLiteRt();
    } catch {
      throw new Error(
        'Failed to initialize LiteRT.js runtime. Ensure @litertjs/core is installed.',
      );
    }
    this.initTime = performance.now() - start;
  }

  async loadModel(config: ModelConfig): Promise<void> {
    this.config = config;
    this.status = 'loading';

    try {
      const dlStart = performance.now();
      const [modelResponse, labelsResponse] = await Promise.all([
        fetch(config.modelUrl),
        config.labelsUrl ? fetch(config.labelsUrl) : Promise.resolve(null),
      ]);

      if (!modelResponse.ok) {
        throw new Error(`Failed to download model: ${modelResponse.status}`);
      }

      const modelBuffer = await modelResponse.arrayBuffer();
      this.downloadTime = performance.now() - dlStart;

      if (labelsResponse?.ok) {
        const text = await labelsResponse.text();
        this.labels = text
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
      }

      this.status = 'compiling';
      const compileStart = performance.now();

      const rt = this.liteRt as { loadAndCompile: (buf: ArrayBuffer, opts: unknown) => Promise<unknown> };

      try {
        this.model = await rt.loadAndCompile(modelBuffer, {
          accelerator: 'webgpu',
        });
        this.backend = 'webgpu';
      } catch {
        try {
          this.model = await rt.loadAndCompile(modelBuffer, {
            accelerator: 'cpu',
          });
          this.backend = 'wasm';
        } catch (cpuErr) {
          this.status = 'failed';
          throw new Error(
            `Model compilation failed on both WebGPU and CPU: ${cpuErr instanceof Error ? cpuErr.message : String(cpuErr)}`,
            { cause: cpuErr },
          );
        }
      }

      this.compileTime = performance.now() - compileStart;
      this.status = 'ready';
    } catch (err) {
      this.status = 'failed';
      throw err;
    }
  }

  async infer(input: ImageData | HTMLVideoElement): Promise<InferenceResult> {
    if (this.status !== 'ready' || !this.model || !this.config) {
      throw new Error('Model not ready for inference');
    }

    const srcWidth = input instanceof ImageData ? input.width : input.videoWidth;
    const srcHeight = input instanceof ImageData ? input.height : input.videoHeight;

    const preStart = performance.now();
    const { data, letterbox } = preprocessImage(input, this.config);
    const preprocessTimeMs = performance.now() - preStart;

    const infStart = performance.now();
    const m = this.model as { run: (input: unknown) => Promise<Float32Array[]> };
    const outputs = await m.run(data);
    const inferenceTimeMs = performance.now() - infStart;

    const postStart = performance.now();
    let detections;
    if (this.config.output.decoder === 'ssd') {
      detections = decodeSSD(
        outputs, this.config, this.labels, letterbox, srcWidth, srcHeight,
      );
    } else if (this.config.output.decoder === 'yolo') {
      detections = decodeYOLO(
        outputs, this.config, this.labels, letterbox, srcWidth, srcHeight,
      );
    } else {
      detections = decodeSSD(
        outputs, this.config, this.labels, letterbox, srcWidth, srcHeight,
      );
    }

    detections = nonMaxSuppression(
      detections,
      this.config.iouThreshold,
      this.config.maxDetections,
    );
    const postprocessTimeMs = performance.now() - postStart;

    this.inferenceTimes.push(inferenceTimeMs);
    if (this.inferenceTimes.length > 30) this.inferenceTimes.shift();

    return { detections, inferenceTimeMs, preprocessTimeMs, postprocessTimeMs };
  }

  getBackend(): 'webgpu' | 'wasm' {
    return this.backend;
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
      backend: this.backend,
    };
  }

  async dispose(): Promise<void> {
    if (this.model && typeof (this.model as { dispose?: () => void }).dispose === 'function') {
      (this.model as { dispose: () => void }).dispose();
    }
    this.model = null;
    this.status = 'unloaded';
    this.inferenceTimes = [];
  }
}
