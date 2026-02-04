import { useState } from 'react';
import { Check, Sparkles, Egg, BookOpen, Users } from 'lucide-react';
import { COMPANIONS, selectCompanion } from '../../lib/storage';
import { Incubator } from './Incubator';
import { Collection } from './Collection';
import { HatchingModal } from './HatchingModal';
import type { CompanionId, CompanionData, HatchingResult } from '../../types';

type TabId = 'select' | 'incubator' | 'collection';

interface CompanionSelectorProps {
  currentCompanion: CompanionData | null;
  onSelect: (data: CompanionData) => void;
  language: 'ja' | 'en';
  showCollection?: boolean;
  skipHatchingAnimation?: boolean;
  translations: {
    title: string;
    selectButton: string;
    selected: string;
    personality: string;
    supportStyle: string;
  };
  eggTranslations?: {
    incubator: string;
    noEggs: string;
    getNewEgg: string;
    progress: string;
    readyToHatch: string;
    hatchButton: string;
    maxEggs: string;
    slotsUsed: string;
    hatched: string;
    newCompanion: string;
    setAsCompanion: string;
    addToCollection: string;
    rare: string;
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
  collectionTranslations?: {
    gallery: string;
    stats: string;
    totalHatched: string;
    uniqueCompanions: string;
    completion: string;
    notYetFound: string;
    stageLabel: string;
    acquiredAt: string;
    source: {
      selected: string;
      hatched: string;
    };
    empty: string;
    emptyHint: string;
  };
}

export function CompanionSelector({
  currentCompanion,
  onSelect,
  language,
  showCollection = true,
  skipHatchingAnimation = false,
  translations,
  eggTranslations,
  collectionTranslations,
}: CompanionSelectorProps) {
  const [selectedId, setSelectedId] = useState<CompanionId | null>(
    currentCompanion?.id || null
  );
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('select');
  const [hatchingResult, setHatchingResult] = useState<HatchingResult | null>(null);

  const companionList = Object.values(COMPANIONS);

  async function handleSelect(id: CompanionId) {
    if (isSelecting) return;
    setIsSelecting(true);

    try {
      const data = await selectCompanion(id);
      setSelectedId(id);
      onSelect(data);
    } finally {
      setIsSelecting(false);
    }
  }

  function handleHatch(result: HatchingResult) {
    setHatchingResult(result);
  }

  function handleHatchingClose() {
    setHatchingResult(null);
  }

  async function handleSetAsCompanion() {
    if (hatchingResult) {
      const data = await selectCompanion(hatchingResult.companionId);
      setSelectedId(hatchingResult.companionId);
      onSelect(data);
    }
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'select', label: translations.title, icon: <Users size={16} /> },
  ];

  if (showCollection && eggTranslations) {
    tabs.push({ id: 'incubator', label: eggTranslations.incubator, icon: <Egg size={16} /> });
  }

  if (showCollection && collectionTranslations) {
    tabs.push({ id: 'collection', label: collectionTranslations.gallery, icon: <BookOpen size={16} /> });
  }

  return (
    <div className="companion-selector">
      {/* Tab Navigation */}
      {tabs.length > 1 && (
        <div className="companion-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`companion-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Select Tab */}
      {activeTab === 'select' && (
        <>
          <div className="companion-selector-header">
            <Sparkles size={20} className="companion-selector-icon" />
            <h3>{translations.title}</h3>
          </div>

          <div className="companion-grid">
            {companionList.map((companion) => {
              const isSelected = selectedId === companion.id;
              return (
                <button
                  key={companion.id}
                  className={`companion-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(companion.id)}
                  disabled={isSelecting}
                  style={{ '--companion-color': companion.color } as React.CSSProperties}
                  aria-label={`Select ${companion.name[language]}`}
                >
                  <div className="companion-card-emoji">
                    {companion.evolutionEmojis[0]}
                  </div>
                  <div className="companion-card-info">
                    <span className="companion-card-name">
                      {companion.name[language]}
                    </span>
                    <span className="companion-card-personality">
                      {companion.personality[language]}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="companion-card-check">
                      <Check size={16} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedId && (
            <div
              className="companion-detail"
              style={{ '--companion-color': COMPANIONS[selectedId].color } as React.CSSProperties}
            >
              <div className="companion-detail-emoji">
                {COMPANIONS[selectedId].evolutionEmojis[0]}
              </div>
              <div className="companion-detail-info">
                <h4>{COMPANIONS[selectedId].name[language]}</h4>
                <p className="companion-detail-description">
                  {COMPANIONS[selectedId].description[language]}
                </p>
                <div className="companion-detail-meta">
                  <span className="companion-detail-label">{translations.supportStyle}:</span>
                  <span className="companion-detail-value">
                    {COMPANIONS[selectedId].supportStyle[language]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Incubator Tab */}
      {activeTab === 'incubator' && eggTranslations && (
        <Incubator
          language={language}
          onHatch={handleHatch}
          onEggCreated={() => {}}
          translations={eggTranslations}
        />
      )}

      {/* Collection Tab */}
      {activeTab === 'collection' && collectionTranslations && (
        <Collection language={language} translations={collectionTranslations} />
      )}

      {/* Hatching Modal */}
      {hatchingResult && eggTranslations && (
        <HatchingModal
          result={hatchingResult}
          language={language}
          skipAnimation={skipHatchingAnimation}
          onClose={handleHatchingClose}
          onSetAsCompanion={handleSetAsCompanion}
          translations={{
            hatched: eggTranslations.hatched,
            newCompanion: eggTranslations.newCompanion,
            setAsCompanion: eggTranslations.setAsCompanion,
            addToCollection: eggTranslations.addToCollection,
            rare: eggTranslations.rare,
          }}
        />
      )}
    </div>
  );
}
