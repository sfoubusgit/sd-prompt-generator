import './WeightSlider.css';

interface WeightSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// All sliders are DISABLED by default - user must explicitly enable via checkbox
export function WeightSlider({ id, label, value, min, max, step, onChange, enabled = false, onEnabledChange, onFocus, onBlur }: WeightSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onEnabledChange) {
      onEnabledChange(e.target.checked);
    }
  };

  // Calculate percentage for visual fill, ensuring it works with negative values
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  
  // Determine if value is negative for styling
  const isNegative = value < 0;
  const isZero = Math.abs(value) < 0.001;

  return (
    <div className="weight-slider">
      <div className="weight-slider-header">
        <div className="weight-slider-label-wrapper">
          {onEnabledChange && (
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleCheckboxChange}
              className="weight-slider-checkbox"
            />
          )}
          <label htmlFor={id} className="weight-slider-label">
            {label}
          </label>
        </div>
        <span className={`weight-slider-value ${isNegative ? 'weight-slider-negative' : ''} ${isZero ? 'weight-slider-zero' : ''} ${!enabled ? 'weight-slider-disabled' : ''}`}>
          {value.toFixed(2)}
        </span>
      </div>
      <div className="weight-slider-wrapper">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={!enabled}
          className="weight-slider-input"
          style={{
            opacity: enabled ? 1 : 0.5,
            background: isNegative
              ? `linear-gradient(to right, #ff4d4d 0%, #ff4d4d ${percentage}%, rgba(255, 255, 255, 0.05) ${percentage}%, rgba(255, 255, 255, 0.05) 100%)`
              : `linear-gradient(to right, #6E56F9 0%, #6E56F9 ${percentage}%, rgba(255, 255, 255, 0.05) ${percentage}%, rgba(255, 255, 255, 0.05) 100%)`
          }}
        />
      </div>
    </div>
  );
}

