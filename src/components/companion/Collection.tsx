import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Egg } from 'lucide-react';
import { COMPANIONS, getCollectionData, getCollectionStats } from '../../lib/storage';
import type { CollectionData, CollectionEntry, CompanionId, CompanionEvolution } from '../../types';

interface CollectionProps {
  language: 'ja' | 'en';
  translations: {
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

interface CollectionStats {
  totalCompanions: number;
  uniqueCompanions: number;
  totalEggs: number;
  eggsHatched: number;
  completionPercentage: number;
}

export function Collection({ language, translations }: CollectionProps) {
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionId | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getCollectionData();
      const statsData = await getCollectionStats();
      setCollectionData(data);
      setStats(statsData);
    }
    loadData();
  }, []);

  if (!collectionData || !stats) {
    return (
      <div className="collection-loading">
        <BookOpen size={24} className="collection-loading-icon" />
      </div>
    );
  }

  // Build collection map: companionId -> stages collected
  const collectedMap = new Map<CompanionId, Set<CompanionEvolution>>();
  collectionData.entries.forEach((entry) => {
    if (!collectedMap.has(entry.companionId)) {
      collectedMap.set(entry.companionId, new Set());
    }
    collectedMap.get(entry.companionId)!.add(entry.stage);
  });

  const allCompanions = Object.values(COMPANIONS);

  return (
    <div className="collection">
      <div className="collection-header">
        <BookOpen size={20} className="collection-icon" />
        <h3>{translations.gallery}</h3>
      </div>

      {/* Stats Section */}
      <div className="collection-stats">
        <div className="collection-stat">
          <TrendingUp size={16} />
          <span className="collection-stat-value">{stats.eggsHatched}</span>
          <span className="collection-stat-label">{translations.totalHatched}</span>
        </div>
        <div className="collection-stat">
          <Egg size={16} />
          <span className="collection-stat-value">{stats.uniqueCompanions}/8</span>
          <span className="collection-stat-label">{translations.uniqueCompanions}</span>
        </div>
        <div className="collection-stat">
          <span className="collection-stat-value">{stats.completionPercentage}%</span>
          <span className="collection-stat-label">{translations.completion}</span>
        </div>
      </div>

      {/* Gallery Grid */}
      {collectionData.entries.length === 0 ? (
        <div className="collection-empty">
          <Egg size={32} className="collection-empty-icon" />
          <p>{translations.empty}</p>
          <p className="collection-empty-hint">{translations.emptyHint}</p>
        </div>
      ) : (
        <div className="collection-gallery">
          {allCompanions.map((companion) => {
            const collected = collectedMap.get(companion.id);
            const hasAny = collected && collected.size > 0;

            return (
              <div
                key={companion.id}
                className={`collection-companion ${hasAny ? 'collected' : 'not-collected'} ${selectedCompanion === companion.id ? 'selected' : ''}`}
                style={{ '--companion-color': companion.color } as React.CSSProperties}
                onClick={() => setSelectedCompanion(hasAny ? companion.id : null)}
              >
                <div className="collection-companion-header">
                  <span className="collection-companion-name">
                    {hasAny ? companion.name[language] : translations.notYetFound}
                  </span>
                </div>

                <div className="collection-stages">
                  {[1, 2, 3].map((stage) => {
                    const hasStage = collected?.has(stage as CompanionEvolution);
                    return (
                      <div
                        key={stage}
                        className={`collection-stage ${hasStage ? 'collected' : ''}`}
                      >
                        <span className="collection-stage-emoji">
                          {hasStage
                            ? companion.evolutionEmojis[stage - 1]
                            : '?'}
                        </span>
                        <span className="collection-stage-number">{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Companion Detail */}
      {selectedCompanion && (
        <CollectionDetail
          companionId={selectedCompanion}
          entries={collectionData.entries.filter(e => e.companionId === selectedCompanion)}
          language={language}
          translations={translations}
          onClose={() => setSelectedCompanion(null)}
        />
      )}
    </div>
  );
}

interface CollectionDetailProps {
  companionId: CompanionId;
  entries: CollectionEntry[];
  language: 'ja' | 'en';
  translations: {
    stageLabel: string;
    acquiredAt: string;
    source: {
      selected: string;
      hatched: string;
    };
  };
  onClose: () => void;
}

function CollectionDetail({
  companionId,
  entries,
  language,
  translations,
  onClose,
}: CollectionDetailProps) {
  const companion = COMPANIONS[companionId];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return language === 'ja'
      ? `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="collection-detail"
      style={{ '--companion-color': companion.color } as React.CSSProperties}
    >
      <button className="collection-detail-close" onClick={onClose}>
        &times;
      </button>

      <div className="collection-detail-header">
        <span className="collection-detail-emoji">
          {companion.evolutionEmojis[entries.length > 0 ? Math.max(...entries.map(e => e.stage)) - 1 : 0]}
        </span>
        <div className="collection-detail-info">
          <h4>{companion.name[language]}</h4>
          <p>{companion.personality[language]}</p>
        </div>
      </div>

      <p className="collection-detail-description">{companion.description[language]}</p>

      <div className="collection-detail-stages">
        <h5>{translations.stageLabel}</h5>
        <div className="collection-detail-stages-grid">
          {[1, 2, 3].map((stage) => {
            const entry = entries.find(e => e.stage === stage);
            return (
              <div
                key={stage}
                className={`collection-detail-stage ${entry ? 'collected' : ''}`}
              >
                <span className="collection-detail-stage-emoji">
                  {entry ? companion.evolutionEmojis[stage - 1] : '?'}
                </span>
                {entry && (
                  <div className="collection-detail-stage-info">
                    <span className="collection-detail-stage-date">
                      {formatDate(entry.acquiredAt)}
                    </span>
                    <span className="collection-detail-stage-source">
                      {translations.source[entry.source]}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
