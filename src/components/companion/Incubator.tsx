import { useState, useEffect } from 'react';
import { Egg as EggIcon, Plus, Sparkles } from 'lucide-react';
import { EGG_TYPES, getCollectionData, createEgg, hatchEgg } from '../../lib/storage';
import type { Egg, CollectionData, HatchingResult } from '../../types';

interface IncubatorProps {
  language: 'ja' | 'en';
  onHatch: (result: HatchingResult) => void;
  onEggCreated: () => void;
  translations: {
    incubator: string;
    noEggs: string;
    getNewEgg: string;
    progress: string;
    readyToHatch: string;
    hatchButton: string;
    maxEggs: string;
    slotsUsed: string;
    eggTypes: {
      gentle: string;
      energetic: string;
      curious: string;
    };
    hints: {
      taskComplete: string;
      weeklyCheckin: string;
      goalComplete: string;
    };
  };
}

export function Incubator({
  language,
  onHatch,
  onEggCreated,
  translations,
}: IncubatorProps) {
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [hatchingEggId, setHatchingEggId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getCollectionData();
      setCollectionData(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateEgg() {
    if (isCreating || !collectionData) return;
    if (collectionData.eggs.length >= collectionData.maxEggs) return;

    setIsCreating(true);
    try {
      const egg = await createEgg();
      if (egg) {
        await loadData();
        onEggCreated();
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleHatch(eggId: string) {
    if (hatchingEggId) return;

    setHatchingEggId(eggId);
    try {
      const result = await hatchEgg(eggId);
      if (result) {
        await loadData();
        onHatch(result);
      }
    } finally {
      setHatchingEggId(null);
    }
  }

  if (isLoading || !collectionData) {
    return (
      <div className="incubator-loading">
        <EggIcon size={24} className="incubator-loading-icon" />
      </div>
    );
  }

  const canAddEgg = collectionData.eggs.length < collectionData.maxEggs;

  return (
    <div className="incubator">
      <div className="incubator-header">
        <EggIcon size={20} className="incubator-icon" />
        <h3>{translations.incubator}</h3>
        <span className="incubator-slots">
          {collectionData.eggs.length}/{collectionData.maxEggs} {translations.slotsUsed}
        </span>
      </div>

      {collectionData.eggs.length === 0 ? (
        <div className="incubator-empty">
          <p>{translations.noEggs}</p>
          <button
            className="incubator-add-button"
            onClick={handleCreateEgg}
            disabled={isCreating}
          >
            <Plus size={16} />
            {translations.getNewEgg}
          </button>
        </div>
      ) : (
        <div className="incubator-eggs">
          {collectionData.eggs.map((egg) => (
            <EggCard
              key={egg.id}
              egg={egg}
              language={language}
              translations={translations}
              isHatching={hatchingEggId === egg.id}
              onHatch={() => handleHatch(egg.id)}
            />
          ))}

          {canAddEgg && (
            <button
              className="incubator-add-slot"
              onClick={handleCreateEgg}
              disabled={isCreating}
              aria-label={translations.getNewEgg}
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      )}

      <div className="incubator-hints">
        <p className="incubator-hints-title">{translations.progress}</p>
        <ul className="incubator-hints-list">
          <li>{translations.hints.taskComplete}</li>
          <li>{translations.hints.weeklyCheckin}</li>
          <li>{translations.hints.goalComplete}</li>
        </ul>
      </div>
    </div>
  );
}

interface EggCardProps {
  egg: Egg;
  language: 'ja' | 'en';
  translations: {
    readyToHatch: string;
    hatchButton: string;
    eggTypes: {
      gentle: string;
      energetic: string;
      curious: string;
    };
  };
  isHatching: boolean;
  onHatch: () => void;
}

function EggCard({ egg, language, translations, isHatching, onHatch }: EggCardProps) {
  const eggTypeInfo = EGG_TYPES[egg.type];
  const isReady = egg.progress >= 100;

  const eggTypeName = translations.eggTypes[egg.type as keyof typeof translations.eggTypes];

  return (
    <div className={`egg-card ${isReady ? 'ready' : ''} ${isHatching ? 'hatching' : ''}`}>
      <div className="egg-card-visual">
        <span className={`egg-emoji ${isReady ? 'egg-ready-wobble' : 'egg-idle'}`}>
          {isReady ? eggTypeInfo.crackEmoji : eggTypeInfo.emoji}
        </span>
        {isReady && (
          <div className="egg-sparkles">
            <Sparkles size={12} />
          </div>
        )}
      </div>

      <div className="egg-card-info">
        <span className="egg-card-type">{eggTypeName}</span>
        <p className="egg-card-description">{eggTypeInfo.description[language]}</p>
      </div>

      <div className="egg-card-progress">
        <div className="egg-progress-bar">
          <div
            className="egg-progress-fill"
            style={{ width: `${egg.progress}%` }}
          />
        </div>
        <span className="egg-progress-text">{egg.progress}%</span>
      </div>

      {isReady && (
        <button
          className="egg-hatch-button"
          onClick={onHatch}
          disabled={isHatching}
        >
          {isHatching ? '...' : translations.hatchButton}
        </button>
      )}

      {!isReady && (
        <div className="egg-not-ready">
          <span className="egg-progress-hint">
            {translations.readyToHatch.replace('!', `: ${100 - egg.progress}%`)}
          </span>
        </div>
      )}
    </div>
  );
}

// Compact version for dashboard
interface EggSummaryProps {
  language: 'ja' | 'en';
  translations: {
    incubator: string;
    noEggs: string;
    readyToHatch: string;
  };
}

export function EggSummary({ translations }: EggSummaryProps) {
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);

  useEffect(() => {
    getCollectionData().then(setCollectionData);
  }, []);

  if (!collectionData || collectionData.eggs.length === 0) {
    return null;
  }

  const readyEggs = collectionData.eggs.filter(e => e.progress >= 100);
  const totalProgress = collectionData.eggs.reduce((sum, e) => sum + e.progress, 0);
  const avgProgress = Math.round(totalProgress / collectionData.eggs.length);

  return (
    <div className="egg-summary">
      <div className="egg-summary-icons">
        {collectionData.eggs.map((egg) => {
          const eggTypeInfo = EGG_TYPES[egg.type];
          const isReady = egg.progress >= 100;
          return (
            <span
              key={egg.id}
              className={`egg-summary-icon ${isReady ? 'ready' : ''}`}
              title={`${egg.progress}%`}
            >
              {eggTypeInfo.emoji}
            </span>
          );
        })}
      </div>
      <div className="egg-summary-info">
        {readyEggs.length > 0 ? (
          <span className="egg-summary-ready">
            {readyEggs.length} {translations.readyToHatch}
          </span>
        ) : (
          <span className="egg-summary-progress">{avgProgress}%</span>
        )}
      </div>
    </div>
  );
}
