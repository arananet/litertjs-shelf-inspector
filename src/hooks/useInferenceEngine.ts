import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  InferenceEngine,
  InferenceResult,
  ModelConfig,
  PerformanceMetrics,
  ModelStatus,
  Detection,
} from '../inference/types';
import { createInferenceEngine, detectBestEngine } from '../inference/engine-factory';
import { DEFAULT_MODEL_CONFIG } from '../inference/model-config';
import { filterByConfidence } from '../inference/postprocess/nms';

export function useInferenceEngine() {
  const engineRef = useRef<InferenceEngine | null>(null);
  const [status, setStatus] = useState<ModelStatus>('unloaded');
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [backend, setBackend] = useState<'webgpu' | 'wasm'>('wasm');
  const [confidenceThreshold, setConfidenceThreshold] = useState(
    DEFAULT_MODEL_CONFIG.confidenceThreshold,
  );
  const [isMock, setIsMock] = useState(false);

  const initAndLoad = useCallback(async (config?: ModelConfig) => {
    try {
      setError(null);
      setStatus('loading');

      const engineType = await detectBestEngine();
      setIsMock(engineType === 'mock');
      const engine = await createInferenceEngine(engineType);
      engineRef.current = engine;

      await engine.initialize();
      await engine.loadModel(config || DEFAULT_MODEL_CONFIG);

      setStatus(engine.getStatus());
      setBackend(engine.getBackend());
      setMetrics(engine.getPerformanceMetrics());
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const runInference = useCallback(
    async (input: ImageData | HTMLVideoElement): Promise<InferenceResult | null> => {
      const engine = engineRef.current;
      if (!engine || engine.getStatus() !== 'ready') return null;

      try {
        const result = await engine.infer(input);
        const filtered = filterByConfidence(result.detections, confidenceThreshold);
        setDetections(filtered);
        setMetrics(engine.getPerformanceMetrics());
        return { ...result, detections: filtered };
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      }
    },
    [confidenceThreshold],
  );

  const clearDetections = useCallback(() => {
    setDetections([]);
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
    };
  }, []);

  return {
    status,
    error,
    detections,
    metrics,
    backend,
    isMock,
    confidenceThreshold,
    setConfidenceThreshold,
    initAndLoad,
    runInference,
    clearDetections,
  };
}
