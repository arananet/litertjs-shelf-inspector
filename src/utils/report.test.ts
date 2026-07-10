import { describe, it, expect } from 'vitest';
import { createReport } from './report';
import type { PerformanceMetrics, ShelfSummary, Detection } from '../inference/types';

describe('createReport', () => {
  const metrics: PerformanceMetrics = {
    runtimeInitMs: 100,
    modelDownloadMs: 200,
    modelCompileMs: 150,
    lastInferenceMs: 30,
    rollingMeanMs: 35,
    fps: 28.5,
    totalInferences: 10,
    backend: 'wasm',
  };

  const summary: ShelfSummary = {
    totalObjects: 3,
    countsByClass: { bottle: 2, can: 1 },
    averageConfidence: 0.8,
    detectionDensity: 1.5,
    estimatedOccupancy: 0.3,
    estimatedEmptySpace: 0.7,
  };

  const detections: Detection[] = [
    { classId: 0, label: 'bottle', confidence: 0.9, boundingBox: { x: 10, y: 20, width: 50, height: 80 } },
    { classId: 0, label: 'bottle', confidence: 0.8, boundingBox: { x: 100, y: 20, width: 50, height: 80 } },
    { classId: 1, label: 'can', confidence: 0.7, boundingBox: { x: 200, y: 30, width: 40, height: 60 } },
  ];

  it('creates a valid report with schemaVersion 1.0', () => {
    const report = createReport({
      sourceType: 'image',
      width: 640,
      height: 480,
      filename: 'test.jpg',
      metrics,
      modelId: 'ssd-mobilenet',
      modelName: 'SSD MobileNet',
      summary,
      detections,
    });

    expect(report.schemaVersion).toBe('1.0');
    expect(report.source.type).toBe('image');
    expect(report.source.width).toBe(640);
    expect(report.source.filename).toBe('test.jpg');
    expect(report.runtime.backend).toBe('wasm');
    expect(report.summary.totalObjects).toBe(3);
    expect(report.detections).toHaveLength(3);
  });

  it('does not include image data in the report', () => {
    const report = createReport({
      sourceType: 'image',
      width: 640,
      height: 480,
      metrics,
      modelId: 'test',
      modelName: 'test',
      summary,
      detections,
    });

    const json = JSON.stringify(report);
    expect(json).not.toContain('base64');
    expect(json).not.toContain('imageData');
    expect(json).not.toContain('pixels');
  });

  it('has createdAt as ISO string', () => {
    const report = createReport({
      sourceType: 'camera',
      width: 1280,
      height: 720,
      metrics,
      modelId: 'test',
      modelName: 'test',
      summary,
      detections: [],
    });

    expect(report.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('omits filename when not provided', () => {
    const report = createReport({
      sourceType: 'camera',
      width: 640,
      height: 480,
      metrics,
      modelId: 'test',
      modelName: 'test',
      summary,
      detections: [],
    });

    expect(report.source.filename).toBeUndefined();
  });
});
