interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function ConfidenceSlider({ value, onChange }: Props) {
  return (
    <div className="confidence-slider">
      <label htmlFor="confidence-threshold">
        Confidence threshold: <strong>{(value * 100).toFixed(0)}%</strong>
      </label>
      <input
        id="confidence-threshold"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={`${(value * 100).toFixed(0)} percent`}
      />
    </div>
  );
}
