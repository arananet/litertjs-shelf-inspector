import type { Detection, AnalysisReport, PerformanceMetrics, ShelfSummary } from '../inference/types';

export function createReport(params: {
  sourceType: 'image' | 'camera';
  width: number;
  height: number;
  filename?: string;
  metrics: PerformanceMetrics;
  modelId: string;
  modelName: string;
  summary: ShelfSummary;
  detections: Detection[];
}): AnalysisReport {
  return {
    schemaVersion: '1.0',
    createdAt: new Date().toISOString(),
    source: {
      type: params.sourceType,
      width: params.width,
      height: params.height,
      ...(params.filename ? { filename: params.filename } : {}),
    },
    runtime: {
      backend: params.metrics.backend,
      modelId: params.modelId,
      modelName: params.modelName,
      inferenceLatencyMs: params.metrics.lastInferenceMs,
    },
    summary: {
      totalObjects: params.summary.totalObjects,
      averageConfidence: params.summary.averageConfidence,
      estimatedOccupancy: params.summary.estimatedOccupancy,
      estimatedEmptySpace: params.summary.estimatedEmptySpace,
      countsByClass: params.summary.countsByClass,
    },
    detections: params.detections.map((d) => ({
      classId: d.classId,
      label: d.label,
      confidence: d.confidence,
      boundingBox: { ...d.boundingBox },
    })),
  };
}

export function downloadReport(report: AnalysisReport): void {
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shelf-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
