import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Egg } from 'lucide-react';
import { getCollectionData, EGG_TYPES } from '../../lib/storage';
import type { Egg as EggType } from '../../types';

interface EggProgressCompactProps {
  language: 'ja' | 'en';
  onEggClick?: (eggId: string) => void;
}

export function EggProgressCompact({ language }: EggProgressCompactProps) {
  const [eggs, setEggs] = useState<EggType[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEggs();
  }, []);

  async function loadEggs() {
    const data = await getCollectionData();
    setEggs(data.eggs);
    setLoading(false);
  }

  if (loading) {
    return null;
  }

  if (eggs.length === 0) {
    return (
      <div className="egg-progress-compact egg-progress-empty">
        <Egg size={16} />
        <span className="egg-progress-empty-text">
          {language === 'ja' ? 'たまごがありません' : 'No eggs yet'}
        </span>
        <Link to="/settings" className="egg-progress-get-egg">
          {language === 'ja' ? '取得方法を見る' : 'How to get one'}
        </Link>
      </div>
    );
  }

  const primaryEgg = eggs.reduce((max, egg) =>
    egg.progress > max.progress ? egg : max
  , eggs[0]);

  const eggTypeInfo = EGG_TYPES[primaryEgg.type];
  const isReady = primaryEgg.progress >= 100;

  return (
    <div className="egg-progress-compact">
      <div className="egg-progress-main">
        <span className="egg-progress-emoji">
          {isReady ? eggTypeInfo.crackEmoji : eggTypeInfo.emoji}
        </span>
        <div className="egg-progress-bar-container">
          <div className="egg-progress-bar">
            <div
              className={`egg-progress-fill ${isReady ? 'ready' : ''}`}
              style={{ width: `${primaryEgg.progress}%` }}
            />
          </div>
          <span className="egg-progress-text">
            {primaryEgg.progress}%
          </span>
        </div>
        {isReady && (
          <Link to="/settings" className="egg-hatch-link">
            {language === 'ja' ? '孵化する' : 'Hatch'}
          </Link>
        )}
        {eggs.length > 1 && (
          <span className="egg-count-badge">+{eggs.length - 1}</span>
        )}
      </div>

      {!isReady && (
        <button
          className="egg-hint-toggle"
          onClick={() => setShowHint(!showHint)}
          aria-expanded={showHint}
        >
          {language === 'ja' ? 'どう進める？' : 'How to progress?'}
          {showHint ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}

      {showHint && (
        <div className="egg-hint-content">
          <ul>
            <li>{language === 'ja' ? 'ミッション完了で +2~10%' : 'Mission complete +2-10%'}</li>
            <li>{language === 'ja' ? '週次ふりかえりで +20%' : 'Weekly check-in +20%'}</li>
            <li>{language === 'ja' ? '目標達成で +5%' : 'Goal complete +5%'}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
