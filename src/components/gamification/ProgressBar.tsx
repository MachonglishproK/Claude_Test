import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  size = 'md',
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = current >= total && total > 0;

  const heightClass = {
    sm: 'progress-bar-sm',
    md: 'progress-bar-md',
    lg: 'progress-bar-lg',
  }[size];

  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-bar-header">
          <span className="progress-bar-label">{label}</span>
          {showPercentage && (
            <span className="progress-bar-percentage">
              {isComplete && <CheckCircle2 size={14} className="progress-complete-icon" />}
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={`progress-bar-track ${heightClass}`}>
        <div
          className={`progress-bar-fill ${isComplete ? 'complete' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!label && showPercentage && (
        <span className="progress-bar-inline-percentage">{current}/{total}</span>
      )}
    </div>
  );
}
