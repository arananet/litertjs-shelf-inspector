import { describe, it, expect } from 'vitest';
import { nonMaxSuppression, filterByConfidence } from './nms';
import type { Detection } from '../types';

function makeDetection(
  x: number, y: number, w: number, h: number, confidence: number, label = 'obj',
): Detection {
  return {
    classId: 0,
    label,
    confidence,
    boundingBox: { x, y, width: w, height: h },
  };
}

describe('nonMaxSuppression', () => {
  it('keeps non-overlapping detections', () => {
    const dets = [
      makeDetection(0, 0, 10, 10, 0.9),
      makeDetection(100, 100, 10, 10, 0.8),
    ];
    const result = nonMaxSuppression(dets, 0.5, 10);
    expect(result).toHaveLength(2);
  });

  it('suppresses overlapping detections', () => {
    const dets = [
      makeDetection(0, 0, 100, 100, 0.9),
      makeDetection(5, 5, 100, 100, 0.7),
    ];
    const result = nonMaxSuppression(dets, 0.5, 10);
    expect(result).toHaveLength(1);
    expect(result[0].confidence).toBe(0.9);
  });

  it('respects maxDetections', () => {
    const dets = Array.from({ length: 20 }, (_, i) =>
      makeDetection(i * 50, 0, 10, 10, 0.9 - i * 0.01),
    );
    const result = nonMaxSuppression(dets, 0.5, 5);
    expect(result).toHaveLength(5);
  });

  it('returns empty for empty input', () => {
    expect(nonMaxSuppression([], 0.5, 10)).toHaveLength(0);
  });

  it('preserves highest confidence first', () => {
    const dets = [
      makeDetection(0, 0, 10, 10, 0.5),
      makeDetection(200, 200, 10, 10, 0.9),
    ];
    const result = nonMaxSuppression(dets, 0.5, 10);
    expect(result[0].confidence).toBe(0.9);
  });
});

describe('filterByConfidence', () => {
  it('filters out low confidence detections', () => {
    const dets = [
      makeDetection(0, 0, 10, 10, 0.3),
      makeDetection(0, 0, 10, 10, 0.6),
      makeDetection(0, 0, 10, 10, 0.9),
    ];
    const result = filterByConfidence(dets, 0.5);
    expect(result).toHaveLength(2);
    expect(result.every((d) => d.confidence >= 0.5)).toBe(true);
  });

  it('returns all when threshold is 0', () => {
    const dets = [
      makeDetection(0, 0, 10, 10, 0.1),
      makeDetection(0, 0, 10, 10, 0.01),
    ];
    expect(filterByConfidence(dets, 0)).toHaveLength(2);
  });

  it('returns empty when all below threshold', () => {
    const dets = [
      makeDetection(0, 0, 10, 10, 0.3),
      makeDetection(0, 0, 10, 10, 0.2),
    ];
    expect(filterByConfidence(dets, 0.5)).toHaveLength(0);
  });
});
