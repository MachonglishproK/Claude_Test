import localforage from 'localforage';
import type { Goal, CheckIn, GoalProgress, WizardDraft, Settings, UserStats, Badge, BadgeType } from '../types';

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
  USER_STATS: 'user_stats',
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
  return settings || { theme: 'light', language: 'ja', gamificationEnabled: true };
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

// ===================================
// Gamification Functions
// ===================================

const DEFAULT_USER_STATS: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  lastCheckInDate: null,
  totalCheckIns: 0,
  totalGoalsCompleted: 0,
  badges: [],
};

export async function getUserStats(): Promise<UserStats> {
  const stats = await localforage.getItem<UserStats>(KEYS.USER_STATS);
  return stats || DEFAULT_USER_STATS;
}

export async function saveUserStats(stats: UserStats): Promise<void> {
  await localforage.setItem(KEYS.USER_STATS, stats);
}

export async function updateStreakOnCheckIn(weekStart: string): Promise<Badge[]> {
  const stats = await getUserStats();
  const newBadges: Badge[] = [];
  const now = new Date().toISOString();

  // Calculate if this continues a streak
  const lastDate = stats.lastCheckInDate ? new Date(stats.lastCheckInDate) : null;
  const currentDate = new Date(weekStart);

  // Check if within 2 weeks (streak continues)
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
  const isConsecutive = lastDate && (currentDate.getTime() - lastDate.getTime() <= twoWeeksMs);

  if (isConsecutive) {
    stats.currentStreak += 1;
  } else {
    stats.currentStreak = 1;
  }

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  stats.lastCheckInDate = weekStart;
  stats.totalCheckIns += 1;

  // Check for badges
  if (stats.totalCheckIns === 1 && !stats.badges.some(b => b.type === 'first_checkin')) {
    const badge: Badge = { id: crypto.randomUUID(), type: 'first_checkin', earnedAt: now, seen: false };
    stats.badges.push(badge);
    newBadges.push(badge);
  }

  if (stats.currentStreak >= 3 && !stats.badges.some(b => b.type === 'streak_3')) {
    const badge: Badge = { id: crypto.randomUUID(), type: 'streak_3', earnedAt: now, seen: false };
    stats.badges.push(badge);
    newBadges.push(badge);
  }

  if (stats.currentStreak >= 5 && !stats.badges.some(b => b.type === 'streak_5')) {
    const badge: Badge = { id: crypto.randomUUID(), type: 'streak_5', earnedAt: now, seen: false };
    stats.badges.push(badge);
    newBadges.push(badge);
  }

  if (stats.currentStreak >= 10 && !stats.badges.some(b => b.type === 'streak_10')) {
    const badge: Badge = { id: crypto.randomUUID(), type: 'streak_10', earnedAt: now, seen: false };
    stats.badges.push(badge);
    newBadges.push(badge);
  }

  // Check for early bird (check-in in first 3 days of week)
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek >= 1 && dayOfWeek <= 3 && !stats.badges.some(b => b.type === 'early_bird')) {
    const badge: Badge = { id: crypto.randomUUID(), type: 'early_bird', earnedAt: now, seen: false };
    stats.badges.push(badge);
    newBadges.push(badge);
  }

  await saveUserStats(stats);
  return newBadges;
}

export async function updateGoalCompletionStats(): Promise<Badge[]> {
  const stats = await getUserStats();
  const progress = await getGoalProgress();
  const goals = await getGoals();
  const newBadges: Badge[] = [];
  const now = new Date().toISOString();

  const completedCount = progress.filter(p => p.done).length;
  stats.totalGoalsCompleted = completedCount;

  // Check for goal completion badges
  if (completedCount >= 5 && !stats.badges.some(b => b.type === 'goals_5')) {
    const badge: Badge = { id: crypto.randomUUID(), type: 'goals_5', earnedAt: now, seen: false };
    stats.badges.push(badge);
    newBadges.push(badge);
  }

  if (completedCount >= 10 && !stats.badges.some(b => b.type === 'goals_10')) {
    const badge: Badge = { id: crypto.randomUUID(), type: 'goals_10', earnedAt: now, seen: false };
    stats.badges.push(badge);
    newBadges.push(badge);
  }

  if (completedCount >= 25 && !stats.badges.some(b => b.type === 'goals_25')) {
    const badge: Badge = { id: crypto.randomUUID(), type: 'goals_25', earnedAt: now, seen: false };
    stats.badges.push(badge);
    newBadges.push(badge);
  }

  // Check for perfect week
  const { getWeekStart } = await import('./date');
  const currentWeek = getWeekStart();
  const weekProgress = progress.filter(p => p.weekStart === currentWeek);
  const allGoalsDone = goals.length > 0 && goals.every(g =>
    weekProgress.some(p => p.goalId === g.id && p.done)
  );

  if (allGoalsDone && !stats.badges.some(b => b.type === 'perfect_week')) {
    const badge: Badge = { id: crypto.randomUUID(), type: 'perfect_week', earnedAt: now, seen: false };
    stats.badges.push(badge);
    newBadges.push(badge);
  }

  await saveUserStats(stats);
  return newBadges;
}

export async function markBadgesAsSeen(): Promise<void> {
  const stats = await getUserStats();
  stats.badges = stats.badges.map(b => ({ ...b, seen: true }));
  await saveUserStats(stats);
}

export function getBadgeInfo(type: BadgeType): { icon: string; name: { ja: string; en: string }; description: { ja: string; en: string } } {
  const badges: Record<BadgeType, { icon: string; name: { ja: string; en: string }; description: { ja: string; en: string } }> = {
    first_checkin: {
      icon: '🎉',
      name: { ja: '最初の一歩', en: 'First Step' },
      description: { ja: '初めての記録を完了', en: 'Completed your first check-in' },
    },
    streak_3: {
      icon: '🔥',
      name: { ja: '3週連続', en: '3 Week Streak' },
      description: { ja: '3週連続で記録', en: '3 weeks in a row' },
    },
    streak_5: {
      icon: '⭐',
      name: { ja: '5週連続', en: '5 Week Streak' },
      description: { ja: '5週連続で記録', en: '5 weeks in a row' },
    },
    streak_10: {
      icon: '🏆',
      name: { ja: '10週連続', en: '10 Week Streak' },
      description: { ja: '10週連続で記録', en: '10 weeks in a row' },
    },
    goals_5: {
      icon: '✅',
      name: { ja: '目標達成者', en: 'Goal Getter' },
      description: { ja: '目標を5回達成', en: 'Completed 5 goals' },
    },
    goals_10: {
      icon: '💪',
      name: { ja: '継続は力', en: 'Persistent' },
      description: { ja: '目標を10回達成', en: 'Completed 10 goals' },
    },
    goals_25: {
      icon: '👑',
      name: { ja: '達成マスター', en: 'Achievement Master' },
      description: { ja: '目標を25回達成', en: 'Completed 25 goals' },
    },
    perfect_week: {
      icon: '🌟',
      name: { ja: 'パーフェクト週間', en: 'Perfect Week' },
      description: { ja: '1週間で全目標を達成', en: 'Completed all goals in a week' },
    },
    early_bird: {
      icon: '🌅',
      name: { ja: '早起きさん', en: 'Early Bird' },
      description: { ja: '週の前半に記録', en: 'Recorded early in the week' },
    },
  };
  return badges[type];
}
