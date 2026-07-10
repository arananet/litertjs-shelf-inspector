import { useState, useRef, useCallback } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 20 * 1024 * 1024;

interface Props {
  onImageLoad: (imageData: ImageData, file: File) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageLoad, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`Unsupported format: ${file.type}. Use JPEG, PNG, WebP, or GIF.`);
        return;
      }

      if (file.size > MAX_SIZE) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 20 MB.`);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        onImageLoad(imageData, file);
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        setError('Failed to load image.');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [onImageLoad],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  return (
    <div
      className={`image-upload ${isDragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="sr-only"
        id="image-upload-input"
        disabled={disabled}
        aria-label="Upload an image for analysis"
      />
      <label htmlFor="image-upload-input" className="upload-label">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
          <path d="M24 4L14 14h7v12h6V14h7L24 4zm-14 28v8h28v-8h-4v4H14v-4h-4z" />
        </svg>
        <span>Drag and drop an image or click to browse</span>
        <span className="upload-hint">JPEG, PNG, WebP, GIF up to 20 MB</span>
      </label>
      {error && (
        <p className="upload-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
