import type { AnalysisReport } from '../../inference/types';
import { downloadReport } from '../../utils/report';

interface Props {
  report: AnalysisReport | null;
  disabled?: boolean;
}

export function ExportButton({ report, disabled }: Props) {
  return (
    <button
      className="btn btn-secondary"
      onClick={() => report && downloadReport(report)}
      disabled={disabled || !report}
      aria-label="Export analysis as JSON"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a.5.5 0 0 0-.5.5v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5A.5.5 0 0 0 8 1zM2 13.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
      </svg>
      Export JSON
    </button>
  );
}
