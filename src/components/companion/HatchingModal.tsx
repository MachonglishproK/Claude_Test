import { useState, useEffect } from 'react';
import { X, Sparkles, Heart, Users } from 'lucide-react';
import { COMPANIONS, EGG_TYPES, selectCompanion, addToCollection } from '../../lib/storage';
import type { HatchingResult } from '../../types';

interface HatchingModalProps {
  result: HatchingResult;
  language: 'ja' | 'en';
  skipAnimation?: boolean;
  onClose: () => void;
  onSetAsCompanion: () => void;
  translations: {
    hatched: string;
    newCompanion: string;
    setAsCompanion: string;
    addToCollection: string;
    rare: string;
  };
}

type HatchPhase = 'wobble' | 'crack' | 'reveal' | 'complete';

export function HatchingModal({
  result,
  language,
  skipAnimation = false,
  onClose,
  onSetAsCompanion,
  translations,
}: HatchingModalProps) {
  const [phase, setPhase] = useState<HatchPhase>(skipAnimation ? 'complete' : 'wobble');
  const [isSettingCompanion, setIsSettingCompanion] = useState(false);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);

  const companion = COMPANIONS[result.companionId];
  const eggTypeInfo = EGG_TYPES[result.eggType];

  useEffect(() => {
    if (skipAnimation) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setPhase('complete');
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase transitions
    timers.push(setTimeout(() => setPhase('crack'), 800));
    timers.push(setTimeout(() => setPhase('reveal'), 1600));
    timers.push(setTimeout(() => setPhase('complete'), 2400));

    return () => timers.forEach(clearTimeout);
  }, [skipAnimation]);

  async function handleSetAsCompanion() {
    if (isSettingCompanion) return;
    setIsSettingCompanion(true);

    try {
      await selectCompanion(result.companionId);
      await addToCollection(result.companionId, 1, 'hatched');
      onSetAsCompanion();
      onClose();
    } finally {
      setIsSettingCompanion(false);
    }
  }

  async function handleAddToCollection() {
    if (isAddingToCollection) return;
    setIsAddingToCollection(true);

    try {
      await addToCollection(result.companionId, 1, 'hatched');
      onClose();
    } finally {
      setIsAddingToCollection(false);
    }
  }

  return (
    <div className="hatching-modal-overlay" onClick={onClose}>
      <div
        className="hatching-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="hatching-title"
      >
        <button className="hatching-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={`hatching-animation phase-${phase}`}>
          {(phase === 'wobble' || phase === 'crack') && (
            <div className="hatching-egg">
              <span className={`hatching-egg-emoji ${phase}`}>
                {phase === 'crack' ? eggTypeInfo.crackEmoji : eggTypeInfo.emoji}
              </span>
            </div>
          )}

          {(phase === 'reveal' || phase === 'complete') && (
            <div className="hatching-reveal">
              <span
                className="hatching-companion-emoji"
                style={{ '--companion-color': companion.color } as React.CSSProperties}
              >
                {companion.evolutionEmojis[0]}
              </span>
              {result.isRare && (
                <div className="hatching-rare-badge">
                  <Sparkles size={12} />
                  {translations.rare}
                </div>
              )}
            </div>
          )}
        </div>

        {phase === 'complete' && (
          <div className="hatching-content">
            <h2 id="hatching-title" className="hatching-title">
              {translations.hatched}
            </h2>
            <p className="hatching-message">{translations.newCompanion}</p>

            <div
              className="hatching-companion-info"
              style={{ '--companion-color': companion.color } as React.CSSProperties}
            >
              <h3 className="hatching-companion-name">{companion.name[language]}</h3>
              <p className="hatching-companion-personality">
                {companion.personality[language]}
              </p>
              <p className="hatching-companion-description">
                {companion.description[language]}
              </p>
            </div>

            <div className="hatching-actions">
              <button
                className="hatching-action-primary"
                onClick={handleSetAsCompanion}
                disabled={isSettingCompanion || isAddingToCollection}
              >
                <Heart size={16} />
                {translations.setAsCompanion}
              </button>
              <button
                className="hatching-action-secondary"
                onClick={handleAddToCollection}
                disabled={isSettingCompanion || isAddingToCollection}
              >
                <Users size={16} />
                {translations.addToCollection}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
