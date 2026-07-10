import type { Detection } from '../types';

function computeIoU(a: Detection, b: Detection): number {
  const ax2 = a.boundingBox.x + a.boundingBox.width;
  const ay2 = a.boundingBox.y + a.boundingBox.height;
  const bx2 = b.boundingBox.x + b.boundingBox.width;
  const by2 = b.boundingBox.y + b.boundingBox.height;

  const ix1 = Math.max(a.boundingBox.x, b.boundingBox.x);
  const iy1 = Math.max(a.boundingBox.y, b.boundingBox.y);
  const ix2 = Math.min(ax2, bx2);
  const iy2 = Math.min(ay2, by2);

  const iw = Math.max(0, ix2 - ix1);
  const ih = Math.max(0, iy2 - iy1);
  const intersection = iw * ih;

  const aArea = a.boundingBox.width * a.boundingBox.height;
  const bArea = b.boundingBox.width * b.boundingBox.height;
  const union = aArea + bArea - intersection;

  return union > 0 ? intersection / union : 0;
}

export function nonMaxSuppression(
  detections: Detection[],
  iouThreshold: number,
  maxDetections: number,
): Detection[] {
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const kept: Detection[] = [];
  const suppressed = new Set<number>();

  for (let i = 0; i < sorted.length && kept.length < maxDetections; i++) {
    if (suppressed.has(i)) continue;
    kept.push(sorted[i]);

    for (let j = i + 1; j < sorted.length; j++) {
      if (suppressed.has(j)) continue;
      if (computeIoU(sorted[i], sorted[j]) > iouThreshold) {
        suppressed.add(j);
      }
    }
  }

  return kept;
}

export function filterByConfidence(
  detections: Detection[],
  threshold: number,
): Detection[] {
  return detections.filter((d) => d.confidence >= threshold);
}
