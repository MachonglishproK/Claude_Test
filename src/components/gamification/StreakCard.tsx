import { Flame, TrendingUp } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  label: { current: string; longest: string };
  compact?: boolean;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  label,
  compact = false,
}: StreakCardProps) {
  if (compact) {
    return (
      <div className="streak-compact">
        <Flame size={18} className={`streak-icon ${currentStreak > 0 ? 'active' : ''}`} />
        <span className="streak-number">{currentStreak}</span>
      </div>
    );
  }

  return (
    <div className="streak-card">
      <div className="streak-main">
        <div className={`streak-flame ${currentStreak > 0 ? 'active' : ''}`}>
          <Flame size={32} />
        </div>
        <div className="streak-info">
          <span className="streak-count">{currentStreak}</span>
          <span className="streak-label">{label.current}</span>
        </div>
      </div>
      {longestStreak > 0 && (
        <div className="streak-best">
          <TrendingUp size={14} />
          <span>{label.longest}: {longestStreak}</span>
        </div>
      )}
    </div>
  );
}
