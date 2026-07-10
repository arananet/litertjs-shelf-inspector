interface Props {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  error: string | null;
  disabled?: boolean;
}

export function CameraControls({ isActive, onStart, onStop, error, disabled }: Props) {
  return (
    <div className="camera-controls">
      {!isActive ? (
        <button className="btn btn-primary" onClick={onStart} disabled={disabled} aria-label="Start camera">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M4 5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4zm12 2.5l2-1.5v8l-2-1.5V7.5z" />
          </svg>
          Start Camera
        </button>
      ) : (
        <button className="btn btn-danger" onClick={onStop} aria-label="Stop camera">
          Stop Camera
        </button>
      )}
      {error && (
        <p className="camera-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
