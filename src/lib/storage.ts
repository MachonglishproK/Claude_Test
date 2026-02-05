import localforage from 'localforage';
import type { Goal, CheckIn, GoalProgress, WizardDraft, Settings, UserStats, Badge, BadgeType, CompanionData, CompanionSettings, CompanionId, CompanionInfo, MissionProgress, Mission, MissionDefinition, Egg, EggType, EggTypeInfo, CollectionData, CollectionEntry, CollectionSettings, HatchingResult, EggAcquisitionState, GrowthStage } from '../types';
import { GROWTH_STAGE_LEVELS } from '../types';

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
  COMPANION_DATA: 'companion_data',
  COMPANION_SETTINGS: 'companion_settings',
  MISSIONS: 'missions',
  COLLECTION_DATA: 'collection_data',
  COLLECTION_SETTINGS: 'collection_settings',
  EGG_ACQUISITION: 'egg_acquisition',
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
  const defaults: Settings = {
    theme: 'light',
    language: 'ja',
    gamificationEnabled: true,
    companionEnabled: true,
    collectionEnabled: true,
    animationsEnabled: true,
    effectsSkipEnabled: false,
  };
  return settings ? { ...defaults, ...settings } : defaults;
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

// ===================================
// Companion System Functions
// 8 Original Companions (完全オリジナル)
// Growth Stages: たね(Lv1-4) → みならい(Lv5-9) → たつじん(Lv10+)
// Important: どの相棒も「罰しない」「強制しない」
// ===================================

export const COMPANIONS: Record<CompanionId, CompanionInfo> = {
  kotsuri: {
    id: 'kotsuri',
    name: { ja: 'コツリ', en: 'Kotsuri' },
    description: { ja: '穏やかで短文、継続をそっと見守る', en: 'Gentle and brief, quietly watches over your progress' },
    personality: { ja: 'コツコツ型', en: 'Steady & Consistent' },
    supportStyle: { ja: 'いっしょに、ひとつだけ', en: 'Together, just one thing' },
    emoji: '🐢',
    evolutionEmojis: ['🐢', '🐚', '🪷'],
    color: '#78c4a4',
  },
  torai: {
    id: 'torai',
    name: { ja: 'トライ', en: 'Torai' },
    description: { ja: '軽快で小さな挑戦を提案', en: 'Light-hearted, suggests small challenges' },
    personality: { ja: '挑戦型', en: 'Challenge-oriented' },
    supportStyle: { ja: '今日はこれ、いけそう？', en: 'Think you can try this today?' },
    emoji: '🌟',
    evolutionEmojis: ['🌟', '⚡', '🔥'],
    color: '#ff7f50',
  },
  nonbi: {
    id: 'nonbi',
    name: { ja: 'ノンビ', en: 'Nonbi' },
    description: { ja: 'ゆるやかで復帰を温かく歓迎', en: 'Relaxed, warmly welcomes you back' },
    personality: { ja: 'のんびり型', en: 'Easygoing' },
    supportStyle: { ja: 'むりしないでOK', en: 'No pressure, it\'s okay' },
    emoji: '🦥',
    evolutionEmojis: ['🦥', '🌸', '🌈'],
    color: '#b8d4e3',
  },
  kiri: {
    id: 'kiri',
    name: { ja: 'キリッ', en: 'Kiri' },
    description: { ja: '簡潔で次の一手を明確に', en: 'Concise, clarifies your next step' },
    personality: { ja: '集中型', en: 'Focused' },
    supportStyle: { ja: '次はこれ', en: 'Next is this' },
    emoji: '🎯',
    evolutionEmojis: ['🎯', '🔷', '💎'],
    color: '#5b9bd5',
  },
  haruka: {
    id: 'haruka',
    name: { ja: 'ハルカ', en: 'Haruka' },
    description: { ja: '共感力が高く気持ちに寄り添う', en: 'Empathetic, stays close to your feelings' },
    personality: { ja: '気持ち重視型', en: 'Mood-aware' },
    supportStyle: { ja: 'その気持ち、わかる', en: 'I understand that feeling' },
    emoji: '🌙',
    evolutionEmojis: ['🌙', '☁️', '🌊'],
    color: '#9b8ec4',
  },
  mitemi: {
    id: 'mitemi',
    name: { ja: 'ミテミ', en: 'Mitemi' },
    description: { ja: '事実ベースで進捗を可視化', en: 'Fact-based, visualizes your progress' },
    personality: { ja: '見える化型', en: 'Visualization-focused' },
    supportStyle: { ja: '今週はここまで', en: 'This week so far' },
    emoji: '📊',
    evolutionEmojis: ['📊', '🗺️', '🌐'],
    color: '#6c9b7d',
  },
  nikoru: {
    id: 'nikoru',
    name: { ja: 'ニコル', en: 'Nikoru' },
    description: { ja: '明るく称賛が得意', en: 'Bright, great at praising' },
    personality: { ja: '社交型', en: 'Social' },
    supportStyle: { ja: 'いいね！それ最高', en: 'Nice! That\'s awesome' },
    emoji: '🎉',
    evolutionEmojis: ['🎉', '✨', '👑'],
    color: '#ffd93d',
  },
  shibu: {
    id: 'shibu',
    name: { ja: 'シブ', en: 'Shibu' },
    description: { ja: '控えめで静かな達成感を演出', en: 'Reserved, creates quiet sense of achievement' },
    personality: { ja: 'クール型', en: 'Cool & Minimal' },
    supportStyle: { ja: '悪くない', en: 'Not bad' },
    emoji: '🗻',
    evolutionEmojis: ['🗻', '🌑', '⬛'],
    color: '#5c5c5c',
  },
};

const DEFAULT_COMPANION_SETTINGS: CompanionSettings = {
  enabled: true,
  animationsEnabled: true,
  selectedCompanionId: null,
};

export async function getCompanionSettings(): Promise<CompanionSettings> {
  const settings = await localforage.getItem<CompanionSettings>(KEYS.COMPANION_SETTINGS);
  return settings || DEFAULT_COMPANION_SETTINGS;
}

export async function saveCompanionSettings(settings: CompanionSettings): Promise<void> {
  await localforage.setItem(KEYS.COMPANION_SETTINGS, settings);
}

export async function getCompanionData(): Promise<CompanionData | null> {
  return await localforage.getItem<CompanionData>(KEYS.COMPANION_DATA);
}

export async function saveCompanionData(data: CompanionData): Promise<void> {
  await localforage.setItem(KEYS.COMPANION_DATA, data);
}

export async function selectCompanion(companionId: CompanionId): Promise<CompanionData> {
  const existing = await getCompanionData();
  const now = new Date().toISOString();

  const newData: CompanionData = {
    id: companionId,
    xp: existing?.xp || 0,
    level: existing?.level || 1,
    evolution: existing?.evolution || 1,
    selectedAt: now,
    lastInteraction: now,
  };

  await saveCompanionData(newData);

  // Also update companion settings
  const settings = await getCompanionSettings();
  settings.selectedCompanionId = companionId;
  await saveCompanionSettings(settings);

  return newData;
}

// XP calculation: 100 XP per level, max level 30
// Growth stages: たね(Lv1-4) → みならい(Lv5-9) → たつじん(Lv10+)
function calculateLevelFromXP(xp: number): { level: number; evolution: 1 | 2 | 3 } {
  const level = Math.min(30, Math.floor(xp / 100) + 1);
  let evolution: 1 | 2 | 3 = 1;
  // New thresholds: Lv10+ = たつじん(3), Lv5-9 = みならい(2), Lv1-4 = たね(1)
  if (level >= GROWTH_STAGE_LEVELS.tatsujin.min) evolution = 3;
  else if (level >= GROWTH_STAGE_LEVELS.minarai.min) evolution = 2;
  return { level, evolution };
}

export async function addCompanionXP(amount: number): Promise<{ levelUp: boolean; evolved: boolean; newLevel: number; newEvolution: 1 | 2 | 3 }> {
  const data = await getCompanionData();
  if (!data) return { levelUp: false, evolved: false, newLevel: 1, newEvolution: 1 };

  const oldLevel = data.level;
  const oldEvolution = data.evolution;

  data.xp += amount;
  const { level, evolution } = calculateLevelFromXP(data.xp);
  data.level = level;
  data.evolution = evolution;
  data.lastInteraction = new Date().toISOString();

  await saveCompanionData(data);

  return {
    levelUp: level > oldLevel,
    evolved: evolution > oldEvolution,
    newLevel: level,
    newEvolution: evolution,
  };
}

export function getCompanionState(data: CompanionData | null, isInCheckIn: boolean, allGoalsDone: boolean): 'sleeping' | 'calm' | 'happy' | 'excited' | 'focused' | 'proud' {
  if (!data) return 'calm';

  const hour = new Date().getHours();

  // Early morning or late night = sleeping
  if (hour < 6 || hour >= 23) return 'sleeping';

  // In check-in wizard = focused
  if (isInCheckIn) return 'focused';

  // All goals done this week = proud
  if (allGoalsDone) return 'proud';

  // Recently interacted (within 5 minutes) = happy
  if (data.lastInteraction) {
    const lastInteraction = new Date(data.lastInteraction).getTime();
    const now = Date.now();
    if (now - lastInteraction < 5 * 60 * 1000) return 'happy';
  }

  return 'calm';
}

export function getCompanionMessage(
  state: 'sleeping' | 'calm' | 'happy' | 'excited' | 'focused' | 'proud',
  companionId: CompanionId,
  language: 'ja' | 'en'
): string {
  // Messages for each companion - never pressuring, always supportive
  const messages: Record<CompanionId, Record<string, { ja: string; en: string }>> = {
    kotsuri: {
      sleeping: { ja: 'すやすや... 🐢', en: 'zzz... 🐢' },
      calm: { ja: 'いっしょに、ひとつだけ', en: 'Together, just one thing' },
      happy: { ja: 'できたね。えらい', en: 'You did it. Well done' },
      excited: { ja: 'つづいてる！すごいよ', en: 'You\'re keeping at it!' },
      focused: { ja: 'ゆっくり振り返ろう', en: 'Let\'s reflect slowly' },
      proud: { ja: 'また来週も、いっしょに', en: 'See you next week too' },
    },
    torai: {
      sleeping: { ja: '...zzz ⚡', en: '...zzz ⚡' },
      calm: { ja: '今日はこれ、いけそう？', en: 'Think you can try this?' },
      happy: { ja: 'やるじゃん！', en: 'Nice one!' },
      excited: { ja: 'いい感じ！次いってみよう', en: 'Looking good! What\'s next?' },
      focused: { ja: 'チャレンジ中...！', en: 'Challenge in progress...!' },
      proud: { ja: '今週よくがんばった！', en: 'Great effort this week!' },
    },
    nonbi: {
      sleeping: { ja: 'のんびり... 🦥', en: 'relaxing... 🦥' },
      calm: { ja: 'むりしないでOK', en: 'No pressure, it\'s okay' },
      happy: { ja: 'いいペースだね', en: 'Nice pace' },
      excited: { ja: 'おかえり！待ってたよ', en: 'Welcome back! Missed you' },
      focused: { ja: '自分のペースでいいよ', en: 'Go at your own pace' },
      proud: { ja: 'ゆっくりできた？', en: 'Did you take it easy?' },
    },
    kiri: {
      sleeping: { ja: '... 🎯', en: '... 🎯' },
      calm: { ja: '次はこれ', en: 'Next is this' },
      happy: { ja: '完了', en: 'Done' },
      excited: { ja: '効率よく進んでいる', en: 'Moving efficiently' },
      focused: { ja: '集中', en: 'Focus' },
      proud: { ja: '整理できた週だった', en: 'A well-organized week' },
    },
    haruka: {
      sleeping: { ja: 'おやすみ... 🌙', en: 'good night... 🌙' },
      calm: { ja: 'その気持ち、わかる', en: 'I understand that feeling' },
      happy: { ja: 'うれしそう！', en: 'You look happy!' },
      excited: { ja: '調子よさそうだね', en: 'Seems like a good day' },
      focused: { ja: '今の気持ちを大事に', en: 'Cherish how you feel now' },
      proud: { ja: 'いろんな気持ちがあったね', en: 'Many feelings this week' },
    },
    mitemi: {
      sleeping: { ja: '📊 ...', en: '📊 ...' },
      calm: { ja: '今週はここまで', en: 'This week so far' },
      happy: { ja: '進捗あり！', en: 'Progress made!' },
      excited: { ja: 'データが伸びてる', en: 'Numbers are up' },
      focused: { ja: '記録中...', en: 'Recording...' },
      proud: { ja: '可視化できたね', en: 'Nicely visualized' },
    },
    nikoru: {
      sleeping: { ja: 'ふふっ... 💤', en: 'hehe... 💤' },
      calm: { ja: 'いいね！それ最高', en: 'Nice! That\'s awesome' },
      happy: { ja: 'すごーい！！', en: 'Amazing!!' },
      excited: { ja: '最高！パーティーだ！', en: 'Awesome! Let\'s celebrate!' },
      focused: { ja: '応援してるよ！', en: 'Cheering for you!' },
      proud: { ja: '今週もすばらしい！', en: 'Wonderful week!' },
    },
    shibu: {
      sleeping: { ja: '...', en: '...' },
      calm: { ja: '悪くない', en: 'Not bad' },
      happy: { ja: 'まあまあ', en: 'Decent' },
      excited: { ja: 'なかなか', en: 'Impressive' },
      focused: { ja: '...', en: '...' },
      proud: { ja: 'よくやった', en: 'Well done' },
    },
  };

  return messages[companionId][state][language];
}

// Get growth stage from level
export function getGrowthStage(level: number): GrowthStage {
  if (level >= GROWTH_STAGE_LEVELS.tatsujin.min) return 'tatsujin';
  if (level >= GROWTH_STAGE_LEVELS.minarai.min) return 'minarai';
  return 'tane';
}

// Get stage display name
export function getGrowthStageName(stage: GrowthStage, language: 'ja' | 'en'): string {
  const names: Record<GrowthStage, { ja: string; en: string }> = {
    tane: { ja: 'たね', en: 'Seed' },
    minarai: { ja: 'みならい', en: 'Apprentice' },
    tatsujin: { ja: 'たつじん', en: 'Master' },
  };
  return names[stage][language];
}

// ===================================
// Mission System Functions
// 30 Missions: 「30秒〜5分」中心、選べる、押し付けない
// ===================================

// All 30 mission definitions
export const MISSION_DEFINITIONS: MissionDefinition[] = [
  // ========== Quick Missions (30秒〜1分): 10 missions ==========
  { id: 'quick_01', titleKey: 'mission_quick_01', descriptionKey: 'mission_quick_01_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 0.5, xpReward: 5, eggProgressReward: 2 },
  { id: 'quick_02', titleKey: 'mission_quick_02', descriptionKey: 'mission_quick_02_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 0.5, xpReward: 5, eggProgressReward: 2 },
  { id: 'quick_03', titleKey: 'mission_quick_03', descriptionKey: 'mission_quick_03_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 0.5, xpReward: 5, eggProgressReward: 2 },
  { id: 'quick_04', titleKey: 'mission_quick_04', descriptionKey: 'mission_quick_04_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 0.5, xpReward: 5, eggProgressReward: 2 },
  { id: 'quick_05', titleKey: 'mission_quick_05', descriptionKey: 'mission_quick_05_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 0.5, xpReward: 5, eggProgressReward: 2 },
  { id: 'quick_06', titleKey: 'mission_quick_06', descriptionKey: 'mission_quick_06_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 1, xpReward: 5, eggProgressReward: 2 },
  { id: 'quick_07', titleKey: 'mission_quick_07', descriptionKey: 'mission_quick_07_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 0.5, xpReward: 5, eggProgressReward: 2 },
  { id: 'quick_08', titleKey: 'mission_quick_08', descriptionKey: 'mission_quick_08_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 0.5, xpReward: 5, eggProgressReward: 2 },
  { id: 'quick_09', titleKey: 'mission_quick_09', descriptionKey: 'mission_quick_09_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 0.5, xpReward: 5, eggProgressReward: 2 },
  { id: 'quick_10', titleKey: 'mission_quick_10', descriptionKey: 'mission_quick_10_desc', type: 'quick', category: 'quick', difficulty: 1, durationMinutes: 0.5, xpReward: 5, eggProgressReward: 2 },

  // ========== Medium Missions (2〜5分): 10 missions ==========
  { id: 'medium_01', titleKey: 'mission_medium_01', descriptionKey: 'mission_medium_01_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 3, xpReward: 15, eggProgressReward: 5 },
  { id: 'medium_02', titleKey: 'mission_medium_02', descriptionKey: 'mission_medium_02_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 3, xpReward: 15, eggProgressReward: 5 },
  { id: 'medium_03', titleKey: 'mission_medium_03', descriptionKey: 'mission_medium_03_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 2, xpReward: 15, eggProgressReward: 5 },
  { id: 'medium_04', titleKey: 'mission_medium_04', descriptionKey: 'mission_medium_04_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 2, xpReward: 15, eggProgressReward: 5 },
  { id: 'medium_05', titleKey: 'mission_medium_05', descriptionKey: 'mission_medium_05_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 2, xpReward: 15, eggProgressReward: 5 },
  { id: 'medium_06', titleKey: 'mission_medium_06', descriptionKey: 'mission_medium_06_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 2, xpReward: 15, eggProgressReward: 5 },
  { id: 'medium_07', titleKey: 'mission_medium_07', descriptionKey: 'mission_medium_07_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 2, xpReward: 15, eggProgressReward: 5 },
  { id: 'medium_08', titleKey: 'mission_medium_08', descriptionKey: 'mission_medium_08_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 3, xpReward: 15, eggProgressReward: 5 },
  { id: 'medium_09', titleKey: 'mission_medium_09', descriptionKey: 'mission_medium_09_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 2, xpReward: 15, eggProgressReward: 5 },
  { id: 'medium_10', titleKey: 'mission_medium_10', descriptionKey: 'mission_medium_10_desc', type: 'medium', category: 'medium', difficulty: 2, durationMinutes: 5, xpReward: 20, eggProgressReward: 8 },

  // ========== Weekly Missions (週次): 10 missions ==========
  { id: 'weekly_01', titleKey: 'mission_weekly_01', descriptionKey: 'mission_weekly_01_desc', type: 'weekly', category: 'weekly', difficulty: 2, durationMinutes: 5, xpReward: 30, eggProgressReward: 10 },
  { id: 'weekly_02', titleKey: 'mission_weekly_02', descriptionKey: 'mission_weekly_02_desc', type: 'weekly', category: 'weekly', difficulty: 2, durationMinutes: 3, xpReward: 25, eggProgressReward: 8 },
  { id: 'weekly_03', titleKey: 'mission_weekly_03', descriptionKey: 'mission_weekly_03_desc', type: 'weekly', category: 'weekly', difficulty: 2, durationMinutes: 3, xpReward: 25, eggProgressReward: 8 },
  { id: 'weekly_04', titleKey: 'mission_weekly_04', descriptionKey: 'mission_weekly_04_desc', type: 'weekly', category: 'weekly', difficulty: 2, durationMinutes: 3, xpReward: 25, eggProgressReward: 8 },
  { id: 'weekly_05', titleKey: 'mission_weekly_05', descriptionKey: 'mission_weekly_05_desc', type: 'weekly', category: 'weekly', difficulty: 2, durationMinutes: 3, xpReward: 25, eggProgressReward: 8 },
  { id: 'weekly_06', titleKey: 'mission_weekly_06', descriptionKey: 'mission_weekly_06_desc', type: 'weekly', category: 'weekly', difficulty: 2, durationMinutes: 3, xpReward: 25, eggProgressReward: 8 },
  { id: 'weekly_07', titleKey: 'mission_weekly_07', descriptionKey: 'mission_weekly_07_desc', type: 'weekly', category: 'weekly', difficulty: 2, durationMinutes: 2, xpReward: 20, eggProgressReward: 5 },
  { id: 'weekly_08', titleKey: 'mission_weekly_08', descriptionKey: 'mission_weekly_08_desc', type: 'weekly', category: 'weekly', difficulty: 2, durationMinutes: 2, xpReward: 20, eggProgressReward: 5 },
  { id: 'weekly_09', titleKey: 'mission_weekly_09', descriptionKey: 'mission_weekly_09_desc', type: 'weekly', category: 'weekly', difficulty: 1, durationMinutes: 1, xpReward: 15, eggProgressReward: 5 },
  { id: 'weekly_10', titleKey: 'mission_weekly_10', descriptionKey: 'mission_weekly_10_desc', type: 'weekly', category: 'weekly', difficulty: 1, durationMinutes: 1, xpReward: 15, eggProgressReward: 5 },
];

function getTodayStart(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function getWeekStartForMissions(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

// Get mission definition by ID
export function getMissionDefinition(missionDefId: string): MissionDefinition | undefined {
  return MISSION_DEFINITIONS.find(m => m.id === missionDefId);
}

// Generate active missions: 2 today (1 quick + 1 medium/weekly)
function generateActiveMissions(excludeIds: string[] = []): Mission[] {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
  weekEnd.setHours(23, 59, 59, 999);

  const quickMissions = MISSION_DEFINITIONS.filter(m => m.type === 'quick' && !excludeIds.includes(m.id));
  const otherMissions = MISSION_DEFINITIONS.filter(m => m.type !== 'quick' && !excludeIds.includes(m.id));

  const shuffledQuick = [...quickMissions].sort(() => Math.random() - 0.5);
  const shuffledOther = [...otherMissions].sort(() => Math.random() - 0.5);

  const selected: MissionDefinition[] = [];
  if (shuffledQuick.length > 0) selected.push(shuffledQuick[0]);
  if (shuffledOther.length > 0) selected.push(shuffledOther[0]);

  return selected.map(def => ({
    id: crypto.randomUUID(),
    missionDefId: def.id,
    type: def.type,
    status: 'active' as const,
    createdAt: now.toISOString(),
    expiresAt: weekEnd.toISOString(),
  }));
}

const DEFAULT_MISSION_PROGRESS: MissionProgress = {
  activeMissions: [],
  completedToday: [],
  completedThisWeek: [],
  lastDailyReset: '',
  lastWeeklyReset: '',
  weeklyMissionsCompleted: 0,
};

export async function getMissions(): Promise<MissionProgress> {
  const stored = await localforage.getItem<MissionProgress>(KEYS.MISSIONS);
  const todayStart = getTodayStart();
  const weekStart = getWeekStartForMissions();

  if (!stored) {
    const missions: MissionProgress = {
      ...DEFAULT_MISSION_PROGRESS,
      activeMissions: generateActiveMissions(),
      lastDailyReset: todayStart,
      lastWeeklyReset: weekStart,
    };
    await saveMissions(missions);
    return missions;
  }

  let needsSave = false;

  // Reset daily tracking
  if (stored.lastDailyReset !== todayStart) {
    stored.completedToday = [];
    stored.lastDailyReset = todayStart;
    needsSave = true;
  }

  // Reset weekly tracking
  if (stored.lastWeeklyReset !== weekStart) {
    stored.completedThisWeek = [];
    stored.weeklyMissionsCompleted = 0;
    stored.activeMissions = generateActiveMissions();
    stored.lastWeeklyReset = weekStart;
    needsSave = true;
  }

  // Ensure we have 2 active missions
  if (stored.activeMissions.filter(m => m.status === 'active').length < 2) {
    const existingDefIds = stored.activeMissions.map(m => m.missionDefId);
    const newMissions = generateActiveMissions([...existingDefIds, ...stored.completedThisWeek]);
    stored.activeMissions = [...stored.activeMissions.filter(m => m.status === 'active'), ...newMissions].slice(0, 2);
    needsSave = true;
  }

  if (needsSave) {
    await saveMissions(stored);
  }

  return stored;
}

export async function saveMissions(missions: MissionProgress): Promise<void> {
  await localforage.setItem(KEYS.MISSIONS, missions);
}

// Complete a mission
export async function completeMission(missionId: string): Promise<{
  completed: boolean;
  xpEarned: number;
  eggProgressEarned: number;
  weeklyMissionsCompleted: number;
}> {
  const missions = await getMissions();
  const missionIndex = missions.activeMissions.findIndex(m => m.id === missionId);

  if (missionIndex === -1) {
    return { completed: false, xpEarned: 0, eggProgressEarned: 0, weeklyMissionsCompleted: missions.weeklyMissionsCompleted };
  }

  const mission = missions.activeMissions[missionIndex];
  if (mission.status !== 'active') {
    return { completed: false, xpEarned: 0, eggProgressEarned: 0, weeklyMissionsCompleted: missions.weeklyMissionsCompleted };
  }

  const def = getMissionDefinition(mission.missionDefId);
  if (!def) {
    return { completed: false, xpEarned: 0, eggProgressEarned: 0, weeklyMissionsCompleted: missions.weeklyMissionsCompleted };
  }

  // Mark as completed
  mission.status = 'completed';
  mission.completedAt = new Date().toISOString();
  missions.completedToday.push(mission.missionDefId);
  missions.completedThisWeek.push(mission.missionDefId);
  missions.weeklyMissionsCompleted += 1;

  await saveMissions(missions);

  // Add XP to companion
  if (def.xpReward > 0) {
    await addCompanionXP(def.xpReward);
  }

  // Add egg progress
  if (def.eggProgressReward > 0) {
    await addProgressToAllEggs(def.eggProgressReward);
  }

  return {
    completed: true,
    xpEarned: def.xpReward,
    eggProgressEarned: def.eggProgressReward,
    weeklyMissionsCompleted: missions.weeklyMissionsCompleted,
  };
}

// Skip/swap a mission for another
export async function swapMission(missionId: string): Promise<Mission | null> {
  const missions = await getMissions();
  const missionIndex = missions.activeMissions.findIndex(m => m.id === missionId);

  if (missionIndex === -1) return null;

  const oldMission = missions.activeMissions[missionIndex];
  const oldDef = getMissionDefinition(oldMission.missionDefId);

  // Get same type replacement
  const excludeIds = [...missions.activeMissions.map(m => m.missionDefId), ...missions.completedThisWeek, oldMission.missionDefId];
  const sametype = MISSION_DEFINITIONS.filter(m => m.type === oldDef?.type && !excludeIds.includes(m.id));

  if (sametype.length === 0) return null;

  const newDef = sametype[Math.floor(Math.random() * sametype.length)];
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));

  const newMission: Mission = {
    id: crypto.randomUUID(),
    missionDefId: newDef.id,
    type: newDef.type,
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt: weekEnd.toISOString(),
  };

  missions.activeMissions[missionIndex] = newMission;
  await saveMissions(missions);

  return newMission;
}

// ===================================
// Egg & Collection System Functions
// ===================================

export const EGG_TYPES: Record<EggType, EggTypeInfo> = {
  gentle: {
    type: 'gentle',
    name: { ja: 'やさしさのたまご', en: 'Gentle Egg' },
    description: { ja: '穏やかなエネルギーを感じる', en: 'You sense a calm energy' },
    emoji: '🥚',
    crackEmoji: '🐣',
    possibleCompanions: ['kotsuri', 'nonbi', 'haruka', 'shibu'],
  },
  energetic: {
    type: 'energetic',
    name: { ja: 'げんきのたまご', en: 'Energetic Egg' },
    description: { ja: '元気いっぱいに揺れている', en: 'It wiggles energetically' },
    emoji: '🪺',
    crackEmoji: '🐥',
    possibleCompanions: ['torai', 'nikoru', 'kiri', 'mitemi'],
  },
  curious: {
    type: 'curious',
    name: { ja: 'ふしぎのたまご', en: 'Curious Egg' },
    description: { ja: '何が生まれるかわからない', en: 'Who knows what will hatch?' },
    emoji: '✨',
    crackEmoji: '🌟',
    possibleCompanions: ['kotsuri', 'torai', 'nonbi', 'kiri', 'haruka', 'mitemi', 'nikoru', 'shibu'],
  },
};

const DEFAULT_COLLECTION_DATA: CollectionData = {
  entries: [],
  eggs: [],
  maxEggs: 3,
  totalHatched: 0,
};

const DEFAULT_COLLECTION_SETTINGS: CollectionSettings = {
  showCollection: true,
  showEggProgress: true,
  skipHatchingAnimation: false,
  skipEvolutionAnimation: false,
};

export async function getCollectionData(): Promise<CollectionData> {
  const data = await localforage.getItem<CollectionData>(KEYS.COLLECTION_DATA);
  return data || DEFAULT_COLLECTION_DATA;
}

export async function saveCollectionData(data: CollectionData): Promise<void> {
  await localforage.setItem(KEYS.COLLECTION_DATA, data);
}

export async function getCollectionSettings(): Promise<CollectionSettings> {
  const settings = await localforage.getItem<CollectionSettings>(KEYS.COLLECTION_SETTINGS);
  return settings || DEFAULT_COLLECTION_SETTINGS;
}

export async function saveCollectionSettings(settings: CollectionSettings): Promise<void> {
  await localforage.setItem(KEYS.COLLECTION_SETTINGS, settings);
}

export async function createEgg(type?: EggType): Promise<Egg | null> {
  const data = await getCollectionData();

  // Check if max eggs reached
  if (data.eggs.length >= data.maxEggs) {
    return null;
  }

  // Random type if not specified
  const eggType = type || (['gentle', 'energetic', 'curious'] as EggType[])[Math.floor(Math.random() * 3)];

  const egg: Egg = {
    id: crypto.randomUUID(),
    type: eggType,
    progress: 0,
    createdAt: new Date().toISOString(),
    lastProgressAt: null,
  };

  data.eggs.push(egg);
  await saveCollectionData(data);
  return egg;
}

export async function addEggProgress(
  eggId: string,
  amount: number
): Promise<{ egg: Egg | null; readyToHatch: boolean }> {
  const data = await getCollectionData();
  const egg = data.eggs.find(e => e.id === eggId);

  if (!egg) {
    return { egg: null, readyToHatch: false };
  }

  egg.progress = Math.min(100, egg.progress + amount);
  egg.lastProgressAt = new Date().toISOString();

  await saveCollectionData(data);
  return { egg, readyToHatch: egg.progress >= 100 };
}

export async function addProgressToAllEggs(amount: number): Promise<{ eggs: Egg[]; readyToHatch: Egg[] }> {
  const data = await getCollectionData();
  const readyToHatch: Egg[] = [];

  for (const egg of data.eggs) {
    const wasReady = egg.progress >= 100;
    egg.progress = Math.min(100, egg.progress + amount);
    egg.lastProgressAt = new Date().toISOString();

    if (!wasReady && egg.progress >= 100) {
      readyToHatch.push(egg);
    }
  }

  await saveCollectionData(data);
  return { eggs: data.eggs, readyToHatch };
}

export async function hatchEgg(eggId: string): Promise<HatchingResult | null> {
  const data = await getCollectionData();
  const eggIndex = data.eggs.findIndex(e => e.id === eggId);

  if (eggIndex === -1) {
    return null;
  }

  const egg = data.eggs[eggIndex];
  if (egg.progress < 100) {
    return null;
  }

  const eggTypeInfo = EGG_TYPES[egg.type];
  const possibleCompanions = eggTypeInfo.possibleCompanions;

  // Determine companion with slight randomness
  // Rare chance (5%) for any companion regardless of egg type
  const isRare = Math.random() < 0.05;
  let companionId: CompanionId;

  if (isRare) {
    const allCompanions: CompanionId[] = ['kotsuri', 'torai', 'nonbi', 'kiri', 'haruka', 'mitemi', 'nikoru', 'shibu'];
    companionId = allCompanions[Math.floor(Math.random() * allCompanions.length)];
  } else {
    companionId = possibleCompanions[Math.floor(Math.random() * possibleCompanions.length)];
  }

  // Remove egg from list
  data.eggs.splice(eggIndex, 1);

  // Add to collection
  const entry: CollectionEntry = {
    companionId,
    stage: 1,
    acquiredAt: new Date().toISOString(),
    source: 'hatched',
    eggType: egg.type,
  };
  data.entries.push(entry);
  data.totalHatched += 1;

  await saveCollectionData(data);

  return {
    companionId,
    eggType: egg.type,
    isRare,
  };
}

export async function addToCollection(companionId: CompanionId, stage: number, source: 'selected' | 'hatched'): Promise<void> {
  const data = await getCollectionData();

  // Check if already in collection at this stage
  const existing = data.entries.find(
    e => e.companionId === companionId && e.stage === stage
  );

  if (!existing) {
    data.entries.push({
      companionId,
      stage: stage as 1 | 2 | 3,
      acquiredAt: new Date().toISOString(),
      source,
    });
    await saveCollectionData(data);
  }
}

// All companion IDs for reference
export const ALL_COMPANION_IDS: CompanionId[] = ['kotsuri', 'torai', 'nonbi', 'kiri', 'haruka', 'mitemi', 'nikoru', 'shibu'];

export async function getCollectionStats(): Promise<{
  totalCompanions: number;
  uniqueCompanions: number;
  totalEggs: number;
  eggsHatched: number;
  completionPercentage: number;
}> {
  const data = await getCollectionData();
  const totalPossible = ALL_COMPANION_IDS.length * 3; // 8 companions x 3 stages

  const uniqueCompanions = new Set(data.entries.map(e => e.companionId)).size;
  const completionPercentage = Math.round((data.entries.length / totalPossible) * 100);

  return {
    totalCompanions: data.entries.length,
    uniqueCompanions,
    totalEggs: data.eggs.length,
    eggsHatched: data.totalHatched,
    completionPercentage,
  };
}

// Progress values for different actions
export const EGG_PROGRESS_VALUES = {
  taskComplete: 10,
  weeklyCheckin: 20,
  goalComplete: 5,
  dailyVisit: 3,
  missionComplete: 8,
} as const;

// ===================================
// Egg Acquisition System (たまご入手経路)
// MVP: 週次ふりかえり完了 / ミッション3個達成 / 復帰ボーナス
// ===================================

const DEFAULT_EGG_ACQUISITION_STATE: EggAcquisitionState = {
  weeklyReviewEggThisWeek: false,
  missionsEggThisWeek: false,
  lastActiveDate: null,
  acquisitionHistory: [],
};

export async function getEggAcquisitionState(): Promise<EggAcquisitionState> {
  const state = await localforage.getItem<EggAcquisitionState>(KEYS.EGG_ACQUISITION);
  const weekStart = getWeekStartForMissions();

  if (!state) {
    const newState = { ...DEFAULT_EGG_ACQUISITION_STATE };
    await saveEggAcquisitionState(newState);
    return newState;
  }

  // Check if we need to reset weekly flags
  const lastHistory = state.acquisitionHistory[state.acquisitionHistory.length - 1];
  if (!lastHistory || lastHistory.weekStart !== weekStart) {
    // New week - reset weekly flags
    state.weeklyReviewEggThisWeek = false;
    state.missionsEggThisWeek = false;
    await saveEggAcquisitionState(state);
  }

  return state;
}

export async function saveEggAcquisitionState(state: EggAcquisitionState): Promise<void> {
  await localforage.setItem(KEYS.EGG_ACQUISITION, state);
}

// Check and award egg for weekly review completion
export async function checkWeeklyReviewEggReward(): Promise<{
  awarded: boolean;
  eggId?: string;
  reason: 'already_received' | 'max_eggs' | 'awarded';
}> {
  const state = await getEggAcquisitionState();

  // Already received this week
  if (state.weeklyReviewEggThisWeek) {
    return { awarded: false, reason: 'already_received' };
  }

  // Try to create egg
  const egg = await createEgg();
  if (!egg) {
    return { awarded: false, reason: 'max_eggs' };
  }

  // Record acquisition
  state.weeklyReviewEggThisWeek = true;
  state.acquisitionHistory.push({
    source: 'weekly_review',
    weekStart: getWeekStartForMissions(),
    acquiredAt: new Date().toISOString(),
    eggId: egg.id,
  });
  await saveEggAcquisitionState(state);

  return { awarded: true, eggId: egg.id, reason: 'awarded' };
}

// Check and award egg for 3 missions completed this week
export async function checkMissionsEggReward(weeklyMissionsCompleted: number): Promise<{
  awarded: boolean;
  eggId?: string;
  reason: 'not_enough' | 'already_received' | 'max_eggs' | 'awarded';
}> {
  // Need at least 3 missions
  if (weeklyMissionsCompleted < 3) {
    return { awarded: false, reason: 'not_enough' };
  }

  const state = await getEggAcquisitionState();

  // Already received this week
  if (state.missionsEggThisWeek) {
    return { awarded: false, reason: 'already_received' };
  }

  // Try to create egg
  const egg = await createEgg();
  if (!egg) {
    return { awarded: false, reason: 'max_eggs' };
  }

  // Record acquisition
  state.missionsEggThisWeek = true;
  state.acquisitionHistory.push({
    source: 'missions_3',
    weekStart: getWeekStartForMissions(),
    acquiredAt: new Date().toISOString(),
    eggId: egg.id,
  });
  await saveEggAcquisitionState(state);

  return { awarded: true, eggId: egg.id, reason: 'awarded' };
}

// Check and award return bonus egg (7+ days inactive)
export async function checkReturnBonusEgg(): Promise<{
  awarded: boolean;
  eggId?: string;
  daysAway: number;
  reason: 'not_away_long_enough' | 'max_eggs' | 'awarded';
}> {
  const state = await getEggAcquisitionState();
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Calculate days away
  let daysAway = 0;
  if (state.lastActiveDate) {
    const lastActive = new Date(state.lastActiveDate);
    const diffTime = now.getTime() - lastActive.getTime();
    daysAway = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Update last active date
  state.lastActiveDate = today;
  await saveEggAcquisitionState(state);

  // Need 7+ days away for return bonus
  if (daysAway < 7) {
    return { awarded: false, daysAway, reason: 'not_away_long_enough' };
  }

  // Try to create egg
  const egg = await createEgg();
  if (!egg) {
    return { awarded: false, daysAway, reason: 'max_eggs' };
  }

  // Record acquisition
  state.acquisitionHistory.push({
    source: 'return_bonus',
    weekStart: getWeekStartForMissions(),
    acquiredAt: new Date().toISOString(),
    eggId: egg.id,
  });
  await saveEggAcquisitionState(state);

  return { awarded: true, eggId: egg.id, daysAway, reason: 'awarded' };
}

// Track daily activity for return bonus calculation
export async function trackDailyActivity(): Promise<void> {
  const state = await getEggAcquisitionState();
  state.lastActiveDate = new Date().toISOString().split('T')[0];
  await saveEggAcquisitionState(state);
}
