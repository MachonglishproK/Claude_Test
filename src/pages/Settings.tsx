import { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { CompanionSelector } from '../components/companion';
import { getCompanionData, getCompanionSettings, saveCompanionSettings } from '../lib/storage';
import type { CompanionData, CompanionSettings } from '../types';

export function SettingsPage() {
  const { settings, updateSettings, t } = useSettings();
  const [message, setMessage] = useState('');
  const [companionData, setCompanionData] = useState<CompanionData | null>(null);
  const [companionSettings, setCompanionSettings] = useState<CompanionSettings>({
    enabled: true,
    animationsEnabled: true,
    selectedCompanionId: null,
  });

  useEffect(() => {
    loadCompanionData();
  }, []);

  async function loadCompanionData() {
    const [data, settings] = await Promise.all([
      getCompanionData(),
      getCompanionSettings(),
    ]);
    setCompanionData(data);
    setCompanionSettings(settings);
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

  function handleCompanionSelect(data: CompanionData) {
    setCompanionData(data);
    setCompanionSettings(prev => ({ ...prev, selectedCompanionId: data.id }));
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

            <CompanionSelector
              currentCompanion={companionData}
              onSelect={handleCompanionSelect}
              language={settings.language}
              translations={{
                title: t.companion.title,
                selectButton: t.companion.selectButton,
                selected: t.companion.selected,
                personality: t.companion.personality,
                supportStyle: t.companion.supportStyle,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
