import { useState, useEffect } from 'react';
import { Sparkles, Heart, Egg, MessageCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { CompanionSelector } from '../components/companion';
import { getCompanionData, getCompanionSettings, saveCompanionSettings, getCollectionSettings, saveCollectionSettings } from '../lib/storage';
import type { CompanionData, CompanionSettings, CollectionSettings, SupportStyle } from '../types';

export function SettingsPage() {
  const { settings, updateSettings, t } = useSettings();
  const [message, setMessage] = useState('');
  const [companionData, setCompanionData] = useState<CompanionData | null>(null);
  const [companionSettings, setCompanionSettings] = useState<CompanionSettings>({
    enabled: true,
    animationsEnabled: true,
    selectedCompanionId: null,
  });
  const [collectionSettings, setCollectionSettings] = useState<CollectionSettings>({
    showCollection: true,
    showEggProgress: true,
    skipHatchingAnimation: false,
    skipEvolutionAnimation: false,
  });

  useEffect(() => {
    loadCompanionData();
  }, []);

  async function loadCompanionData() {
    const [data, compSettings, collSettings] = await Promise.all([
      getCompanionData(),
      getCompanionSettings(),
      getCollectionSettings(),
    ]);
    setCompanionData(data);
    setCompanionSettings(compSettings);
    setCollectionSettings(collSettings);
  }

  async function handleThemeChange(theme: 'light' | 'dark') {
    await updateSettings({ theme });
    showMessage();
  }

  async function handleLanguageChange(language: 'ja' | 'en') {
    await updateSettings({ language });
    showMessage();
  }

  async function handleGamificationChange(enabled: boolean) {
    await updateSettings({ gamificationEnabled: enabled });
    showMessage();
  }

  async function handleCompanionEnabledChange(enabled: boolean) {
    const newSettings = { ...companionSettings, enabled };
    setCompanionSettings(newSettings);
    await saveCompanionSettings(newSettings);
    showMessage();
  }

  async function handleCompanionAnimationsChange(enabled: boolean) {
    const newSettings = { ...companionSettings, animationsEnabled: enabled };
    setCompanionSettings(newSettings);
    await saveCompanionSettings(newSettings);
    showMessage();
  }

  async function handleSupportStyleChange(style: SupportStyle) {
    await updateSettings({ supportStyle: style });
    showMessage();
  }

  function handleCompanionSelect(data: CompanionData) {
    setCompanionData(data);
    setCompanionSettings(prev => ({ ...prev, selectedCompanionId: data.id }));
    showMessage();
  }

  async function handleCollectionSettingChange<K extends keyof CollectionSettings>(
    key: K,
    value: CollectionSettings[K]
  ) {
    const newSettings = { ...collectionSettings, [key]: value };
    setCollectionSettings(newSettings);
    await saveCollectionSettings(newSettings);
    showMessage();
  }

  function showMessage() {
    setMessage(t.settings.saved);
    setTimeout(() => setMessage(''), 2000);
  }

  return (
    <div className="settings">
      <h2>{t.settings.title}</h2>

      {message && <div className="message success">{message}</div>}

      <div className="settings-section">
        <h3>{t.settings.theme}</h3>
        <div className="theme-options">
          <button className={`option-btn ${settings.theme === 'light' ? 'selected' : ''}`} onClick={() => handleThemeChange('light')}>{t.settings.light}</button>
          <button className={`option-btn ${settings.theme === 'dark' ? 'selected' : ''}`} onClick={() => handleThemeChange('dark')}>{t.settings.dark}</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>{t.settings.language}</h3>
        <div className="language-options">
          <button className={`option-btn ${settings.language === 'ja' ? 'selected' : ''}`} onClick={() => handleLanguageChange('ja')}>日本語</button>
          <button className={`option-btn ${settings.language === 'en' ? 'selected' : ''}`} onClick={() => handleLanguageChange('en')}>English</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-header-with-icon">
          <Sparkles size={18} />
          <h3>{t.settings.gamification}</h3>
        </div>
        <p className="settings-description">{t.settings.gamificationDescription}</p>
        <div className="gamification-options">
          <button
            className={`option-btn ${settings.gamificationEnabled ? 'selected' : ''}`}
            onClick={() => handleGamificationChange(true)}
          >
            {t.settings.gamificationOn}
          </button>
          <button
            className={`option-btn ${!settings.gamificationEnabled ? 'selected' : ''}`}
            onClick={() => handleGamificationChange(false)}
          >
            {t.settings.gamificationOff}
          </button>
        </div>
      </div>

      {/* Companion Settings */}
      <div className="settings-section companion-settings-section">
        <div className="settings-header-with-icon">
          <Heart size={18} />
          <h3>{t.companion.enabled}</h3>
        </div>
        <p className="settings-description">{t.companion.enabledDescription}</p>
        <div className="companion-toggle-options">
          <button
            className={`option-btn ${companionSettings.enabled ? 'selected' : ''}`}
            onClick={() => handleCompanionEnabledChange(true)}
          >
            {t.settings.gamificationOn}
          </button>
          <button
            className={`option-btn ${!companionSettings.enabled ? 'selected' : ''}`}
            onClick={() => handleCompanionEnabledChange(false)}
          >
            {t.settings.gamificationOff}
          </button>
        </div>

        {companionSettings.enabled && (
          <>
            <div className="companion-animation-setting">
              <h4>{t.companion.animations}</h4>
              <p className="settings-description">{t.companion.animationsDescription}</p>
              <div className="companion-toggle-options">
                <button
                  className={`option-btn ${companionSettings.animationsEnabled ? 'selected' : ''}`}
                  onClick={() => handleCompanionAnimationsChange(true)}
                >
                  {t.settings.gamificationOn}
                </button>
                <button
                  className={`option-btn ${!companionSettings.animationsEnabled ? 'selected' : ''}`}
                  onClick={() => handleCompanionAnimationsChange(false)}
                >
                  {t.settings.gamificationOff}
                </button>
              </div>
            </div>

            <div className="companion-support-style-setting">
              <div className="settings-header-with-icon">
                <MessageCircle size={16} />
                <h4>{t.companion.supportStyleSetting}</h4>
              </div>
              <p className="settings-description">{t.companion.supportStyleDescription}</p>
              <div className="support-style-options">
                {(['praise', 'fact', 'empathy', 'minimal'] as SupportStyle[]).map((style) => (
                  <button
                    key={style}
                    className={`support-style-btn ${settings.supportStyle === style ? 'selected' : ''}`}
                    onClick={() => handleSupportStyleChange(style)}
                  >
                    <span className="support-style-name">
                      {t.companion.supportStyles[style]}
                    </span>
                    <span className="support-style-desc">
                      {t.companion.supportStyles[`${style}Desc` as keyof typeof t.companion.supportStyles]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <CompanionSelector
              currentCompanion={companionData}
              onSelect={handleCompanionSelect}
              language={settings.language}
              showCollection={collectionSettings.showCollection}
              skipHatchingAnimation={collectionSettings.skipHatchingAnimation}
              translations={{
                title: t.companion.title,
                selectButton: t.companion.selectButton,
                selected: t.companion.selected,
                personality: t.companion.personality,
                supportStyle: t.companion.supportStyle,
              }}
              eggTranslations={collectionSettings.showCollection ? {
                incubator: t.egg.incubator,
                noEggs: t.egg.noEggs,
                getNewEgg: t.egg.getNewEgg,
                progress: t.egg.progress,
                readyToHatch: t.egg.readyToHatch,
                hatchButton: t.egg.hatchButton,
                maxEggs: t.egg.maxEggs,
                slotsUsed: t.egg.slotsUsed,
                hatched: t.egg.hatched,
                newCompanion: t.egg.newCompanion,
                setAsCompanion: t.egg.setAsCompanion,
                addToCollection: t.egg.addToCollection,
                rare: t.egg.rare,
                eggTypes: t.egg.eggTypes,
                hints: t.egg.hints,
              } : undefined}
              collectionTranslations={collectionSettings.showCollection ? {
                gallery: t.collection.gallery,
                stats: t.collection.stats,
                totalHatched: t.collection.totalHatched,
                uniqueCompanions: t.collection.uniqueCompanions,
                completion: t.collection.completion,
                notYetFound: t.collection.notYetFound,
                stageLabel: t.collection.stageLabel,
                acquiredAt: t.collection.acquiredAt,
                source: t.collection.source,
                empty: t.collection.empty,
                emptyHint: t.collection.emptyHint,
              } : undefined}
            />
          </>
        )}
      </div>

      {/* Collection Settings */}
      <div className="settings-section">
        <div className="settings-header-with-icon">
          <Egg size={18} />
          <h3>{t.collectionSettings.showCollection}</h3>
        </div>
        <p className="settings-description">{t.collectionSettings.showCollectionDescription}</p>
        <div className="gamification-options">
          <button
            className={`option-btn ${collectionSettings.showCollection ? 'selected' : ''}`}
            onClick={() => handleCollectionSettingChange('showCollection', true)}
          >
            {t.settings.gamificationOn}
          </button>
          <button
            className={`option-btn ${!collectionSettings.showCollection ? 'selected' : ''}`}
            onClick={() => handleCollectionSettingChange('showCollection', false)}
          >
            {t.settings.gamificationOff}
          </button>
        </div>

        {collectionSettings.showCollection && (
          <>
            <div className="companion-animation-setting">
              <h4>{t.collectionSettings.showEggProgress}</h4>
              <p className="settings-description">{t.collectionSettings.showEggProgressDescription}</p>
              <div className="companion-toggle-options">
                <button
                  className={`option-btn ${collectionSettings.showEggProgress ? 'selected' : ''}`}
                  onClick={() => handleCollectionSettingChange('showEggProgress', true)}
                >
                  {t.settings.gamificationOn}
                </button>
                <button
                  className={`option-btn ${!collectionSettings.showEggProgress ? 'selected' : ''}`}
                  onClick={() => handleCollectionSettingChange('showEggProgress', false)}
                >
                  {t.settings.gamificationOff}
                </button>
              </div>
            </div>

            <div className="companion-animation-setting">
              <h4>{t.collectionSettings.skipHatchingAnimation}</h4>
              <p className="settings-description">{t.collectionSettings.skipHatchingAnimationDescription}</p>
              <div className="companion-toggle-options">
                <button
                  className={`option-btn ${collectionSettings.skipHatchingAnimation ? 'selected' : ''}`}
                  onClick={() => handleCollectionSettingChange('skipHatchingAnimation', true)}
                >
                  {t.settings.gamificationOn}
                </button>
                <button
                  className={`option-btn ${!collectionSettings.skipHatchingAnimation ? 'selected' : ''}`}
                  onClick={() => handleCollectionSettingChange('skipHatchingAnimation', false)}
                >
                  {t.settings.gamificationOff}
                </button>
              </div>
            </div>

            <div className="companion-animation-setting">
              <h4>{t.collectionSettings.skipEvolutionAnimation}</h4>
              <p className="settings-description">{t.collectionSettings.skipEvolutionAnimationDescription}</p>
              <div className="companion-toggle-options">
                <button
                  className={`option-btn ${collectionSettings.skipEvolutionAnimation ? 'selected' : ''}`}
                  onClick={() => handleCollectionSettingChange('skipEvolutionAnimation', true)}
                >
                  {t.settings.gamificationOn}
                </button>
                <button
                  className={`option-btn ${!collectionSettings.skipEvolutionAnimation ? 'selected' : ''}`}
                  onClick={() => handleCollectionSettingChange('skipEvolutionAnimation', false)}
                >
                  {t.settings.gamificationOff}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
