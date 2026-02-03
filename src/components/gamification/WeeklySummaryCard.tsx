import { TrendingUp, TrendingDown, Minus, Target, Calendar, Sparkles } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { StreakCard } from './StreakCard';

interface WeeklySummaryCardProps {
  goalsCompleted: number;
  totalGoals: number;
  mood: number | null;
  previousMood: number | null;
  streakDays: number;
  longestStreak: number;
  translations: {
    title: string;
    goalsProgress: string;
    moodTrend: string;
    streak: string;
    streakLabel: { current: string; longest: string };
    encouragements: {
      great: string;
      good: string;
      keep_going: string;
      start_fresh: string;
    };
    moodLabels: string[];
  };
}

export function WeeklySummaryCard({
  goalsCompleted,
  totalGoals,
  mood,
  previousMood,
  streakDays,
  longestStreak,
  translations: t,
}: WeeklySummaryCardProps) {
  const goalPercentage = totalGoals > 0 ? Math.round((goalsCompleted / totalGoals) * 100) : 0;

  // Determine encouragement type
  let encouragement: 'great' | 'good' | 'keep_going' | 'start_fresh' = 'start_fresh';
  if (goalPercentage >= 80) {
    encouragement = 'great';
  } else if (goalPercentage >= 50) {
    encouragement = 'good';
  } else if (goalPercentage > 0) {
    encouragement = 'keep_going';
  }

  // Mood trend
  const moodTrend = mood && previousMood
    ? mood > previousMood ? 'up' : mood < previousMood ? 'down' : 'same'
    : null;

  const MoodIcon = moodTrend === 'up' ? TrendingUp : moodTrend === 'down' ? TrendingDown : Minus;

  return (
    <div className="weekly-summary-card">
      <div className="weekly-summary-header">
        <Sparkles size={20} />
        <h3>{t.title}</h3>
      </div>

      <div className="weekly-summary-content">
        {/* Goals Progress */}
        <div className="summary-section">
          <div className="summary-section-header">
            <Target size={16} />
            <span>{t.goalsProgress}</span>
          </div>
          <ProgressBar
            current={goalsCompleted}
            total={totalGoals}
            size="md"
          />
          <p className="summary-count">{goalsCompleted} / {totalGoals}</p>
        </div>

        {/* Mood Trend */}
        {mood !== null && (
          <div className="summary-section">
            <div className="summary-section-header">
              <Calendar size={16} />
              <span>{t.moodTrend}</span>
            </div>
            <div className="mood-display">
              <span className="mood-value">{t.moodLabels[mood - 1]}</span>
              {moodTrend && (
                <span className={`mood-trend ${moodTrend}`}>
                  <MoodIcon size={14} />
                </span>
              )}
            </div>
          </div>
        )}

        {/* Streak */}
        <div className="summary-section">
          <div className="summary-section-header">
            <span>{t.streak}</span>
          </div>
          <StreakCard
            currentStreak={streakDays}
            longestStreak={longestStreak}
            label={t.streakLabel}
            compact={false}
          />
        </div>
      </div>

      {/* Encouragement */}
      <div className={`weekly-summary-encouragement ${encouragement}`}>
        <p>{t.encouragements[encouragement]}</p>
      </div>
    </div>
  );
}
