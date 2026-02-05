import { useState } from 'react';
import { Target, CheckCircle, Clock, RefreshCw, Sparkles } from 'lucide-react';
import type { Mission, MissionProgress, MissionDefinition } from '../../types';
import { getMissionDefinition, completeMission, swapMission, checkMissionsEggReward } from '../../lib/storage';

interface MissionListProps {
  missions: MissionProgress;
  language: 'ja' | 'en';
  translations: {
    todaysMissions: string;
    completed: string;
    xpReward: string;
    eggProgress: string;
    swap: string;
    complete: string;
    undo: string;
    duration: string;
    minutes: string;
    seconds: string;
    [key: string]: string;
  };
  onMissionComplete?: (weeklyMissionsCompleted: number) => void;
  onEggReceived?: () => void;
}

export function MissionList({ missions, language, translations, onMissionComplete, onEggReceived }: MissionListProps) {
  const [localMissions, setLocalMissions] = useState<Mission[]>(missions.activeMissions);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [swapping, setSwapping] = useState<string | null>(null);

  const completedCount = localMissions.filter(m => m.status === 'completed' || completedIds.has(m.id)).length;

  if (localMissions.length === 0) {
    return null;
  }

  const handleComplete = async (missionId: string) => {
    setCompletedIds(prev => new Set([...prev, missionId]));

    const result = await completeMission(missionId);
    if (result.completed) {
      setLocalMissions(prev => prev.map(m =>
        m.id === missionId ? { ...m, status: 'completed' as const } : m
      ));

      onMissionComplete?.(result.weeklyMissionsCompleted);

      // Check for 3 missions egg reward
      if (result.weeklyMissionsCompleted >= 3) {
        const eggResult = await checkMissionsEggReward(result.weeklyMissionsCompleted);
        if (eggResult.awarded) {
          onEggReceived?.();
        }
      }
    }
  };

  const handleSwap = async (missionId: string) => {
    setSwapping(missionId);
    const newMission = await swapMission(missionId);
    if (newMission) {
      setLocalMissions(prev => prev.map(m =>
        m.id === missionId ? newMission : m
      ));
    }
    setSwapping(null);
  };

  const handleUndo = (missionId: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      next.delete(missionId);
      return next;
    });
  };

  return (
    <div className="mission-list">
      <div className="mission-list-header">
        <Target size={18} />
        <h3>{translations.todaysMissions || (language === 'ja' ? '今日のミッション' : "Today's Missions")}</h3>
        {completedCount > 0 && (
          <span className="mission-completed-badge">
            <CheckCircle size={14} />
            {completedCount}
          </span>
        )}
      </div>

      <div className="mission-cards">
        {localMissions.map((mission) => {
          const def = getMissionDefinition(mission.missionDefId);
          if (!def) return null;

          const isCompleted = mission.status === 'completed' || completedIds.has(mission.id);
          const isSwapping = swapping === mission.id;

          return (
            <MissionCard
              key={mission.id}
              mission={mission}
              definition={def}
              isCompleted={isCompleted}
              isSwapping={isSwapping}
              translations={translations}
              language={language}
              onComplete={() => handleComplete(mission.id)}
              onSwap={() => handleSwap(mission.id)}
              onUndo={() => handleUndo(mission.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface MissionCardProps {
  mission: Mission;
  definition: MissionDefinition;
  isCompleted: boolean;
  isSwapping: boolean;
  translations: {
    completed: string;
    xpReward: string;
    eggProgress: string;
    swap: string;
    complete: string;
    undo: string;
    duration: string;
    minutes: string;
    seconds: string;
    [key: string]: string;
  };
  language: 'ja' | 'en';
  onComplete: () => void;
  onSwap: () => void;
  onUndo: () => void;
}

function MissionCard({
  definition,
  isCompleted,
  isSwapping,
  translations,
  language,
  onComplete,
  onSwap,
  onUndo,
}: MissionCardProps) {
  const title = translations[definition.titleKey] || definition.titleKey;
  const description = translations[definition.descriptionKey] || definition.descriptionKey;

  // Get type badge
  const getTypeBadge = () => {
    switch (definition.type) {
      case 'quick':
        return { label: language === 'ja' ? '30秒〜' : '30sec+', color: 'var(--color-success)' };
      case 'medium':
        return { label: language === 'ja' ? '2〜5分' : '2-5min', color: 'var(--color-warning)' };
      case 'weekly':
        return { label: language === 'ja' ? '週次' : 'Weekly', color: 'var(--color-primary)' };
      default:
        return null;
    }
  };

  const typeBadge = getTypeBadge();

  return (
    <div className={`mission-card ${isCompleted ? 'completed' : ''} ${isSwapping ? 'swapping' : ''}`}>
      <div className="mission-card-content">
        <div className="mission-card-header">
          <span className="mission-card-title">{title}</span>
          {typeBadge && (
            <span
              className="mission-card-type-badge"
              style={{ backgroundColor: typeBadge.color }}
            >
              <Clock size={10} />
              {typeBadge.label}
            </span>
          )}
        </div>

        <p className="mission-card-description">{description}</p>

        <div className="mission-card-rewards">
          <span className="mission-card-xp">
            <Sparkles size={12} />
            +{definition.xpReward} XP
          </span>
          <span className="mission-card-egg-progress">
            +{definition.eggProgressReward}% {translations.eggProgress || (language === 'ja' ? '孵化' : 'Hatch')}
          </span>
        </div>

        <div className="mission-card-actions">
          {!isCompleted ? (
            <>
              <button
                className="mission-card-complete-btn"
                onClick={onComplete}
                disabled={isSwapping}
              >
                <CheckCircle size={16} />
                {translations.complete || (language === 'ja' ? '完了' : 'Complete')}
              </button>
              <button
                className="mission-card-swap-btn"
                onClick={onSwap}
                disabled={isSwapping}
              >
                <RefreshCw size={14} className={isSwapping ? 'spinning' : ''} />
                {translations.swap || (language === 'ja' ? '入れ替え' : 'Swap')}
              </button>
            </>
          ) : (
            <div className="mission-card-completed-state">
              <CheckCircle size={18} />
              <span>{translations.completed || (language === 'ja' ? '完了' : 'Completed')}</span>
              <button
                className="mission-card-undo-btn"
                onClick={onUndo}
              >
                {translations.undo || (language === 'ja' ? '取り消す' : 'Undo')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
