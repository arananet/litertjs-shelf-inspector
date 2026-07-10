import type { PerformanceMetrics } from '../../inference/types';

interface Props {
  metrics: PerformanceMetrics | null;
}

function formatMs(ms: number): string {
  if (ms === 0) return '—';
  if (ms < 1) return '<1 ms';
  return `${ms.toFixed(1)} ms`;
}

export function PerformancePanel({ metrics }: Props) {
  if (!metrics) {
    return (
      <div className="panel performance-panel">
        <h3>Performance</h3>
        <p className="empty-state">Load a model to see performance metrics.</p>
      </div>
    );
  }

  return (
    <div className="panel performance-panel">
      <h3>Performance</h3>
      <dl className="metrics-grid">
        <div className="metric-item">
          <dt>Runtime Init</dt>
          <dd>{formatMs(metrics.runtimeInitMs)}</dd>
        </div>
        <div className="metric-item">
          <dt>Model Download</dt>
          <dd>{formatMs(metrics.modelDownloadMs)}</dd>
        </div>
        <div className="metric-item">
          <dt>Model Compile</dt>
          <dd>{formatMs(metrics.modelCompileMs)}</dd>
        </div>
        <div className="metric-item">
          <dt>Last Inference</dt>
          <dd>{formatMs(metrics.lastInferenceMs)}</dd>
        </div>
        <div className="metric-item">
          <dt>Mean Inference</dt>
          <dd>{formatMs(metrics.rollingMeanMs)}</dd>
        </div>
        <div className="metric-item">
          <dt>FPS</dt>
          <dd>{metrics.fps > 0 ? metrics.fps.toFixed(1) : '—'}</dd>
        </div>
        <div className="metric-item">
          <dt>Total Runs</dt>
          <dd>{metrics.totalInferences}</dd>
        </div>
        <div className="metric-item">
          <dt>Backend</dt>
          <dd className={`backend-badge backend-${metrics.backend}`}>
            {metrics.backend === 'webgpu' ? 'WebGPU' : 'Wasm/CPU'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
