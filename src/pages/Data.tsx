import { useRef, useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { exportAllData, importAllData, clearAllData, saveGoals, saveCheckIns, saveGoalProgress } from '../lib/storage';
import type { Goal, CheckIn, GoalProgress } from '../types';

function generateDemoData() {
  const now = new Date();
  const goals: Goal[] = [
    { id: crypto.randomUUID(), title: '毎朝30分のウォーキング', category: 'health', frequency: 'daily', difficulty: 2, ifThen: '朝起きたら、すぐに運動靴を履く', createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    { id: crypto.randomUUID(), title: '週3回の筋トレ', category: 'health', frequency: 'weekly', difficulty: 3, createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString() },
    { id: crypto.randomUUID(), title: '英語学習20分', category: 'learning', frequency: 'daily', difficulty: 2, ifThen: '昼食後に、アプリを開く', createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    { id: crypto.randomUUID(), title: '月1冊の読書', category: 'learning', frequency: 'monthly', difficulty: 2, createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  const checkIns: CheckIn[] = [];
  const progress: GoalProgress[] = [];

  for (let i = 0; i < 8; i++) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - i * 7);
    const day = weekDate.getDay();
    const diff = weekDate.getDate() - day + (day === 0 ? -6 : 1);
    weekDate.setDate(diff);
    weekDate.setHours(0, 0, 0, 0);
    const weekStart = weekDate.toISOString().split('T')[0];

    checkIns.push({
      id: crypto.randomUUID(), weekStart,
      mood: (Math.floor(Math.random() * 3) + 3) as 1|2|3|4|5,
      sleep: (Math.floor(Math.random() * 3) + 2) as 1|2|3|4|5,
      mealSummary: '野菜を多めに摂取。外食は2回程度。',
      exerciseSummary: 'ウォーキングと自宅トレーニング',
      exerciseCount: Math.floor(Math.random() * 4) + 2,
      obstacles: i % 2 === 0 ? '仕事が忙しく時間確保が難しかった' : '',
      notes: '来週はもう少し運動を増やしたい',
      createdAt: new Date(weekDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    });

    goals.forEach((goal) => {
      if (Math.random() > 0.3) {
        progress.push({ id: crypto.randomUUID(), goalId: goal.id, weekStart, done: Math.random() > 0.25 });
      }
    });
  }
  return { goals, checkIns, progress };
}

export function Data() {
  const { t } = useSettings();
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showMessage(msg: string) { setMessage(msg); setTimeout(() => setMessage(''), 3000); }

  async function handleExport() {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-review-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage(t.data.exported);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await importAllData(event.target?.result as string);
        showMessage(t.data.imported);
        window.location.reload();
      } catch { showMessage(t.common.error); }
    };
    reader.readAsText(file);
  }

  async function handleLoadDemo() {
    const { goals, checkIns, progress } = generateDemoData();
    await saveGoals(goals);
    await saveCheckIns(checkIns);
    await saveGoalProgress(progress);
    showMessage(t.data.demoLoaded);
    window.location.reload();
  }

  async function handleClearAll() {
    if (confirm(t.data.confirmClear)) {
      await clearAllData();
      showMessage(t.data.cleared);
      window.location.reload();
    }
  }

  return (
    <div className="data-page">
      <h2>{t.data.title}</h2>
      {message && <div className="message success">{message}</div>}
      <div className="data-actions">
        <div className="action-card"><h3>{t.data.export}</h3><p>Export all data as JSON file</p><button className="btn btn-primary" onClick={handleExport}>{t.data.export}</button></div>
        <div className="action-card"><h3>{t.data.import}</h3><p>Import data from JSON file</p><input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} /><button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>{t.data.importLabel}</button></div>
        <div className="action-card"><h3>{t.data.loadDemo}</h3><p>Load sample data to try the app</p><button className="btn btn-secondary" onClick={handleLoadDemo}>{t.data.loadDemo}</button></div>
        <div className="action-card danger"><h3>{t.data.clearAll}</h3><p>Delete all stored data</p><button className="btn btn-danger" onClick={handleClearAll}>{t.data.clearAll}</button></div>
      </div>
    </div>
  );
}
