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
