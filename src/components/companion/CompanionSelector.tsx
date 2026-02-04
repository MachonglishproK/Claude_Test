import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { COMPANIONS, selectCompanion } from '../../lib/storage';
import type { CompanionId, CompanionData } from '../../types';

interface CompanionSelectorProps {
  currentCompanion: CompanionData | null;
  onSelect: (data: CompanionData) => void;
  language: 'ja' | 'en';
  translations: {
    title: string;
    selectButton: string;
    selected: string;
    personality: string;
    supportStyle: string;
  };
}

export function CompanionSelector({
  currentCompanion,
  onSelect,
  language,
  translations,
}: CompanionSelectorProps) {
  const [selectedId, setSelectedId] = useState<CompanionId | null>(
    currentCompanion?.id || null
  );
  const [isSelecting, setIsSelecting] = useState(false);

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

  return (
    <div className="companion-selector">
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
    </div>
  );
}
