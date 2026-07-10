import type { ModelStatus } from '../inference/types';

interface Props {
  status: ModelStatus;
  backend: 'webgpu' | 'wasm';
  isMock: boolean;
  error: string | null;
}

export function StatusBanner({ status, backend, isMock, error }: Props) {
  const statusClass = error ? 'status-error' : `status-${status}`;

  return (
    <div className={`status-banner ${statusClass}`} role="status" aria-live="polite">
      <span className="status-dot" />
      <span className="status-text">
        {error
          ? `Error: ${error}`
          : status === 'ready'
            ? `Model ready — ${backend.toUpperCase()} backend${isMock ? ' (mock)' : ''}`
            : status === 'loading'
              ? 'Loading model...'
              : status === 'compiling'
                ? 'Compiling model...'
                : status === 'failed'
                  ? 'Model failed to load'
                  : 'Model not loaded'}
      </span>
    </div>
  );
}
