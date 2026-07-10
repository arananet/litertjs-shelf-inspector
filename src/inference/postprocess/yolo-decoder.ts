import type { Detection, ModelConfig, LetterboxInfo } from '../types';
import { reverseLetterbox } from '../../utils/coordinates';

export function decodeYOLO(
  outputs: Float32Array[],
  config: ModelConfig,
  labels: string[],
  letterbox: LetterboxInfo,
  originalWidth: number,
  originalHeight: number,
): Detection[] {
  const output = outputs[0];
  const numClasses = labels.length;
  const numBoxes = output.length / (5 + numClasses);
  const detections: Detection[] = [];

  for (let i = 0; i < numBoxes; i++) {
    const offset = i * (5 + numClasses);
    const objectness = output[offset + 4];
    if (objectness < config.confidenceThreshold) continue;

    let bestClass = 0;
    let bestScore = 0;
    for (let c = 0; c < numClasses; c++) {
      const score = output[offset + 5 + c] * objectness;
      if (score > bestScore) {
        bestScore = score;
        bestClass = c;
      }
    }

    if (bestScore < config.confidenceThreshold) continue;

    const cx = output[offset];
    const cy = output[offset + 1];
    const w = output[offset + 2];
    const h = output[offset + 3];

    const normBox = {
      x: (cx - w / 2) * letterbox.paddedWidth,
      y: (cy - h / 2) * letterbox.paddedHeight,
      width: w * letterbox.paddedWidth,
      height: h * letterbox.paddedHeight,
    };

    const bbox = reverseLetterbox(normBox, letterbox, originalWidth, originalHeight);

    detections.push({
      classId: bestClass,
      label: labels[bestClass] || `class_${bestClass}`,
      confidence: bestScore,
      boundingBox: bbox,
    });
  }

  return detections;
}
