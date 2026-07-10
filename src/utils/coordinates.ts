import type { BoundingBox, LetterboxInfo } from '../inference/types';

export function reverseLetterbox(
  box: BoundingBox,
  letterbox: LetterboxInfo,
  originalWidth: number,
  originalHeight: number,
): BoundingBox {
  const x = (box.x - letterbox.offsetX) / letterbox.scale;
  const y = (box.y - letterbox.offsetY) / letterbox.scale;
  const width = box.width / letterbox.scale;
  const height = box.height / letterbox.scale;

  return {
    x: Math.max(0, Math.min(x, originalWidth)),
    y: Math.max(0, Math.min(y, originalHeight)),
    width: Math.min(width, originalWidth - Math.max(0, x)),
    height: Math.min(height, originalHeight - Math.max(0, y)),
  };
}

export function normalizedToPixel(
  nx: number,
  ny: number,
  nw: number,
  nh: number,
  imgWidth: number,
  imgHeight: number,
): BoundingBox {
  return {
    x: nx * imgWidth,
    y: ny * imgHeight,
    width: nw * imgWidth,
    height: nh * imgHeight,
  };
}
