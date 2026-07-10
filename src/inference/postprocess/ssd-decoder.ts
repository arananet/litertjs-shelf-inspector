import type { Detection, ModelConfig, LetterboxInfo } from '../types';
import { reverseLetterbox } from '../../utils/coordinates';

export function decodeSSD(
  outputs: Float32Array[],
  config: ModelConfig,
  labels: string[],
  letterbox: LetterboxInfo,
  originalWidth: number,
  originalHeight: number,
): Detection[] {
  const { tensorIndexes } = config.output;
  const boxes = outputs[tensorIndexes.boxes];
  const classes = outputs[tensorIndexes.classes];
  const scores = outputs[tensorIndexes.scores];
  const countTensor = outputs[tensorIndexes.count];

  const numDetections = countTensor ? Math.round(countTensor[0]) : scores.length;
  const detections: Detection[] = [];

  for (let i = 0; i < numDetections; i++) {
    const confidence = scores[i];
    if (confidence < config.confidenceThreshold) continue;

    const ymin = boxes[i * 4];
    const xmin = boxes[i * 4 + 1];
    const ymax = boxes[i * 4 + 2];
    const xmax = boxes[i * 4 + 3];

    const normBox = {
      x: xmin * letterbox.paddedWidth,
      y: ymin * letterbox.paddedHeight,
      width: (xmax - xmin) * letterbox.paddedWidth,
      height: (ymax - ymin) * letterbox.paddedHeight,
    };

    const bbox = reverseLetterbox(normBox, letterbox, originalWidth, originalHeight);

    const classId = Math.round(classes[i]);
    detections.push({
      classId,
      label: labels[classId] || `class_${classId}`,
      confidence,
      boundingBox: bbox,
    });
  }

  return detections;
}
