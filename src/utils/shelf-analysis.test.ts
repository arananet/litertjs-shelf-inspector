import { describe, it, expect } from 'vitest';
import { computeShelfSummary } from './shelf-analysis';
import type { Detection } from '../inference/types';

function makeDetection(
  label: string, confidence: number, x: number, y: number, w: number, h: number,
): Detection {
  return { classId: 0, label, confidence, boundingBox: { x, y, width: w, height: h } };
}

describe('computeShelfSummary', () => {
  it('returns zeroes for empty detections', () => {
    const result = computeShelfSummary([], 640, 480);
    expect(result.totalObjects).toBe(0);
    expect(result.averageConfidence).toBe(0);
    expect(result.estimatedOccupancy).toBe(0);
    expect(result.estimatedEmptySpace).toBe(1);
    expect(Object.keys(result.countsByClass)).toHaveLength(0);
  });

  it('computes correct totals and class counts', () => {
    const dets = [
      makeDetection('bottle', 0.9, 0, 0, 50, 50),
      makeDetection('bottle', 0.8, 100, 0, 50, 50),
      makeDetection('can', 0.7, 200, 0, 50, 50),
    ];
    const result = computeShelfSummary(dets, 640, 480);
    expect(result.totalObjects).toBe(3);
    expect(result.countsByClass['bottle']).toBe(2);
    expect(result.countsByClass['can']).toBe(1);
  });

  it('computes correct average confidence', () => {
    const dets = [
      makeDetection('a', 0.6, 0, 0, 10, 10),
      makeDetection('b', 0.8, 20, 0, 10, 10),
    ];
    const result = computeShelfSummary(dets, 640, 480);
    expect(result.averageConfidence).toBeCloseTo(0.7);
  });

  it('computes occupancy as fraction of image area', () => {
    const dets = [makeDetection('box', 0.9, 0, 0, 320, 240)];
    const result = computeShelfSummary(dets, 640, 480);
    expect(result.estimatedOccupancy).toBeCloseTo(0.25, 2);
    expect(result.estimatedEmptySpace).toBeCloseTo(0.75, 2);
  });

  it('caps occupancy at 1.0', () => {
    const dets = [makeDetection('box', 0.9, 0, 0, 1000, 1000)];
    const result = computeShelfSummary(dets, 100, 100);
    expect(result.estimatedOccupancy).toBeLessThanOrEqual(1);
    expect(result.estimatedEmptySpace).toBeGreaterThanOrEqual(0);
  });
});
