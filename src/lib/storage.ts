import localforage from 'localforage';
import type { Goal, CheckIn, GoalProgress, WizardDraft, Settings, UserStats, Badge, BadgeType, CompanionData, CompanionSettings, CompanionId, CompanionInfo, MissionProgress, Mission, Egg, EggType, EggTypeInfo, CollectionData, CollectionEntry, CollectionSettings, HatchingResult } from '../types';

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

// ===================================
// Companion System Functions
// ===================================

export const COMPANIONS: Record<CompanionId, CompanionInfo> = {
  ember: {
    id: 'ember',
    name: { ja: 'エンバー', en: 'Ember' },
    description: { ja: '温かく安定した光で照らす', en: 'Illuminates with warm, steady light' },
    personality: { ja: 'コツコツ型', en: 'Steady & Consistent' },
    supportStyle: { ja: '毎日少しずつ、一緒に進もう', en: "Let's take it one step at a time" },
    emoji: '🕯️',
    evolutionEmojis: ['🕯️', '🏮', '🗼'],
    color: '#ff9f43',
  },
  sprout: {
    id: 'sprout',
    name: { ja: 'スプラウト', en: 'Sprout' },
    description: { ja: '成長を見守る優しい存在', en: 'Nurturing your growth gently' },
    personality: { ja: 'じっくり型', en: 'Patient & Nurturing' },
    supportStyle: { ja: '焦らなくていいよ、芽は必ず出る', en: 'No rush, growth takes time' },
    emoji: '🌱',
    evolutionEmojis: ['🌱', '🌿', '🌳'],
    color: '#26de81',
  },
  nimbus: {
    id: 'nimbus',
    name: { ja: 'ニンバス', en: 'Nimbus' },
    description: { ja: '夢を見る雲のような楽観家', en: 'A dreamy cloud with silver linings' },
    personality: { ja: 'ポジティブ型', en: 'Dreamy & Optimistic' },
    supportStyle: { ja: 'きっと大丈夫、空は晴れる', en: "The sky will clear, don't worry" },
    emoji: '☁️',
    evolutionEmojis: ['☁️', '⛅', '🌈'],
    color: '#a29bfe',
  },
  pebble: {
    id: 'pebble',
    name: { ja: 'ペブル', en: 'Pebble' },
    description: { ja: '揺るがない頼れる存在', en: 'Solid and dependable as stone' },
    personality: { ja: '堅実型', en: 'Steady & Reliable' },
    supportStyle: { ja: '一歩一歩、確実に進もう', en: 'One solid step at a time' },
    emoji: '🪨',
    evolutionEmojis: ['🪨', '⛰️', '🏔️'],
    color: '#636e72',
  },
  ripple: {
    id: 'ripple',
    name: { ja: 'リップル', en: 'Ripple' },
    description: { ja: '柔軟に流れる適応力', en: 'Flows and adapts like water' },
    personality: { ja: '柔軟型', en: 'Adaptable & Flowing' },
    supportStyle: { ja: '流れに乗って、自然体でいこう', en: 'Go with the flow, be natural' },
    emoji: '💧',
    evolutionEmojis: ['💧', '🌊', '🌏'],
    color: '#0984e3',
  },
  glim: {
    id: 'glim',
    name: { ja: 'グリム', en: 'Glim' },
    description: { ja: '好奇心いっぱいの小さな光', en: 'A curious little spark of light' },
    personality: { ja: '探求型', en: 'Curious & Playful' },
    supportStyle: { ja: '新しい発見、一緒にしよう！', en: "Let's discover something new!" },
    emoji: '✨',
    evolutionEmojis: ['✨', '🪲', '⭐'],
    color: '#fdcb6e',
  },
  mochi: {
    id: 'mochi',
    name: { ja: 'モチ', en: 'Mochi' },
    description: { ja: 'ふわふわ癒し系のお餅', en: 'Soft and squishy comfort' },
    personality: { ja: '癒し型', en: 'Soft & Comforting' },
    supportStyle: { ja: '無理しないでね、休むのも大事', en: "Don't push too hard, rest is okay" },
    emoji: '🍡',
    evolutionEmojis: ['🍡', '🧁', '☁️'],
    color: '#fd79a8',
  },
  kaze: {
    id: 'kaze',
    name: { ja: 'カゼ', en: 'Kaze' },
    description: { ja: 'エネルギッシュな風の精霊', en: 'An energetic wind spirit' },
    personality: { ja: '行動型', en: 'Energetic & Action-oriented' },
    supportStyle: { ja: 'さあ、今日も駆け抜けよう！', en: "Let's go, full speed ahead!" },
    emoji: '💨',
    evolutionEmojis: ['💨', '🌀', '🌪️'],
    color: '#00cec9',
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

function calculateLevelFromXP(xp: number): { level: number; evolution: 1 | 2 | 3 } {
  const level = Math.min(30, Math.floor(xp / 100) + 1);
  let evolution: 1 | 2 | 3 = 1;
  if (level >= 20) evolution = 3;
  else if (level >= 10) evolution = 2;
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
  const messages: Record<CompanionId, Record<string, { ja: string; en: string }>> = {
    ember: {
      sleeping: { ja: 'zzz... 💤', en: 'zzz... 💤' },
      calm: { ja: '今日も一緒にがんばろう', en: "Let's do our best today" },
      happy: { ja: 'やったね！いい調子！', en: 'Great job! Keep it up!' },
      excited: { ja: 'すごい！ピカピカだね！', en: 'Amazing! You shine bright!' },
      focused: { ja: 'じっくり振り返ろう', en: "Let's reflect carefully" },
      proud: { ja: '今週も最高だったね！', en: 'This week was awesome!' },
    },
    sprout: {
      sleeping: { ja: 'すやすや... 🌙', en: 'sleeping... 🌙' },
      calm: { ja: '今日も少しずつ成長しよう', en: "Let's grow a little today" },
      happy: { ja: '芽が伸びてきたよ！', en: 'The sprout is growing!' },
      excited: { ja: 'ぐんぐん成長中！', en: 'Growing so fast!' },
      focused: { ja: '根を張る時間だね', en: 'Time to put down roots' },
      proud: { ja: '立派に育ったね！', en: "You've grown so well!" },
    },
    nimbus: {
      sleeping: { ja: 'ふわふわ... ☁️', en: 'floating... ☁️' },
      calm: { ja: '今日はいい天気になりそう', en: 'Looks like a nice day' },
      happy: { ja: '虹が見えそう！', en: 'I see a rainbow coming!' },
      excited: { ja: 'わーい！晴れ晴れ！', en: 'Yay! Clear skies!' },
      focused: { ja: '空を見上げて深呼吸', en: 'Look up and breathe deep' },
      proud: { ja: '今週は最高の青空！', en: 'Blue skies all week!' },
    },
    pebble: {
      sleeping: { ja: 'ごろん... 🪨', en: 'resting... 🪨' },
      calm: { ja: '今日も一歩ずつ', en: 'One step at a time today' },
      happy: { ja: '着実に進んでいるね', en: "You're making progress" },
      excited: { ja: '山が動いた！', en: 'Mountains are moving!' },
      focused: { ja: '土台を固めよう', en: "Let's build a solid base" },
      proud: { ja: '揺るがない一週間だった！', en: 'A rock-solid week!' },
    },
    ripple: {
      sleeping: { ja: 'さらさら... 💤', en: 'flowing... 💤' },
      calm: { ja: '流れに身を任せて', en: 'Go with the flow' },
      happy: { ja: '波紋が広がっていく！', en: 'Ripples are spreading!' },
      excited: { ja: '大きな波が来た！', en: 'A big wave is coming!' },
      focused: { ja: '静かな水面で考えよう', en: 'Reflect on calm waters' },
      proud: { ja: '素敵な流れだったね！', en: 'What a beautiful flow!' },
    },
    glim: {
      sleeping: { ja: 'ちかちか... ✨', en: 'flickering... ✨' },
      calm: { ja: '今日は何を発見しよう？', en: 'What will we discover?' },
      happy: { ja: 'キラキラ！見つけた！', en: 'Sparkle! Found it!' },
      excited: { ja: 'ピカーン！すごい発見！', en: 'Wow! Amazing discovery!' },
      focused: { ja: 'じっくり観察中...', en: 'Observing carefully...' },
      proud: { ja: '今週もたくさん発見したね！', en: 'So many discoveries!' },
    },
    mochi: {
      sleeping: { ja: 'もちもち... 💤', en: 'squishy... 💤' },
      calm: { ja: 'のんびりいこうね', en: "Let's take it easy" },
      happy: { ja: 'ふわふわ嬉しい！', en: 'Fluffy and happy!' },
      excited: { ja: 'もっちもちだよ！', en: 'So squishy!' },
      focused: { ja: '深呼吸して、リラックス', en: 'Breathe deep, relax' },
      proud: { ja: 'お疲れさま、よく頑張ったね', en: 'Great work this week!' },
    },
    kaze: {
      sleeping: { ja: 'そよそよ... 💨', en: 'breezy... 💨' },
      calm: { ja: '今日も駆け抜けよう！', en: "Let's run with the wind!" },
      happy: { ja: 'ビューン！いい感じ！', en: 'Whoosh! Feeling great!' },
      excited: { ja: '風に乗って最高速！', en: 'Full speed on the wind!' },
      focused: { ja: '風を読んで集中', en: 'Reading the wind...' },
      proud: { ja: '嵐を乗り越えた！', en: 'Conquered the storm!' },
    },
  };

  return messages[companionId][state][language];
}

// ===================================
// Mission System Functions
// ===================================

const MISSION_TEMPLATES = {
  daily: [
    { titleKey: 'mission_daily_checkin', descriptionKey: 'mission_daily_checkin_desc', xpReward: 20, targetCount: 1 },
    { titleKey: 'mission_complete_goal', descriptionKey: 'mission_complete_goal_desc', xpReward: 15, targetCount: 1 },
    { titleKey: 'mission_visit_dashboard', descriptionKey: 'mission_visit_dashboard_desc', xpReward: 5, targetCount: 1 },
  ],
  weekly: [
    { titleKey: 'mission_weekly_checkin', descriptionKey: 'mission_weekly_checkin_desc', xpReward: 50, targetCount: 1 },
    { titleKey: 'mission_complete_3_goals', descriptionKey: 'mission_complete_3_goals_desc', xpReward: 40, targetCount: 3 },
    { titleKey: 'mission_perfect_week', descriptionKey: 'mission_perfect_week_desc', xpReward: 100, targetCount: 1 },
  ],
};

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

function generateMissions(type: 'daily' | 'weekly'): Mission[] {
  const templates = MISSION_TEMPLATES[type];
  const now = new Date();
  const expiresAt = type === 'daily'
    ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Pick 2-3 random missions for daily, all for weekly
  const count = type === 'daily' ? Math.min(2, templates.length) : templates.length;
  const shuffled = [...templates].sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map((template) => ({
    id: crypto.randomUUID(),
    type,
    titleKey: template.titleKey,
    descriptionKey: template.descriptionKey,
    xpReward: template.xpReward,
    targetCount: template.targetCount,
    currentCount: 0,
    status: 'active' as const,
    createdAt: now.toISOString(),
    expiresAt,
  }));
}

export async function getMissions(): Promise<MissionProgress> {
  const stored = await localforage.getItem<MissionProgress>(KEYS.MISSIONS);
  const todayStart = getTodayStart();
  const weekStart = getWeekStartForMissions();

  if (!stored) {
    const missions: MissionProgress = {
      dailyMissions: generateMissions('daily'),
      weeklyMissions: generateMissions('weekly'),
      lastDailyReset: todayStart,
      lastWeeklyReset: weekStart,
    };
    await saveMissions(missions);
    return missions;
  }

  // Check if we need to reset daily missions
  if (stored.lastDailyReset !== todayStart) {
    stored.dailyMissions = generateMissions('daily');
    stored.lastDailyReset = todayStart;
  }

  // Check if we need to reset weekly missions
  if (stored.lastWeeklyReset !== weekStart) {
    stored.weeklyMissions = generateMissions('weekly');
    stored.lastWeeklyReset = weekStart;
  }

  await saveMissions(stored);
  return stored;
}

export async function saveMissions(missions: MissionProgress): Promise<void> {
  await localforage.setItem(KEYS.MISSIONS, missions);
}

export async function updateMissionProgress(
  missionKey: string,
  increment: number = 1
): Promise<{ completed: Mission[]; xpEarned: number }> {
  const missions = await getMissions();
  const completed: Mission[] = [];
  let xpEarned = 0;

  const updateMission = (mission: Mission) => {
    if (mission.titleKey === missionKey && mission.status === 'active') {
      mission.currentCount = Math.min(mission.currentCount + increment, mission.targetCount);
      if (mission.currentCount >= mission.targetCount) {
        mission.status = 'completed';
        completed.push(mission);
        xpEarned += mission.xpReward;
      }
    }
  };

  missions.dailyMissions.forEach(updateMission);
  missions.weeklyMissions.forEach(updateMission);

  await saveMissions(missions);

  // Add XP to companion if missions completed
  if (xpEarned > 0) {
    await addCompanionXP(xpEarned);
  }

  return { completed, xpEarned };
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
    possibleCompanions: ['sprout', 'mochi', 'nimbus', 'pebble'],
  },
  energetic: {
    type: 'energetic',
    name: { ja: 'げんきのたまご', en: 'Energetic Egg' },
    description: { ja: '元気いっぱいに揺れている', en: 'It wiggles energetically' },
    emoji: '🪺',
    crackEmoji: '🐥',
    possibleCompanions: ['kaze', 'glim', 'ember', 'ripple'],
  },
  curious: {
    type: 'curious',
    name: { ja: 'ふしぎのたまご', en: 'Curious Egg' },
    description: { ja: '何が生まれるかわからない', en: 'Who knows what will hatch?' },
    emoji: '✨',
    crackEmoji: '🌟',
    possibleCompanions: ['ember', 'sprout', 'nimbus', 'pebble', 'ripple', 'glim', 'mochi', 'kaze'],
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
    const allCompanions: CompanionId[] = ['ember', 'sprout', 'nimbus', 'pebble', 'ripple', 'glim', 'mochi', 'kaze'];
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

export async function getCollectionStats(): Promise<{
  totalCompanions: number;
  uniqueCompanions: number;
  totalEggs: number;
  eggsHatched: number;
  completionPercentage: number;
}> {
  const data = await getCollectionData();
  const allCompanions: CompanionId[] = ['ember', 'sprout', 'nimbus', 'pebble', 'ripple', 'glim', 'mochi', 'kaze'];
  const totalPossible = allCompanions.length * 3; // 8 companions x 3 stages

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
