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

// Support Style for companion messages
export type SupportStyle = 'praise' | 'fact' | 'empathy' | 'minimal';

export interface Settings {
  theme: 'light' | 'dark';
  language: 'ja' | 'en';
  gamificationEnabled: boolean;
  // New settings for companion/collection system
  companionEnabled: boolean;       // Show companion UI
  collectionEnabled: boolean;      // Show collection (eggs/gallery)
  animationsEnabled: boolean;      // Companion animations
  effectsSkipEnabled: boolean;     // Skip hatching/evolution effects
  supportStyle: SupportStyle;      // Companion message style
}

// Growth Stage Names (たね→みならい→たつじん)
export type GrowthStage = 'tane' | 'minarai' | 'tatsujin';
export const GROWTH_STAGE_LEVELS = {
  tane: { min: 1, max: 4 },       // Lv 1-4: たね
  minarai: { min: 5, max: 9 },    // Lv 5-9: みならい
  tatsujin: { min: 10, max: 30 }, // Lv 10+: たつじん
} as const;

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
  | 'kotsuri'  // コツリ - Steady, consistent (コツコツ型)
  | 'torai'    // トライ - Challenge-oriented (挑戦型)
  | 'nonbi'    // ノンビ - Relaxed, gentle (のんびり型)
  | 'kiri'     // キリッ - Focused, clear (集中型)
  | 'haruka'   // ハルカ - Mood-aware, empathetic (気分屋・気持ち重視型)
  | 'mitemi'   // ミテミ - Visualization-focused (見える化型)
  | 'nikoru'   // ニコル - Social, cheerful (社交型)
  | 'shibu';   // シブ - Cool, minimal (クール型)

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
export type MissionType = 'quick' | 'medium' | 'weekly';  // 30秒〜1分 / 2〜5分 / 週次
export type MissionCategory = 'quick' | 'medium' | 'weekly';
export type MissionDifficulty = 1 | 2 | 3;  // Easy / Medium / Hard
export type MissionStatus = 'active' | 'completed' | 'skipped';

export interface Mission {
  id: string;
  missionDefId: string;  // Reference to mission definition
  type: MissionType;
  status: MissionStatus;
  completedAt?: string;
  createdAt: string;
  expiresAt: string;
}

export interface MissionDefinition {
  id: string;
  titleKey: string;       // Translation key
  descriptionKey: string;
  type: MissionType;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  durationMinutes: number;  // Estimated duration
  xpReward: number;
  eggProgressReward: number;
  optionalHintKey?: string;
}

export interface MissionProgress {
  activeMissions: Mission[];     // Currently active missions (2-3 at a time)
  completedToday: string[];      // Mission IDs completed today
  completedThisWeek: string[];   // Mission IDs completed this week
  lastDailyReset: string;
  lastWeeklyReset: string;
  weeklyMissionsCompleted: number;  // Count for egg reward tracking
}

// Egg Acquisition Tracking
export type EggAcquisitionSource =
  | 'weekly_review'    // Weekly review completion
  | 'missions_3'       // 3 missions completed this week
  | 'return_bonus'     // Return after 7+ days
  | 'streak_7'         // 7-week streak (optional extension)
  | 'streak_14'        // 14-week streak (optional extension)
  | 'streak_30';       // 30-week streak (optional extension)

export interface EggAcquisitionRecord {
  source: EggAcquisitionSource;
  weekStart: string;
  acquiredAt: string;
  eggId?: string;  // If egg was actually received
}

export interface EggAcquisitionState {
  weeklyReviewEggThisWeek: boolean;
  missionsEggThisWeek: boolean;
  lastActiveDate: string | null;  // For return bonus tracking
  acquisitionHistory: EggAcquisitionRecord[];
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
