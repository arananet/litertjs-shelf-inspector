interface Props {
  onLoad: (imageData: ImageData, file: File) => void;
  disabled?: boolean;
}

export function SampleImageLoader({ onLoad, disabled }: Props) {
  const loadSample = async () => {
    try {
      const response = await fetch('/samples/sample-shelf.svg');
      const blob = await response.blob();
      const file = new File([blob], 'sample-shelf.svg', { type: blob.type });

      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, 640, 480);
        ctx.drawImage(img, 0, 0, 640, 480);
        const imageData = ctx.getImageData(0, 0, 640, 480);
        onLoad(imageData, file);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 640, 480);

      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 2;
      for (let y = 0; y < 480; y += 120) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
          const x = 20 + col * 100;
          const y = 10 + row * 120;
          ctx.fillStyle = colors[(row + col) % colors.length];
          ctx.fillRect(x, y, 80, 100);
          ctx.strokeStyle = '#333';
          ctx.strokeRect(x, y, 80, 100);
        }
      }

      ctx.fillStyle = '#333';
      ctx.font = '14px sans-serif';
      ctx.fillText('Sample Shelf Image (generated)', 200, 470);

      const imageData = ctx.getImageData(0, 0, 640, 480);
      const blob = new Blob([new Uint8Array(0)], { type: 'image/png' });
      const file = new File([blob], 'sample-shelf.png', { type: 'image/png' });
      onLoad(imageData, file);
    }
  };

  return (
    <button className="btn btn-secondary" onClick={loadSample} disabled={disabled}>
      Load Sample Image
    </button>
  );
}
