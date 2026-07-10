import { describe, it, expect } from 'vitest';
import { reverseLetterbox, normalizedToPixel } from './coordinates';
import type { LetterboxInfo } from '../inference/types';

describe('reverseLetterbox', () => {
  it('removes letterbox padding and scale', () => {
    const letterbox: LetterboxInfo = {
      scale: 0.5,
      offsetX: 50,
      offsetY: 0,
      paddedWidth: 300,
      paddedHeight: 300,
    };
    const box = { x: 100, y: 50, width: 50, height: 80 };
    const result = reverseLetterbox(box, letterbox, 500, 600);

    expect(result.x).toBe(100);
    expect(result.y).toBe(100);
    expect(result.width).toBe(100);
    expect(result.height).toBe(160);
  });

  it('clamps to image boundaries', () => {
    const letterbox: LetterboxInfo = {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      paddedWidth: 100,
      paddedHeight: 100,
    };
    const box = { x: -10, y: -5, width: 200, height: 200 };
    const result = reverseLetterbox(box, letterbox, 100, 100);

    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBeLessThanOrEqual(100);
    expect(result.height).toBeLessThanOrEqual(100);
  });
});

describe('normalizedToPixel', () => {
  it('converts normalized coordinates to pixel coordinates', () => {
    const result = normalizedToPixel(0.1, 0.2, 0.5, 0.3, 640, 480);

    expect(result.x).toBeCloseTo(64);
    expect(result.y).toBeCloseTo(96);
    expect(result.width).toBeCloseTo(320);
    expect(result.height).toBeCloseTo(144);
  });
});
