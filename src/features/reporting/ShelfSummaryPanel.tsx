import type { ShelfSummary } from '../../inference/types';

interface Props {
  summary: ShelfSummary | null;
}

export function ShelfSummaryPanel({ summary }: Props) {
  if (!summary || summary.totalObjects === 0) {
    return (
      <div className="panel shelf-summary">
        <h3>Shelf Summary</h3>
        <p className="empty-state">No detections yet. Upload an image or start the camera.</p>
      </div>
    );
  }

  return (
    <div className="panel shelf-summary">
      <h3>Shelf Summary</h3>
      <dl className="summary-grid">
        <div className="summary-item">
          <dt>Total Objects</dt>
          <dd>{summary.totalObjects}</dd>
        </div>
        <div className="summary-item">
          <dt>Avg. Confidence</dt>
          <dd>{(summary.averageConfidence * 100).toFixed(1)}%</dd>
        </div>
        <div className="summary-item">
          <dt>Detection Density</dt>
          <dd>{summary.detectionDensity}/10k px</dd>
        </div>
        <div className="summary-item">
          <dt>Occupancy (est.)</dt>
          <dd>{(summary.estimatedOccupancy * 100).toFixed(1)}%</dd>
        </div>
        <div className="summary-item">
          <dt>Empty Space (est.)</dt>
          <dd>{(summary.estimatedEmptySpace * 100).toFixed(1)}%</dd>
        </div>
      </dl>
      <p className="estimate-note">
        Occupancy and empty-space values are visual estimates based on bounding-box coverage.
      </p>
      <h4>Counts by Class</h4>
      <ul className="class-counts">
        {Object.entries(summary.countsByClass)
          .sort(([, a], [, b]) => b - a)
          .map(([label, count]) => (
            <li key={label}>
              <span className="class-label">{label}</span>
              <span className="class-count">{count}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}
