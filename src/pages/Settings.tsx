import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';

export function SettingsPage() {
  const { settings, updateSettings, t } = useSettings();
  const [message, setMessage] = useState('');

  async function handleThemeChange(theme: 'light' | 'dark') {
    await updateSettings({ theme });
    showMessage();
  }

  async function handleLanguageChange(language: 'ja' | 'en') {
    await updateSettings({ language });
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
    </div>
  );
}
