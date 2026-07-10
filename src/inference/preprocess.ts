import type { ModelConfig, LetterboxInfo } from './types';

export function computeLetterbox(
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number,
): LetterboxInfo {
  const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);
  const scaledW = Math.round(srcWidth * scale);
  const scaledH = Math.round(srcHeight * scale);
  const offsetX = Math.round((targetWidth - scaledW) / 2);
  const offsetY = Math.round((targetHeight - scaledH) / 2);
  return {
    scale,
    offsetX,
    offsetY,
    paddedWidth: targetWidth,
    paddedHeight: targetHeight,
  };
}

export function preprocessImage(
  source: ImageData | HTMLVideoElement,
  config: ModelConfig,
): { data: Float32Array | Uint8Array | Int8Array; letterbox: LetterboxInfo } {
  const { width: tw, height: th } = config.input;

  const canvas = document.createElement('canvas');
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext('2d')!;

  let srcWidth: number;
  let srcHeight: number;

  if (source instanceof ImageData) {
    srcWidth = source.width;
    srcHeight = source.height;
  } else {
    srcWidth = source.videoWidth;
    srcHeight = source.videoHeight;
  }

  const letterbox = computeLetterbox(srcWidth, srcHeight, tw, th);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, tw, th);

  if (source instanceof ImageData) {
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = source.width;
    tmpCanvas.height = source.height;
    tmpCanvas.getContext('2d')!.putImageData(source, 0, 0);
    ctx.drawImage(
      tmpCanvas,
      letterbox.offsetX,
      letterbox.offsetY,
      Math.round(srcWidth * letterbox.scale),
      Math.round(srcHeight * letterbox.scale),
    );
  } else {
    ctx.drawImage(
      source,
      letterbox.offsetX,
      letterbox.offsetY,
      Math.round(srcWidth * letterbox.scale),
      Math.round(srcHeight * letterbox.scale),
    );
  }

  const imageData = ctx.getImageData(0, 0, tw, th);
  const pixels = imageData.data;

  const numPixels = tw * th;
  const channels = 3;

  if (config.input.dataType === 'float32') {
    const result = new Float32Array(numPixels * channels);
    const norm = config.input.normalization;

    for (let i = 0; i < numPixels; i++) {
      const pi = i * 4;
      let r = pixels[pi];
      let g = pixels[pi + 1];
      let b = pixels[pi + 2];

      if (norm.type === 'zero-to-one') {
        r /= 255;
        g /= 255;
        b /= 255;
      } else if (norm.type === 'minus-one-to-one') {
        r = r / 127.5 - 1;
        g = g / 127.5 - 1;
        b = b / 127.5 - 1;
      } else if (norm.type === 'mean-std') {
        r = (r - norm.mean[0]) / norm.std[0];
        g = (r - norm.mean[1]) / norm.std[1];
        b = (r - norm.mean[2]) / norm.std[2];
      }

      if (config.input.layout === 'NHWC') {
        result[i * 3] = r;
        result[i * 3 + 1] = g;
        result[i * 3 + 2] = b;
      } else {
        result[i] = r;
        result[numPixels + i] = g;
        result[numPixels * 2 + i] = b;
      }
    }
    return { data: result, letterbox };
  }

  if (config.input.dataType === 'uint8') {
    const result = new Uint8Array(numPixels * channels);
    for (let i = 0; i < numPixels; i++) {
      const pi = i * 4;
      if (config.input.layout === 'NHWC') {
        result[i * 3] = pixels[pi];
        result[i * 3 + 1] = pixels[pi + 1];
        result[i * 3 + 2] = pixels[pi + 2];
      } else {
        result[i] = pixels[pi];
        result[numPixels + i] = pixels[pi + 1];
        result[numPixels * 2 + i] = pixels[pi + 2];
      }
    }
    return { data: result, letterbox };
  }

  const result = new Int8Array(numPixels * channels);
  for (let i = 0; i < numPixels; i++) {
    const pi = i * 4;
    if (config.input.layout === 'NHWC') {
      result[i * 3] = pixels[pi] - 128;
      result[i * 3 + 1] = pixels[pi + 1] - 128;
      result[i * 3 + 2] = pixels[pi + 2] - 128;
    } else {
      result[i] = pixels[pi] - 128;
      result[numPixels + i] = pixels[pi + 1] - 128;
      result[numPixels * 2 + i] = pixels[pi + 2] - 128;
    }
  }
  return { data: result, letterbox };
}
