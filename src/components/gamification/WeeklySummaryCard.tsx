import { TrendingUp, TrendingDown, Minus, Target, Calendar, Sparkles, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { StreakCard } from './StreakCard';

interface WeeklySummaryCardProps {
  goalsCompleted: number;
  totalGoals: number;
  mood: number | null;
  previousMood: number | null;
  streakDays: number;
  longestStreak: number;
  companionMessage?: string;
  language?: 'ja' | 'en';
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
  companionMessage,
  language = 'ja',
  translations: t,
}: WeeklySummaryCardProps) {
  const [showDetails, setShowDetails] = useState(false);
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

  // 3-line digest
  const getDigest = () => {
    const lines: string[] = [];

    // Line 1: Goals summary
    if (goalPercentage >= 80) {
      lines.push(language === 'ja' ? `目標${goalPercentage}%達成！` : `${goalPercentage}% of goals done!`);
    } else if (goalPercentage > 0) {
      lines.push(language === 'ja' ? `目標${goalsCompleted}/${totalGoals}達成` : `${goalsCompleted}/${totalGoals} goals completed`);
    } else if (totalGoals > 0) {
      lines.push(language === 'ja' ? '今週はこれから' : 'Getting started');
    }

    // Line 2: Mood or streak highlight
    if (moodTrend === 'up') {
      lines.push(language === 'ja' ? '気分が上向き' : 'Mood improving');
    } else if (streakDays >= 3) {
      lines.push(language === 'ja' ? `${streakDays}週連続記録中！` : `${streakDays} week streak!`);
    } else if (mood) {
      lines.push(language === 'ja' ? `気分: ${t.moodLabels[mood - 1]}` : `Mood: ${t.moodLabels[mood - 1]}`);
    }

    // Line 3: Next step suggestion (light)
    if (goalPercentage < 50 && totalGoals > 0) {
      lines.push(language === 'ja' ? '目標を軽くしてもOK' : 'Lighter goals are okay');
    } else if (goalPercentage >= 100) {
      lines.push(language === 'ja' ? '来週も楽しみに' : 'Looking forward to next week');
    }

    return lines;
  };

  const digestLines = getDigest();

  return (
    <div className="weekly-summary-card">
      <div className="weekly-summary-header">
        <Sparkles size={20} />
        <h3>{t.title}</h3>
      </div>

      {/* 30-second digest */}
      <div className="weekly-summary-digest">
        {digestLines.map((line, i) => (
          <p key={i} className="digest-line">{line}</p>
        ))}
        {companionMessage && (
          <p className="digest-companion-reaction">{companionMessage}</p>
        )}
      </div>

      {/* Toggle for details */}
      <button
        className="weekly-summary-toggle"
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
      >
        <span>{language === 'ja' ? '詳細を見る' : 'See details'}</span>
        <ChevronDown size={16} className={showDetails ? 'rotated' : ''} />
      </button>

      {showDetails && (
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
      )}

      {/* Encouragement */}
      <div className={`weekly-summary-encouragement ${encouragement}`}>
        <p>{t.encouragements[encouragement]}</p>
      </div>
    </div>
  );
}
