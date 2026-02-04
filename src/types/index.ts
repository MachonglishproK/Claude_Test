export interface NameDisplayProps {
  name: string
  onNameChange: (name: string) => void
}

export interface CounterProps {
  count: number
  onIncrement: () => void
  onDecrement: () => void
  onReset: () => void
}

export interface MemoProps {
  memo: string
  onMemoChange: (memo: string) => void
}

// Weekly Review Dashboard Types
export interface Goal {
  id: string;
  title: string;
  category: 'health' | 'work' | 'learning' | 'personal' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  difficulty: 1 | 2 | 3 | 4 | 5;
  ifThen?: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  weekStart: string;
  mood: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  mealSummary: string;
  exerciseSummary: string;
  exerciseCount: number;
  obstacles: string;
  notes: string;
  createdAt: string;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  weekStart: string;
  done: boolean;
}

export interface WizardDraft {
  step: number;
  data: Record<string, unknown>;
  savedAt: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  language: 'ja' | 'en';
  gamificationEnabled: boolean;
}

// Gamification Types
export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  totalCheckIns: number;
  totalGoalsCompleted: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  type: BadgeType;
  earnedAt: string;
  seen: boolean;
}

export type BadgeType =
  | 'first_checkin'      // 初回記録
  | 'streak_3'           // 3週連続
  | 'streak_5'           // 5週連続
  | 'streak_10'          // 10週連続
  | 'goals_5'            // 目標5個達成
  | 'goals_10'           // 目標10個達成
  | 'goals_25'           // 目標25個達成
  | 'perfect_week'       // 1週間全目標達成
  | 'early_bird';        // 週の前半に記録

export interface WeeklySummaryData {
  weekStart: string;
  goalsCompleted: number;
  totalGoals: number;
  mood: number | null;
  previousMood: number | null;
  streakDays: number;
  newBadges: Badge[];
  encouragement: 'great' | 'good' | 'keep_going' | 'start_fresh';
}

// ===================================
// Companion System Types
// ===================================

export type CompanionId =
  | 'ember'    // Warm, steady - Candle theme
  | 'sprout'   // Patient, growth-focused - Plant theme
  | 'nimbus'   // Dreamy, optimistic - Cloud theme
  | 'pebble'   // Steady, reliable - Stone theme
  | 'ripple'   // Adaptable, flowing - Water theme
  | 'glim'     // Curious, playful - Light theme
  | 'mochi'    // Soft, comforting - Soft theme
  | 'kaze';    // Energetic, adventurous - Wind theme

export type CompanionState =
  | 'sleeping'  // Low activity / early morning
  | 'calm'      // Default/idle state
  | 'happy'     // User completed a goal
  | 'excited'   // User achieved milestone
  | 'focused'   // User is doing check-in
  | 'proud';    // User completed all weekly goals

export type CompanionEvolution = 1 | 2 | 3;

export interface CompanionData {
  id: CompanionId;
  xp: number;
  level: number;
  evolution: CompanionEvolution;
  selectedAt: string;
  lastInteraction: string | null;
}

export interface CompanionInfo {
  id: CompanionId;
  name: { ja: string; en: string };
  description: { ja: string; en: string };
  personality: { ja: string; en: string };
  supportStyle: { ja: string; en: string };
  emoji: string;
  evolutionEmojis: [string, string, string]; // Stage 1, 2, 3
  color: string;
}

export interface CompanionSettings {
  enabled: boolean;
  animationsEnabled: boolean;
  selectedCompanionId: CompanionId | null;
}

// Mission System Types
export type MissionType = 'daily' | 'weekly';
export type MissionStatus = 'active' | 'completed' | 'expired';

export interface Mission {
  id: string;
  type: MissionType;
  titleKey: string; // Translation key
  descriptionKey: string;
  xpReward: number;
  targetCount: number;
  currentCount: number;
  status: MissionStatus;
  createdAt: string;
  expiresAt: string;
}

export interface MissionProgress {
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  lastDailyReset: string;
  lastWeeklyReset: string;
}

// ===================================
// Egg & Collection System Types
// ===================================

export type EggType = 'gentle' | 'energetic' | 'curious';

export interface Egg {
  id: string;
  type: EggType;
  progress: number; // 0-100
  createdAt: string;
  lastProgressAt: string | null;
}

export interface EggTypeInfo {
  type: EggType;
  name: { ja: string; en: string };
  description: { ja: string; en: string };
  emoji: string;
  crackEmoji: string;
  possibleCompanions: CompanionId[]; // Weighted companions for this egg type
}

export interface CollectionEntry {
  companionId: CompanionId;
  stage: CompanionEvolution;
  acquiredAt: string;
  source: 'selected' | 'hatched';
  eggType?: EggType;
}

export interface CollectionData {
  entries: CollectionEntry[];
  eggs: Egg[];
  maxEggs: number; // 1-3
  totalHatched: number;
}

export interface CollectionSettings {
  showCollection: boolean;
  showEggProgress: boolean;
  skipHatchingAnimation: boolean;
  skipEvolutionAnimation: boolean;
}

export interface HatchingResult {
  companionId: CompanionId;
  eggType: EggType;
  isRare: boolean;
}
