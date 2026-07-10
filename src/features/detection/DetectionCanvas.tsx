import { useRef, useEffect, useCallback } from 'react';
import type { Detection } from '../../inference/types';

const COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#2980b9', '#c0392b', '#16a085',
];

interface Props {
  imageData: ImageData | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detections: Detection[];
  showLabels: boolean;
  isVideoMode: boolean;
}

export function DetectionCanvas({
  imageData,
  videoRef,
  detections,
  showLabels,
  isVideoMode,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let srcWidth: number;
    let srcHeight: number;

    if (isVideoMode && videoRef.current) {
      srcWidth = videoRef.current.videoWidth || 640;
      srcHeight = videoRef.current.videoHeight || 480;
    } else if (imageData) {
      srcWidth = imageData.width;
      srcHeight = imageData.height;
    } else {
      return;
    }

    canvas.width = srcWidth;
    canvas.height = srcHeight;

    if (isVideoMode && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0);
    } else if (imageData) {
      ctx.putImageData(imageData, 0, 0);
    }

    for (const det of detections) {
      const color = COLORS[det.classId % COLORS.length];
      const { x, y, width, height } = det.boundingBox;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      if (showLabels) {
        const text = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = '14px system-ui, sans-serif';
        const metrics = ctx.measureText(text);
        const textH = 20;
        const textY = y > textH ? y - textH : y;

        ctx.fillStyle = color;
        ctx.fillRect(x, textY, metrics.width + 8, textH);

        ctx.fillStyle = '#fff';
        ctx.fillText(text, x + 4, textY + 15);
      }
    }
  }, [imageData, videoRef, detections, showLabels, isVideoMode]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div ref={containerRef} className="detection-canvas-container">
      <canvas ref={canvasRef} className="detection-canvas" aria-label="Detection results overlay" />
    </div>
  );
}
