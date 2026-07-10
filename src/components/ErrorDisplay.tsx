import { useState } from 'react';

interface Props {
  title: string;
  message: string;
  detail?: string;
}

export function ErrorDisplay({ title, message, detail }: Props) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="error-display" role="alert">
      <h3>{title}</h3>
      <p>{message}</p>
      {detail && (
        <>
          <button
            className="btn-link"
            onClick={() => setShowDetail(!showDetail)}
            aria-expanded={showDetail}
          >
            {showDetail ? 'Hide' : 'Show'} technical details
          </button>
          {showDetail && <pre className="error-detail">{detail}</pre>}
        </>
      )}
    </div>
  );
}
