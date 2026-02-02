import localforage from 'localforage';
import type { Goal, CheckIn, GoalProgress, WizardDraft, Settings } from '../types';

localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'weekly-review-dashboard',
  storeName: 'app_data',
});

const KEYS = {
  GOALS: 'goals',
  CHECKINS: 'checkins',
  PROGRESS: 'goal_progress',
  WIZARD_DRAFT: 'wizard_draft',
  SETTINGS: 'settings',
} as const;

export async function getGoals(): Promise<Goal[]> {
  return (await localforage.getItem<Goal[]>(KEYS.GOALS)) || [];
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await localforage.setItem(KEYS.GOALS, goals);
}

export async function addGoal(goal: Goal): Promise<void> {
  const goals = await getGoals();
  goals.push(goal);
  await saveGoals(goals);
}

export async function updateGoal(updated: Goal): Promise<void> {
  const goals = await getGoals();
  const index = goals.findIndex((g) => g.id === updated.id);
  if (index !== -1) {
    goals[index] = updated;
    await saveGoals(goals);
  }
}

export async function deleteGoal(id: string): Promise<void> {
  const goals = await getGoals();
  await saveGoals(goals.filter((g) => g.id !== id));
}

export async function getCheckIns(): Promise<CheckIn[]> {
  return (await localforage.getItem<CheckIn[]>(KEYS.CHECKINS)) || [];
}

export async function saveCheckIns(checkIns: CheckIn[]): Promise<void> {
  await localforage.setItem(KEYS.CHECKINS, checkIns);
}

export async function addCheckIn(checkIn: CheckIn): Promise<void> {
  const checkIns = await getCheckIns();
  const existingIndex = checkIns.findIndex((c) => c.weekStart === checkIn.weekStart);
  if (existingIndex !== -1) {
    checkIns[existingIndex] = checkIn;
  } else {
    checkIns.push(checkIn);
  }
  await saveCheckIns(checkIns);
}

export async function getGoalProgress(): Promise<GoalProgress[]> {
  return (await localforage.getItem<GoalProgress[]>(KEYS.PROGRESS)) || [];
}

export async function saveGoalProgress(progress: GoalProgress[]): Promise<void> {
  await localforage.setItem(KEYS.PROGRESS, progress);
}

export async function toggleGoalProgress(goalId: string, weekStart: string): Promise<boolean> {
  const progress = await getGoalProgress();
  const existing = progress.find((p) => p.goalId === goalId && p.weekStart === weekStart);

  if (existing) {
    existing.done = !existing.done;
  } else {
    progress.push({
      id: crypto.randomUUID(),
      goalId,
      weekStart,
      done: true,
    });
  }
  await saveGoalProgress(progress);
  return existing ? existing.done : true;
}

export async function getWizardDraft(): Promise<WizardDraft | null> {
  return await localforage.getItem<WizardDraft>(KEYS.WIZARD_DRAFT);
}

export async function saveWizardDraft(draft: WizardDraft): Promise<void> {
  await localforage.setItem(KEYS.WIZARD_DRAFT, draft);
}

export async function clearWizardDraft(): Promise<void> {
  await localforage.removeItem(KEYS.WIZARD_DRAFT);
}

export async function getSettings(): Promise<Settings> {
  const settings = await localforage.getItem<Settings>(KEYS.SETTINGS);
  return settings || { theme: 'light', language: 'ja' };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await localforage.setItem(KEYS.SETTINGS, settings);
}

export async function exportAllData(): Promise<string> {
  const data = {
    goals: await getGoals(),
    checkIns: await getCheckIns(),
    progress: await getGoalProgress(),
    settings: await getSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  if (data.goals) await saveGoals(data.goals);
  if (data.checkIns) await saveCheckIns(data.checkIns);
  if (data.progress) await saveGoalProgress(data.progress);
  if (data.settings) await saveSettings(data.settings);
}

export async function clearAllData(): Promise<void> {
  await localforage.clear();
}
