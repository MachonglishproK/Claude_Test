import { Target, CheckCircle, Clock, Zap } from 'lucide-react';
import type { Mission, MissionProgress } from '../../types';

interface MissionListProps {
  missions: MissionProgress;
  language: 'ja' | 'en';
  translations: {
    dailyMissions: string;
    weeklyMissions: string;
    completed: string;
    xpReward: string;
    missionTitles: Record<string, string>;
    missionDescriptions: Record<string, string>;
  };
}

export function MissionList({ missions, language, translations }: MissionListProps) {
  const activeDailyMissions = missions.dailyMissions.filter(m => m.status === 'active');
  const activeWeeklyMissions = missions.weeklyMissions.filter(m => m.status === 'active');
  const completedCount =
    missions.dailyMissions.filter(m => m.status === 'completed').length +
    missions.weeklyMissions.filter(m => m.status === 'completed').length;

  if (activeDailyMissions.length === 0 && activeWeeklyMissions.length === 0) {
    return null;
  }

  return (
    <div className="mission-list">
      <div className="mission-list-header">
        <Target size={18} />
        <h3>{language === 'ja' ? 'ミッション' : 'Missions'}</h3>
        {completedCount > 0 && (
          <span className="mission-completed-badge">
            <CheckCircle size={14} />
            {completedCount}
          </span>
        )}
      </div>

      {activeDailyMissions.length > 0 && (
        <div className="mission-section">
          <h4 className="mission-section-title">
            <Clock size={14} />
            {translations.dailyMissions}
          </h4>
          <div className="mission-cards">
            {activeDailyMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                translations={translations}
              />
            ))}
          </div>
        </div>
      )}

      {activeWeeklyMissions.length > 0 && (
        <div className="mission-section">
          <h4 className="mission-section-title">
            <Zap size={14} />
            {translations.weeklyMissions}
          </h4>
          <div className="mission-cards">
            {activeWeeklyMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                translations={translations}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MissionCardProps {
  mission: Mission;
  translations: {
    completed: string;
    xpReward: string;
    missionTitles: Record<string, string>;
    missionDescriptions: Record<string, string>;
  };
}

function MissionCard({ mission, translations }: MissionCardProps) {
  const progress = (mission.currentCount / mission.targetCount) * 100;
  const isCompleted = mission.status === 'completed';
  const title = translations.missionTitles[mission.titleKey] || mission.titleKey;

  return (
    <div className={`mission-card ${isCompleted ? 'completed' : ''}`}>
      <div className="mission-card-content">
        <div className="mission-card-header">
          <span className="mission-card-title">{title}</span>
          <span className="mission-card-xp">+{mission.xpReward} XP</span>
        </div>
        <div className="mission-card-progress">
          <div className="mission-card-progress-bar">
            <div
              className="mission-card-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="mission-card-progress-text">
            {mission.currentCount}/{mission.targetCount}
          </span>
        </div>
      </div>
      {isCompleted && (
        <div className="mission-card-check">
          <CheckCircle size={18} />
        </div>
      )}
    </div>
  );
}
