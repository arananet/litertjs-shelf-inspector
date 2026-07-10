import type { Detection, ShelfSummary } from '../inference/types';

export function computeShelfSummary(
  detections: Detection[],
  imageWidth: number,
  imageHeight: number,
): ShelfSummary {
  if (detections.length === 0) {
    return {
      totalObjects: 0,
      countsByClass: {},
      averageConfidence: 0,
      detectionDensity: 0,
      estimatedOccupancy: 0,
      estimatedEmptySpace: 1,
    };
  }

  const countsByClass: Record<string, number> = {};
  let totalConfidence = 0;
  let coveredArea = 0;

  for (const det of detections) {
    countsByClass[det.label] = (countsByClass[det.label] || 0) + 1;
    totalConfidence += det.confidence;
    coveredArea += det.boundingBox.width * det.boundingBox.height;
  }

  const imageArea = imageWidth * imageHeight;
  const estimatedOccupancy = Math.min(1, coveredArea / imageArea);
  const detectionDensity = imageArea > 0 ? detections.length / (imageArea / 10000) : 0;

  return {
    totalObjects: detections.length,
    countsByClass,
    averageConfidence: totalConfidence / detections.length,
    detectionDensity: Math.round(detectionDensity * 100) / 100,
    estimatedOccupancy: Math.round(estimatedOccupancy * 10000) / 10000,
    estimatedEmptySpace: Math.round((1 - estimatedOccupancy) * 10000) / 10000,
  };
}
