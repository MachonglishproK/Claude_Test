import { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPANIONS, getCompanionState, getCompanionMessage } from '../../lib/storage';
import type { CompanionData, CompanionState } from '../../types';

interface CompanionWidgetProps {
  companionData: CompanionData;
  isInCheckIn?: boolean;
  allGoalsDone?: boolean;
  language: 'ja' | 'en';
  animationsEnabled?: boolean;
  translations: {
    level: string;
    xp: string;
    chooseCompanion: string;
  };
}

const STATE_ANIMATIONS: Record<CompanionState, string> = {
  sleeping: 'companion-sleeping',
  calm: 'companion-calm',
  happy: 'companion-happy',
  excited: 'companion-excited',
  focused: 'companion-focused',
  proud: 'companion-proud',
};

export function CompanionWidget({
  companionData,
  isInCheckIn = false,
  allGoalsDone = false,
  language,
  animationsEnabled = true,
  translations,
}: CompanionWidgetProps) {
  const [state, setState] = useState<CompanionState>('calm');

  const companion = COMPANIONS[companionData.id];
  const evolutionEmoji = companion.evolutionEmojis[companionData.evolution - 1];
  const message = getCompanionMessage(state, companionData.id, language);

  useEffect(() => {
    const newState = getCompanionState(companionData, isInCheckIn, allGoalsDone);
    setState(newState);
  }, [companionData, isInCheckIn, allGoalsDone]);

  // Calculate XP progress to next level
  const xpInCurrentLevel = companionData.xp % 100;
  const xpProgress = (xpInCurrentLevel / 100) * 100;

  return (
    <div
      className="companion-widget"
      style={{ '--companion-color': companion.color } as React.CSSProperties}
    >
      <div className="companion-widget-main">
        <div
          className={`companion-widget-avatar ${animationsEnabled ? STATE_ANIMATIONS[state] : ''}`}
        >
          <span className="companion-widget-emoji">{evolutionEmoji}</span>
        </div>

        <div className="companion-widget-content">
          <div className="companion-widget-header">
            <span className="companion-widget-name">{companion.name[language]}</span>
            <span className="companion-widget-level">
              {translations.level} {companionData.level}
            </span>
          </div>

          <div className="companion-widget-message">
            <span>{message}</span>
          </div>

          <div className="companion-widget-xp">
            <div className="companion-widget-xp-bar">
              <div
                className="companion-widget-xp-fill"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="companion-widget-xp-text">
              {xpInCurrentLevel}/100 {translations.xp}
            </span>
          </div>
        </div>
      </div>

      <Link to="/settings" className="companion-widget-settings">
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

interface CompanionEmptyStateProps {
  language: 'ja' | 'en';
  translations: {
    noCompanion: string;
    chooseCompanion: string;
  };
}

export function CompanionEmptyState({ translations }: CompanionEmptyStateProps) {
  return (
    <Link to="/settings" className="companion-empty-state">
      <div className="companion-empty-icon">
        <TrendingUp size={24} />
      </div>
      <div className="companion-empty-content">
        <p className="companion-empty-title">{translations.noCompanion}</p>
        <p className="companion-empty-cta">{translations.chooseCompanion}</p>
      </div>
      <ChevronRight size={16} className="companion-empty-arrow" />
    </Link>
  );
}
